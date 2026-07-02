import { NextRequest, NextResponse } from "next/server";
import { processMembershipStatuses } from "@/lib/membership-status";

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET ?? process.env.ADMIN_SECRET;
  const auth = request.headers.get("authorization");

  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await processMembershipStatuses();
  return NextResponse.json({ ok: true, results });
}
