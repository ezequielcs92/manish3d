import { NextResponse } from "next/server";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { demoProducts } from "@/lib/store/demo-products";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CheckoutItem } from "@/lib/store/types";

/** Si quien compra tiene sesión, el pedido queda atado a su cuenta. */
async function getBuyerId() {
  if (!hasSupabaseEnv()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

type CheckoutPayload = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  shippingAddress: Record<string, string>;
  items: CheckoutItem[];
};

export async function POST(request: Request) {
  const payload = (await request.json()) as CheckoutPayload;

  if (!payload.clientName || !payload.clientPhone || !payload.clientEmail || !payload.items?.length) {
    return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
  }

  const cleanItems = payload.items
    .map((item) => ({ productId: item.productId, quantity: Math.max(1, Number(item.quantity) || 1) }))
    .filter((item) => item.productId);

  if (!cleanItems.length) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  if (!hasSupabaseAdminEnv()) {
    const validDemoItems = cleanItems.filter((item) =>
      demoProducts.some((product) => product.id === item.productId),
    );

    if (!validDemoItems.length) {
      return NextResponse.json({ error: "No se pudieron validar los productos demo." }, { status: 400 });
    }

    return NextResponse.json({
      orderId: "demo-preview",
      initPoint: `${siteUrl}/pedido/demo-preview`,
    });
  }

  const supabase = createAdminClient();
  const productIds = [...new Set(cleanItems.map((item) => item.productId))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, active")
    .in("id", productIds)
    .eq("active", true);

  if (productsError || !products?.length) {
    return NextResponse.json({ error: "No se pudieron validar los productos." }, { status: 400 });
  }

  // Un producto a consultar (precio nulo) nunca se cobra por acá: Number(null)
  // daría 0 y el pedido saldría gratis. Puede llegar desde un carrito guardado
  // antes de que el producto pasara a consulta, por eso se valida en el servidor.
  if (products.some((product) => product.price === null)) {
    return NextResponse.json(
      { error: "Hay productos en tu carrito que se cotizan a consulta. Sacalos y escribinos por ellos." },
      { status: 400 },
    );
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const orderItems = cleanItems.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) return null;
    return {
      product_id: product.id,
      quantity: item.quantity,
      unit_price: Number(product.price),
      name: product.name,
    };
  });

  if (orderItems.some((item) => item === null)) {
    return NextResponse.json({ error: "Hay productos no disponibles en el carrito." }, { status: 400 });
  }

  const validOrderItems = orderItems.filter((item) => item !== null);
  const total = validOrderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const buyerId = await getBuyerId();
  const stockPayload = validOrderItems.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  // Se reserva antes de crear el pedido: si no hay unidades, no queremos dejar
  // un pedido colgado que después haya que cancelar a mano.
  const { error: stockError } = await supabase.rpc("reserve_stock", { items: stockPayload });

  if (stockError) {
    const sinStock = stockError.message?.includes("STOCK_INSUFICIENTE");
    return NextResponse.json(
      {
        error: sinStock
          ? "Nos quedamos sin stock de alguno de los productos mientras comprabas. Revisá el carrito."
          : "No se pudo reservar el stock.",
      },
      { status: sinStock ? 409 : 500 },
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      client_id: buyerId,
      client_name: payload.clientName,
      client_phone: payload.clientPhone,
      client_email: payload.clientEmail,
      channel: "tienda",
      status: "pendiente",
      total,
      shipping_address: payload.shippingAddress,
      payment_status: "pendiente",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    // Sin pedido no hay nada que respalde la reserva: se devuelven las unidades.
    await supabase.rpc("restore_stock", { items: stockPayload });
    return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    validOrderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  );

  if (itemsError) {
    await supabase.rpc("restore_stock", { items: stockPayload });
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "No se pudieron guardar los items." }, { status: 500 });
  }

  // Deshacer todo si no se puede cobrar: sin esto quedaría un pedido "exitoso"
  // sin pago y con stock descontado.
  const cancelarPedido = async () => {
    await supabase.from("order_items").delete().eq("order_id", order.id);
    await supabase.from("orders").delete().eq("id", order.id);
    await supabase.rpc("restore_stock", { items: stockPayload });
  };

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    await cancelarPedido();
    return NextResponse.json(
      { error: "Los pagos online todavía no están habilitados. Escribinos para coordinar tu compra." },
      { status: 503 },
    );
  }

  const preferenceResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: validOrderItems.map((item) => ({
        id: item.product_id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: "ARS",
      })),
      payer: {
        name: payload.clientName,
        email: payload.clientEmail,
        phone: { number: payload.clientPhone },
      },
      external_reference: order.id,
      notification_url: `${siteUrl}/api/webhook/mercadopago`,
      back_urls: {
        success: `${siteUrl}/pedido/${order.id}`,
        pending: `${siteUrl}/pedido/${order.id}`,
        failure: `${siteUrl}/pedido/${order.id}`,
      },
      auto_return: "approved",
    }),
  });

  if (!preferenceResponse.ok) {
    const detalle = await preferenceResponse.text();
    console.error("MercadoPago rechazó la preferencia", preferenceResponse.status, detalle);
    await cancelarPedido();
    return NextResponse.json(
      { error: "No pudimos iniciar el pago. Probá de nuevo en un rato." },
      { status: 502 },
    );
  }

  const preference = await preferenceResponse.json();
  await supabase.from("orders").update({ payment_id: preference.id }).eq("id", order.id);

  return NextResponse.json({ orderId: order.id, initPoint: preference.init_point });
}
