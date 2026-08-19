import { NextResponse } from "next/server";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { demoProducts } from "@/lib/store/demo-products";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CheckoutItem } from "@/lib/store/types";

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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
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
    return NextResponse.json({ error: "No se pudieron guardar los items." }, { status: 500 });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json({ orderId: order.id, initPoint: `${siteUrl}/pedido/${order.id}` });
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
    return NextResponse.json({ orderId: order.id, initPoint: `${siteUrl}/pedido/${order.id}` });
  }

  const preference = await preferenceResponse.json();
  await supabase.from("orders").update({ payment_id: preference.id }).eq("id", order.id);

  return NextResponse.json({ orderId: order.id, initPoint: preference.init_point });
}
