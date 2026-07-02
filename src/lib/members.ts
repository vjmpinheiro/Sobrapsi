import "server-only";

import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { MemberSearchFilters, MemberSearchOptions, PublicMemberResult } from "@/lib/member-types";
import {
  getMemberSearchScore,
  nameMatchesSearch,
  registrationMatchesSearch,
} from "@/lib/search-text";
import { formatDate } from "@/lib/utils";

export type { MemberSearchFilters, PublicMemberResult } from "@/lib/member-types";

// Dados de demonstração quando o banco não está configurado
const DEMO_MEMBERS: PublicMemberResult[] = [
  {
    id: "demo-1",
    registrationNumber: "SBR-000001",
    publicName: "Vitor José Monteiro Pinheiro",
    category: "psychoanalyst",
    categoryLabel: CATEGORY_LABELS.psychoanalyst,
    status: "active",
    statusLabel: STATUS_LABELS.active,
    publicState: "PR",
    publicCity: "Londrina",
    validUntil: new Date("2027-07-01"),
    publicBio:
      "Empresário, professor, escritor e psicanalista. Presidente da SOBRAPSI.",
    publicEducationSummary: "Formação em Psicanálise Clínica pelo IBRAPSI (2022).",
    publicStudyAreas: "Psicanálise com adultos, Supervisão clínica, Formação e ensino de psicanálise",
    publicWebsite: "https://www.ibrapsi.com.br",
    publicLinkedin: "https://www.linkedin.com/in/vjmpinheiro/",
    publicInstagram: "https://www.instagram.com/vjmpinheiro",
    publicPhotoUrl: null,
    publishPhoto: false,
    publishBio: true,
    publishLinks: true,
    isPublic: true,
    reviewStatus: "approved",
    qrToken: "vitor-jose-monteiro-pinheiro",
  },
];

function matchesFilters(
  member: PublicMemberResult,
  filters: MemberSearchFilters
): boolean {
  if (filters.name && !nameMatchesSearch(member.publicName, filters.name)) {
    return false;
  }
  if (
    filters.registrationNumber &&
    !registrationMatchesSearch(member.registrationNumber, filters.registrationNumber)
  ) {
    return false;
  }
  if (filters.state && member.publicState !== filters.state) return false;
  if (filters.category && member.category !== filters.category) return false;
  if (filters.status && member.status !== filters.status) return false;
  return true;
}

function sortMembersBySearchRelevance(
  members: PublicMemberResult[],
  filters: MemberSearchFilters
): PublicMemberResult[] {
  if (!filters.name && !filters.registrationNumber) {
    return members;
  }

  return [...members].sort((left, right) => {
    const scoreDiff =
      getMemberSearchScore(right, filters) - getMemberSearchScore(left, filters);
    if (scoreDiff !== 0) return scoreDiff;

    return left.publicName.localeCompare(right.publicName, "pt-BR");
  });
}

type MemberWithRelations = {
  id: string;
  registrationNumber: string;
  category: import("@/lib/member-types").MemberCategory;
  status: import("@/lib/member-types").MemberStatus;
  validUntil: Date | null;
  publicProfile: {
    publicName: string;
    publicCity: string | null;
    publicState: string | null;
    publicBio: string | null;
    publicEducationSummary: string | null;
    publicStudyAreas: string | null;
    publicWebsite: string | null;
    publicLinkedin: string | null;
    publicInstagram: string | null;
    publicPhotoUrl: string | null;
    publishPhoto: boolean;
    publishBio: boolean;
    publishLinks: boolean;
    isPublic: boolean;
    reviewStatus: string;
  } | null;
  membershipCard: { qrToken: string } | null;
  application: {
    publicProfileDraft: { profilePhotoPath: string | null } | null;
  } | null;
  user: { person: { fullName: string; city: string | null; state: string | null } | null } | null;
};

