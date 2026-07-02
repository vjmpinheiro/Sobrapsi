import { NextRequest, NextResponse } from "next/server";
import { searchPublicMembers } from "@/lib/members";
import type { MemberCategory, MemberStatus } from "@/lib/member-types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filters = {
    name: searchParams.get("name") ?? undefined,
    registrationNumber: searchParams.get("registrationNumber") ?? undefined,
    state: searchParams.get("state") ?? undefined,
    category: searchParams.get("category") as MemberCategory | undefined,
    status: searchParams.get("status") as MemberStatus | undefined,
  };

  const members = await searchPublicMembers(filters);

  return NextResponse.json({ members });
}
