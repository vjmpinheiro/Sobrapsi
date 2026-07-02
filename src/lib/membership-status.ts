import "server-only";

import { prisma } from "@/lib/prisma";
import { EXPIRY_WARNING_DAYS } from "@/lib/constants";
import {
  sendExpiryReminderEmail,
  sendMembershipExpiredEmail,
} from "@/lib/email";

export { daysUntilExpiry, needsRenewal } from "@/lib/membership-shared";

export async function renewMembership(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { membershipCard: true },
  });

  if (!member) throw new Error("Associado não encontrado");

  const baseDate =
    member.validUntil && member.validUntil > new Date()
      ? member.validUntil
      : new Date();

  const newValidUntil = new Date(baseDate);
  newValidUntil.setFullYear(newValidUntil.getFullYear() + 1);

  await prisma.$transaction(async (tx) => {
    await tx.member.update({
      where: { id: memberId },
      data: {
        status: "active",
        validUntil: newValidUntil,
      },
    });

    if (member.membershipCard) {
      await tx.membershipCard.update({
        where: { id: member.membershipCard.id },
        data: { validUntil: newValidUntil, status: "active" },
      });
    }
  });

  const { generateMembershipCardPdf } = await import("@/lib/membership-card");
  await generateMembershipCardPdf(memberId);

  return newValidUntil;
}

export async function processMembershipStatuses() {
  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + EXPIRY_WARNING_DAYS);

  const results = {
    markedExpiring: 0,
    markedExpired: 0,
    remindersSent: 0,
  };

  // Marcar como vencendo (30 dias)
  const expiring = await prisma.member.updateMany({
    where: {
      status: "active",
      validUntil: { lte: warningDate, gt: now },
    },
    data: { status: "expiring" },
  });
  results.markedExpiring = expiring.count;

  // Marcar como vencido
  const expired = await prisma.member.updateMany({
    where: {
      status: { in: ["active", "expiring"] },
      validUntil: { lt: now },
    },
    data: { status: "expired" },
  });
  results.markedExpired = expired.count;

  // Suspender carteiras vencidas
  await prisma.membershipCard.updateMany({
    where: {
      member: { status: "expired" },
      status: "active",
    },
    data: { status: "expired" },
  });

  // Lembretes por e-mail (associados vencendo em 30, 15 e 7 dias)
  const reminderDays = [30, 15, 7];
  for (const days of reminderDays) {
    const target = new Date();
    target.setDate(target.getDate() + days);
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    const members = await prisma.member.findMany({
      where: {
        status: { in: ["active", "expiring"] },
        validUntil: { gte: start, lte: end },
      },
      include: { user: { include: { person: true } } },
    });

    for (const member of members) {
      const email = member.user.person?.email ?? member.user.email;
      const name = member.user.person?.fullName ?? "Associado";
      await sendExpiryReminderEmail(
        email,
        name,
        member.registrationNumber,
        days,
        member.validUntil!
      );
      results.remindersSent++;
    }
  }

  // E-mail de vencimento (recém expirados nas últimas 24h)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const newlyExpired = await prisma.member.findMany({
    where: {
      status: "expired",
      validUntil: { gte: yesterday, lt: now },
    },
    include: { user: { include: { person: true } } },
  });

  for (const member of newlyExpired) {
    const email = member.user.person?.email ?? member.user.email;
    const name = member.user.person?.fullName ?? "Associado";
    await sendMembershipExpiredEmail(email, name, member.registrationNumber);
  }

  return results;
}

