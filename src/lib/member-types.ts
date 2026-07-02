export const MEMBER_CATEGORIES = [
  "student",
  "psychoanalyst",
  "supervisor",
  "researcher",
  "institutional",
  "honorary",
] as const;

export type MemberCategory = (typeof MEMBER_CATEGORIES)[number];

export const MEMBER_STATUSES = [
  "active",
  "expiring",
  "expired",
  "suspended",
  "cancelled",
  "inactive",
  "deceased",
  "honorary",
] as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export interface PublicMemberResult {
  id: string;
  registrationNumber: string;
  publicName: string;
  category: MemberCategory;
  categoryLabel: string;
  status: MemberStatus;
  statusLabel: string;
  publicState?: string | null;
  publicCity?: string | null;
  validUntil?: Date | null;
  publicBio?: string | null;
  publicEducationSummary?: string | null;
  publicStudyAreas?: string | null;
  publicWebsite?: string | null;
  publicLinkedin?: string | null;
  publicInstagram?: string | null;
  publicPhotoUrl?: string | null;
  publishPhoto: boolean;
  publishBio: boolean;
  publishLinks: boolean;
  isPublic: boolean;
  reviewStatus?: string;
  qrToken?: string;
}

export interface MemberSearchFilters {
  name?: string;
  registrationNumber?: string;
  state?: string;
  category?: MemberCategory;
  status?: MemberStatus;
}

export interface MemberSearchOptions {
  /** Reservado para uso administrativo. */
  includeUnapprovedProfiles?: boolean;
}

/** Perfil institucional visível na consulta pública (opt-in do associado). */
export function memberHasPublicProfile(member: PublicMemberResult): boolean {
  return member.isPublic && member.publishBio;
}