function mapMemberToPublicResult(member: MemberWithRelations): PublicMemberResult {
  const profile = member.publicProfile;
  const person = member.user?.person;

  return {
    id: member.id,
    registrationNumber: member.registrationNumber,
    publicName: profile?.publicName ?? person?.fullName ?? "Associado",
    category: member.category,
    categoryLabel: CATEGORY_LABELS[member.category],
    status: member.status,
    statusLabel: STATUS_LABELS[member.status],
    publicState: profile?.publicState ?? person?.state ?? null,
    publicCity: profile?.publicCity ?? person?.city ?? null,
    validUntil: member.validUntil,
    publicBio: profile?.publicBio ?? null,
    publicEducationSummary: profile?.publicEducationSummary ?? null,
    publicStudyAreas: profile?.publicStudyAreas ?? null,
    publicWebsite: profile?.publicWebsite ?? null,
    publicLinkedin: profile?.publicLinkedin ?? null,
    publicInstagram: profile?.publicInstagram ?? null,
    publicPhotoUrl:
      profile?.publicPhotoUrl ?? member.application?.publicProfileDraft?.profilePhotoPath ?? null,
    publishPhoto: profile?.publishPhoto ?? false,
    publishBio: profile?.publishBio ?? false,
    publishLinks: profile?.publishLinks ?? false,
    isPublic: profile?.isPublic ?? false,
    reviewStatus: profile?.reviewStatus ?? "draft",
    qrToken: member.membershipCard?.qrToken,
  };
}

async function searchFromDatabase(
  filters: MemberSearchFilters,
  options?: MemberSearchOptions
): Promise<PublicMemberResult[] | null> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const hasNameSearch = Boolean(filters.name?.trim());

    const members = await prisma.member.findMany({
      where: {
        ...(filters.registrationNumber &&
          !hasNameSearch && {
            registrationNumber: {
              contains: filters.registrationNumber,
              mode: "insensitive",
            },
          }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.state && {
          OR: [
            { publicProfile: { publicState: filters.state } },
            { user: { person: { state: filters.state } } },
          ],
        }),
      },
      include: {
        publicProfile: true,
        membershipCard: true,
        application: { include: { publicProfileDraft: true } },
        user: { include: { person: true } },
      },
      take: hasNameSearch ? 1000 : 50,
    });

    const results = members
      .map(mapMemberToPublicResult)
      .filter((member) => matchesFilters(member, filters));

    return sortMembersBySearchRelevance(results, filters).slice(0, 50);
  } catch {
    return null;
  }
}

export async function searchPublicMembers(
  filters: MemberSearchFilters,
  options?: MemberSearchOptions
): Promise<PublicMemberResult[]> {
  const dbResults = await searchFromDatabase(filters, options);
  if (dbResults !== null) return dbResults;

  return sortMembersBySearchRelevance(
    DEMO_MEMBERS.filter((member) => matchesFilters(member, filters)),
    filters
  );
}

export async function getMemberByRegistration(
  registrationNumber: string
): Promise<PublicMemberResult | null> {
  const results = await searchPublicMembers(
    { registrationNumber },
    { includeUnapprovedProfiles: true }
  );
  return (
    results.find(
      (m) =>
        m.registrationNumber.toUpperCase() === registrationNumber.toUpperCase()
    ) ?? null
  );
}

export async function validateMembership(
  registrationNumber: string,
  token?: string
): Promise<{
  valid: boolean;
  message: string;
  member?: PublicMemberResult;
}> {
  const member = await getMemberByRegistration(registrationNumber);

  if (!member) {
    return {
      valid: false,
      message: "Registro não encontrado na base da SOBRAPSI.",
    };
  }

  if (token && member.qrToken && member.qrToken !== token) {
    return {
      valid: false,
      message: "Token de validação inválido.",
    };
  }

  if (member.status === "suspended" || member.status === "cancelled") {
    return {
      valid: false,
      message:
        "Registro localizado, porém indisponível para validação pública. Entre em contato com a SOBRAPSI.",
      member,
    };
  }

  if (member.status === "expired") {
    return {
      valid: false,
      message: `Registro localizado, porém vencido desde ${formatDate(member.validUntil)}.`,
      member,
    };
  }

  if (member.validUntil && new Date(member.validUntil) < new Date()) {
    return {
      valid: false,
      message: `Registro localizado, porém vencido desde ${formatDate(member.validUntil)}.`,
      member,
    };
  }

  return {
    valid: true,
    message: "Registro válido.",
    member,
  };
}
