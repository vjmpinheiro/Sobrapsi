import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSession } from "@/lib/auth";
import { isValidCpf } from "@/lib/application-shared";
import {
  formatCpfValidationResponse,
  getCpfCandidatureEligibility,
} from "@/lib/cpf-candidature-eligibility";
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

    if (!isValidCpf(cpf)) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }

    const eligibility = await getCpfCandidatureEligibility(cpf);
    const response = formatCpfValidationResponse(eligibility);

    if (response.action === "blocked" || response.action === "approved") {
      return NextResponse.json(response, { status: 403 });
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao validar CPF." }, { status: 500 });
  }
}
