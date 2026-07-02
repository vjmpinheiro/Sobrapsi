import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createTrackingSession,
  destroyTrackingSession,
  getTrackingSession,
} from "@/lib/candidate-tracking-auth";
import {
  findApplicationByCpfAndBirthYear,
  getTrackingForSession,
  buildTrackingView,
} from "@/lib/candidate-tracking";
import { normalizeCpf } from "@/lib/application-shared";

const verifySchema = z.object({
  cpf: z.string().min(11, "CPF inválido"),
  birthYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
});

export async function GET() {
  const session = await getTrackingSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const tracking = await getTrackingForSession(session.applicationId);
  if (!tracking) {
    return NextResponse.json({ error: "Candidatura não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ tracking });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = verifySchema.parse(body);

    const application = await findApplicationByCpfAndBirthYear(
      normalizeCpf(data.cpf),
      data.birthYear
    );

    if (!application) {
      return NextResponse.json(
        { error: "Nenhuma candidatura encontrada com estes dados." },
        { status: 404 }
      );
    }

    await createTrackingSession(application.id);

    return NextResponse.json({
      tracking: buildTrackingView(application),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao consultar candidatura" }, { status: 500 });
  }
}

export async function DELETE() {
  await destroyTrackingSession();
  return NextResponse.json({ ok: true });
}
