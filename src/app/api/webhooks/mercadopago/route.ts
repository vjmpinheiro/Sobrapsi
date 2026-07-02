import { NextRequest, NextResponse } from "next/server";
import { syncMercadoPagoProviderPayment } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const providerPaymentId =
      body?.data?.id ??
      request.nextUrl.searchParams.get("data.id") ??
      request.nextUrl.searchParams.get("id");

    if (!providerPaymentId) {
      return NextResponse.json({ ok: true });
    }

    await syncMercadoPagoProviderPayment(providerPaymentId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[mercadopago webhook]", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
