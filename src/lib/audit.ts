import "server-only";

import { prisma } from "@/lib/prisma";

const PORTAL_ADMIN_EMAIL = "portal-admin@sobrapsi.internal";

/** Portal admin actions use a shared secret, not a User row — omit invalid actor IDs. */
export function resolveAuditActorUserId(actorId?: string | null): string | null {
  if (!actorId || actorId === "admin") return null;
  return actorId;
}

/** Admin notes require a User FK; reuse a dedicated internal account for portal actions. */
export async function resolvePortalAdminAuthorId(actorId?: string | null): Promise<string> {
  if (actorId && actorId !== "admin") return actorId;

  const existing = await prisma.user.findUnique({
    where: { email: PORTAL_ADMIN_EMAIL },
  });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      email: PORTAL_ADMIN_EMAIL,
      role: "admin",
    },
  });
  return created.id;
}
