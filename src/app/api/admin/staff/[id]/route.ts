import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaffPermission, staffAuthErrorResponse } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/users";
import { prisma } from "@/lib/prisma";

const updateStaffSchema = z.object({
  fullName: z.string().min(2).optional(),
  role: z.enum(["secretaria", "editor"]).optional(),
  staffEditor: z.boolean().optional(),
  password: z.string().min(8).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffPermission(request, "staff-management");
    const { id } = await params;
    const body = await request.json();
    const data = updateStaffSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id },
      include: { person: true },
    });

    if (!user || !["secretaria", "editor", "reviewer", "finance"].includes(user.role)) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    if (user.role === "admin" || user.role === "superadmin") {
      return NextResponse.json({ error: "Não é possível alterar administradores por aqui" }, { status: 403 });
    }

    const passwordHash = data.password ? await hashPassword(data.password) : undefined;
    const staffEditor =
      data.role === "editor"
        ? false
        : data.staffEditor ?? (data.role === "secretaria" ? user.staffEditor : false);

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.role ? { role: data.role, staffEditor } : {}),
        ...(data.staffEditor !== undefined && user.role === "secretaria"
          ? { staffEditor: data.staffEditor }
          : {}),
        ...(passwordHash ? { passwordHash } : {}),
        ...(data.active === false
          ? { passwordHash: null }
          : data.active === true && !user.passwordHash && data.password
            ? { passwordHash }
            : {}),
        ...(data.fullName && user.person
          ? {
              person: {
                update: { fullName: data.fullName },
              },
            }
          : {}),
      },
      include: { person: true },
    });

    return NextResponse.json({
      staff: {
        id: updated.id,
        email: updated.email,
        fullName: updated.person?.fullName ?? updated.email,
        role: updated.role,
        staffEditor: updated.staffEditor,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    return staffAuthErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffPermission(request, "staff-management");
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }
    if (user.role === "admin" || user.role === "superadmin") {
      return NextResponse.json({ error: "Não é possível remover administradores" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return staffAuthErrorResponse(error);
  }
}
