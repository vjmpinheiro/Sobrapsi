import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { getUserByEmail, verifyPassword } from "@/lib/users";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/staff-permissions";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await getUserByEmail(data.email);
    if (!user?.passwordHash || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "E-mail ou senha inválidos" }, { status: 401 });
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "E-mail ou senha inválidos" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      staffEditor: user.staffEditor,
    });

    return NextResponse.json({
      ok: true,
      role: user.role,
      staffEditor: user.staffEditor,
    });
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}
