import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function parseSignature(signature: string) {
  return Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    }),
  );
}

function isValidSignature({
  dataId,
  requestId,
  signature,
}: {
  dataId: string;
  requestId: string;
  signature: string;
}) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const parts = parseSignature(signature);
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1 || !requestId) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(v1, "hex");

  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

/**
 * Estados de MercadoPago llevados a los del pedido. "cancelled" es un pago que
 * nunca se completó; "refunded" y "charged_back" son plata que ya había entrado
 * y volvió, y por eso se tratan distinto: liberan stock y descuentan de la caja.
 */
function mapPaymentStatus(status: string) {
  if (status === "approved") return "pagado";
  if (status === "rejected" || status === "cancelled") return "fallido";
  if (status === "refunded" || status === "charged_back") return "reembolsado";
  return "pendiente";
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json();

  // MercadoPago avisa de varios temas (merchant_order, planes, suscripciones).
  // Solo los de pago traen un id que sirve contra /v1/payments; el resto se
  // confirma con 200 para que no reintente eternamente.
  const topic = String(body?.type ?? body?.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "");
  if (topic && topic !== "payment") {
    return NextResponse.json({ received: true, ignored: topic });
  }

  const dataId = String(body?.data?.id ?? body?.id ?? url.searchParams.get("data.id") ?? "");
  const requestId = request.headers.get("x-request-id") ?? "";
  const signature = request.headers.get("x-signature") ?? "";

  if (!dataId || !isValidSignature({ dataId, requestId, signature })) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "MercadoPago token missing" }, { status: 500 });
  }

  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!paymentResponse.ok) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const payment = await paymentResponse.json();
  const orderId = String(payment.external_reference ?? "");
  const paymentStatus = mapPaymentStatus(String(payment.status ?? ""));

  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();

  // Se lee el estado previo para saber si esta notificación cambia algo: las
  // repeticiones no tienen que volver a devolver stock ni sumar ingresos.
  const { data: pedidoPrevio } = await supabase
    .from("orders")
    .select("payment_status")
    .eq("id", orderId)
    .maybeSingle();

  const estadoPrevio = pedidoPrevio?.payment_status ?? null;

  const cambios: Record<string, string> = {
    payment_status: paymentStatus,
    payment_id: String(payment.id),
  };

  // Un pedido devuelto no tiene que seguir en la cola de producción.
  if (paymentStatus === "reembolsado") {
    cambios.status = "cancelado";
  }

  await supabase.from("orders").update(cambios).eq("id", orderId);

  // Tanto el rechazo como la devolución liberan las unidades reservadas, pero
  // solo la primera vez: MercadoPago repite la misma notificación.
  const liberaStock = paymentStatus === "fallido" || paymentStatus === "reembolsado";

  if (liberaStock && estadoPrevio !== paymentStatus) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (items?.length) {
      await supabase.rpc("restore_stock", { items });
    }
  }

  if (paymentStatus === "reembolsado") {
    // El ingreso original queda asentado; la devolución se registra aparte para
    // que la caja refleje las dos mitades del movimiento.
    const descripcion = `Reembolso MercadoPago ${payment.id}`;
    const { data: yaRegistrado } = await supabase
      .from("transactions")
      .select("id")
      .eq("order_id", orderId)
      .eq("description", descripcion)
      .maybeSingle();

    if (!yaRegistrado) {
      await supabase.from("transactions").insert({
        type: "reembolso",
        amount: Number(payment.transaction_amount_refunded ?? payment.transaction_amount ?? 0),
        description: descripcion,
        order_id: orderId,
      });
    }
  }

  if (paymentStatus === "pagado") {
    // MercadoPago reintenta la misma notificación varias veces. Sin este chequeo,
    // cada reintento sumaría otro ingreso y la caja quedaría inflada.
    const descripcion = `Pago MercadoPago ${payment.id}`;
    const { data: yaRegistrado } = await supabase
      .from("transactions")
      .select("id")
      .eq("order_id", orderId)
      .eq("description", descripcion)
      .maybeSingle();

    if (!yaRegistrado) {
      await supabase.from("transactions").insert({
        type: "ingreso",
        amount: Number(payment.transaction_amount ?? 0),
        description: descripcion,
        order_id: orderId,
      });
    }
  }

  return NextResponse.json({ received: true });
}
