import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSession } from "@/lib/auth";
import {
  createCandidateSession,
  createPendingCandidateSession,
  destroyCandidateSession,
  getCandidateSession,
} from "@/lib/candidate-auth";
import {
  buildPendingApplicationShell,
  getApplicationById,
} from "@/lib/application-guest";
import { isValidCpf } from "@/lib/application-shared";
import { getCpfCandidatureEligibility } from "@/lib/cpf-candidature-eligibility";
import { cpfStartSchema } from "@/lib/validations/application";

export async function POST(request: NextRequest) {
  try {
    const userSession = await getSession();
    if (userSession) {
      return NextResponse.json(
        { error: "Usuários autenticados devem acessar a candidatura pela área logada." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { cpf } = cpfStartSchema.parse(body);
    const normalizedCpf = cpf.replace(/\D/g, "");

    if (!isValidCpf(cpf)) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }

    const eligibility = await getCpfCandidatureEligibility(cpf);

    if (eligibility.action === "blocked") {
      return NextResponse.json(
        {
          error: eligibility.message,
          action: "blocked",
          eligibleAt: eligibility.eligibleAt.toISOString(),
        },
        { status: 403 }
      );
    }

    if (eligibility.action === "approved") {
      return NextResponse.json(
        { error: eligibility.message, action: "approved" },
        { status: 403 }
      );
    }

    if (eligibility.action === "track") {
      return NextResponse.json(
        {
          error: eligibility.message,
          action: "track",
          statusLabel: eligibility.statusLabel,
        },
        { status: 403 }
      );
    }

    if (eligibility.action === "resume") {
      const application = await getApplicationById(eligibility.applicationId);
      if (!application || application.userId) {
        return NextResponse.json(
          { error: "Candidatura não encontrada." },
          { status: 404 }
        );
      }

      await createCandidateSession(application.id);
      return NextResponse.json({ action: "resume", application });
    }

    const existingSession = await getCandidateSession();
    if (existingSession) {
      await destroyCandidateSession();
    }

    await createPendingCandidateSession(normalizedCpf);

    return NextResponse.json({
      action: "create",
      application: buildPendingApplicationShell(normalizedCpf),
      pendingDraft: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao iniciar candidatura." }, { status: 500 });
  }
}
