import { NextRequest, NextResponse } from "next/server";
import { listMembersForAdmin } from "@/lib/admin-members";
import { requireStaffPermission, staffAuthErrorResponse } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    await requireStaffPermission(request, "secretariat");

    const members = await listMembersForAdmin();

    const stats = {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.status === "active").length,
      expiredMembers: members.filter((m) => m.status === "expired").length,
      suspendedMembers: members.filter((m) => m.status === "suspended").length,
    };

    return NextResponse.json({ members, stats });
  } catch (error) {
    return staffAuthErrorResponse(error);
  }
}
