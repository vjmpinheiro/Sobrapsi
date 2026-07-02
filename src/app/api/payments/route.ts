import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import {
  createRenewalPayment,
  getMemberPayments,
  simulatePayment,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { needsRenewal } from "@/lib/membership-status";

export async function GET() {
  try {
    const session = await requireSession();
    const member = await prisma.member.findUnique({ where: { userId: session.userId } });

    if (!member) {
      return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
    }

    const payments = await getMemberPayments(session.userId, member.id);

    return NextResponse.json({
      member: {
        id: member.id,
        registrationNumber: member.registrationNumber,
        status: member.status,
        validUntil: member.validUntil,
        needsRenewal: needsRenewal(member.status, member.validUntil),
      },
      payments,
    });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { action, paymentId } = body;

    const member = await prisma.member.findUnique({ where: { userId: session.userId } });
    if (!member) {
      return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
    }

    if (action === "create_renewal") {
      const payment = await createRenewalPayment(session.userId, member.id);
      return NextResponse.json({ payment });
    }

    if (action === "simulate_pay" && paymentId) {
      const payment = await simulatePayment(paymentId, session.userId);
      return NextResponse.json({ payment, message: "Pagamento confirmado" });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
