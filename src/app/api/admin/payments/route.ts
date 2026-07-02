import { NextRequest, NextResponse } from "next/server";
import { confirmPayment, getPendingPayments, getRecentlyPaidPayments } from "@/lib/payments";
import { requireStaffPermission, staffAuthErrorResponse } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    await requireStaffPermission(request, "secretariat");
    const [payments, recentPaid] = await Promise.all([
      getPendingPayments(),
      getRecentlyPaidPayments(),
    ]);
    return NextResponse.json({ payments, recentPaid });
  } catch (error) {
    return staffAuthErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireStaffPermission(request, "secretariat");
    const { paymentId } = await request.json();
    if (!paymentId) {
      return NextResponse.json({ error: "paymentId obrigatório" }, { status: 400 });
    }

    const payment = await confirmPayment(paymentId, session.userId);
    return NextResponse.json({ payment });
  } catch (error) {
    if (error instanceof Error && !(error as { code?: string }).code) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return staffAuthErrorResponse(error);
  }
}
