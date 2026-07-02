import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getMemberCardByUserId } from "@/lib/membership-card";
import { daysUntilExpiry } from "@/lib/membership-status";

export async function GET() {
  try {
    const session = await requireSession();
    const card = await getMemberCardByUserId(session.userId);

    if (!card) {
      return NextResponse.json({ error: "Carteira não encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      card: {
        ...card,
        daysUntilExpiry: daysUntilExpiry(card.validUntil),
      },
    });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}
