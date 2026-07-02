import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { hashPassword } from "@/lib/users";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/application";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "E-mail já cadastrado" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "candidate",
        person: {
          create: {
            fullName: data.fullName,
            email,
          },
        },
        consents: {
          create: {
            consentType: "privacy_policy",
            version: "1.0",
          },
        },
      },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar conta. Verifique se o banco de dados está ativo." },
      { status: 500 }
    );
  }
}
