import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  canAccessEditorial,
  canAccessSecretariat,
  canManageStaff,
  staffRoleLabel,
} from "@/lib/staff-permissions";

export async function GET() {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { person: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const staffEditor = user.staffEditor;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.person?.fullName ?? user.email,
      role: user.role,
      staffEditor,
      roleLabel: staffRoleLabel(user.role, staffEditor),
    },
    permissions: {
      secretariat: canAccessSecretariat(user.role),
      editorial: canAccessEditorial(user.role, staffEditor),
      staffManagement: canManageStaff(user.role),
    },
  });
}
