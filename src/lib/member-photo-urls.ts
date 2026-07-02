import type { PublicMemberResult } from "@/lib/member-types";

export function memberPublishedPhotoUrl(registrationNumber: string): string {
  return `/api/public/members/${encodeURIComponent(registrationNumber)}/photo`;
}

export function memberValidationPhotoUrl(registrationNumber: string): string {
  return `/api/public/members/${encodeURIComponent(registrationNumber)}/photo?scope=validation`;
}

export function getMemberPublishedPhotoUrl(member: PublicMemberResult): string | null {
  if (!member.publicPhotoUrl || !member.publishPhoto) return null;
  return memberPublishedPhotoUrl(member.registrationNumber);
}

export function getMemberValidationPhotoUrl(member: PublicMemberResult): string | null {
  if (!member.publicPhotoUrl) return null;
  return memberValidationPhotoUrl(member.registrationNumber);
}
