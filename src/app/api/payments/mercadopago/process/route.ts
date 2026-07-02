import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { processMercadoPagoCheckout } from "@/lib/payments";

const processSchema = z.object({
  paymentId: z.string().min(1),
  pricingMethod: z.enum(["card", "pix_boleto"]),
  formData: z.record(z.unknown()),
  cardBin: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = processSchema.parse(body);
    const result = await processMercadoPagoCheckout(data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Erro ao processar pagamento";
    const status = message.includes("autorizado") || message.includes("Não autorizado") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
