import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { ensureCardPdf } from "@/lib/membership-card";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireSession();

    const member = await prisma.member.findUnique({
      where: { userId: session.userId },
    });

    if (!member) {
      return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
    }

    const result = await ensureCardPdf(member.id);
    if (!result?.pdfBuffer) {
      return NextResponse.json({ error: "PDF não disponível" }, { status: 404 });
    }

    return new NextResponse(result.pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="carteira-${member.registrationNumber}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}
