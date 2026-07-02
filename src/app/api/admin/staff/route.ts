import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { UserRole } from "@prisma/client";
import { requireStaffPermission, staffAuthErrorResponse } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/users";
import { prisma } from "@/lib/prisma";
import { staffRoleLabel } from "@/lib/staff-permissions";

const createStaffSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(["secretaria", "editor"]),
  staffEditor: z.boolean().optional(),
});

function serializeStaff(user: {
  id: string;
  email: string;
  role: UserRole;
  staffEditor: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  person: { fullName: string } | null;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.person?.fullName ?? user.email,
    role: user.role,
    staffEditor: user.staffEditor,
    roleLabel: staffRoleLabel(user.role, user.staffEditor),
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireStaffPermission(request, "staff-management");

    const staff = await prisma.user.findMany({
      where: {
        role: { in: ["secretaria", "editor"] },
      },
      include: { person: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      staff: staff.map(serializeStaff),
    });
  } catch (error) {
    return staffAuthErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireStaffPermission(request, "staff-management");
    const body = await request.json();
    const data = createStaffSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);
    const staffEditor = data.role === "secretaria" ? Boolean(data.staffEditor) : false;

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role,
        staffEditor,
        person: {
          create: {
            fullName: data.fullName,
            email: data.email.toLowerCase().trim(),
          },
        },
      },
      include: { person: true },
    });

    return NextResponse.json({ staff: serializeStaff(user) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    return staffAuthErrorResponse(error);
  }
}
