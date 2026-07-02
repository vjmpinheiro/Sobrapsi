import "server-only";

import { prisma } from "@/lib/prisma";

export function memberPhotoDisplayUrl(publicPhotoUrl: string | null | undefined): string | null {
  if (!publicPhotoUrl) return null;
  if (publicPhotoUrl.startsWith("http")) return publicPhotoUrl;
  return `/api/files/${publicPhotoUrl}`;
}

export async function getMemberUploadStorageKeys(userId: string): Promise<string[]> {
  const member = await prisma.member.findUnique({
    where: { userId },
    select: { applicationId: true },
  });

  const keys = [userId];
  if (member?.applicationId) keys.push(member.applicationId);
  return keys;
}
