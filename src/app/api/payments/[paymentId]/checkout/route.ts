import { NextRequest, NextResponse } from "next/server";
import { getPaymentCheckoutConfig } from "@/lib/payments";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const config = await getPaymentCheckoutConfig(paymentId);
    return NextResponse.json(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar checkout";
    const status = message.includes("autorizado") || message.includes("Não autorizado") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
