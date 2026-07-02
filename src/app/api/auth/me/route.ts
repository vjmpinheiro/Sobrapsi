import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { getPortalApplicationForUser, APPLICATION_STATUS_LABELS } from "@/lib/applications";
import { needsRenewal, daysUntilExpiry } from "@/lib/membership-status";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const latestApplication = await getPortalApplicationForUser(user.id);
  const submittedApplication = user.role === "candidate"
    ? await import("@/lib/prisma").then(({ prisma }) =>
        prisma.application.findFirst({
          where: {
            userId: user.id,
            status: {
              notIn: ["draft", "cancelled_by_candidate"],
            },
          },
          orderBy: { updatedAt: "desc" },
        })
      )
    : null;

  const activeApplication =
    submittedApplication &&
    !["draft", "rejected", "approved", "cancelled_by_candidate"].includes(
      submittedApplication.status
    )
      ? submittedApplication
      : latestApplication &&
          (latestApplication.status === "draft" ||
            latestApplication.status === "awaiting_complement")
        ? latestApplication
        : submittedApplication ?? latestApplication ?? null;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.person?.fullName,
      mustChangePassword: user.mustChangePassword,
      member: user.member
        ? {
            id: user.member.id,
            registrationNumber: user.member.registrationNumber,
            status: user.member.status,
            validUntil: user.member.validUntil,
            needsRenewal: needsRenewal(user.member.status, user.member.validUntil),
            daysUntilExpiry: daysUntilExpiry(user.member.validUntil),
          }
        : null,
      application: activeApplication
        ? {
            id: activeApplication.id,
            status: activeApplication.status,
            statusLabel:
              APPLICATION_STATUS_LABELS[activeApplication.status] ??
              activeApplication.status,
            currentStep: activeApplication.currentStep,
            category: activeApplication.categoryRequested,
          }
        : null,
    },
  });
}
