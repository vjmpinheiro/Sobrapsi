import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyActivationToken } from "@/lib/auth";
import { hashPassword } from "@/lib/users";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const activateSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = activateSchema.parse(body);
    const payload = await verifyActivationToken(data.token);

    if (!payload) {
      return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { person: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.passwordHash) {
      return NextResponse.json(
        { error: "Esta conta já foi ativada. Faça login." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(data.password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}
