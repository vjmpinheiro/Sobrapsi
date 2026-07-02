import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getUserByCpf, verifyLoginPassword } from "@/lib/users";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/application";
import { normalizeCpf } from "@/lib/application-shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await getUserByCpf(normalizeCpf(data.cpf));
    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "CPF ou senha inválidos" },
        { status: 401 }
      );
    }

    const valid = await verifyLoginPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "CPF ou senha inválidos" },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });

    return NextResponse.json({
      ok: true,
      role: user.role,
      hasMember: !!user.member,
      mustChangePassword: user.mustChangePassword,
    });
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}
