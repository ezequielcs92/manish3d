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

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json();
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
  const paymentStatus = payment.status === "approved" ? "pagado" : payment.status === "rejected" ? "fallido" : "pendiente";

  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();
  await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      payment_id: String(payment.id),
    })
    .eq("id", orderId);

  if (paymentStatus === "pagado") {
    await supabase.from("transactions").insert({
      type: "ingreso",
      amount: Number(payment.transaction_amount ?? 0),
      description: `Pago MercadoPago ${payment.id}`,
      order_id: orderId,
    });
  }

  return NextResponse.json({ received: true });
}
