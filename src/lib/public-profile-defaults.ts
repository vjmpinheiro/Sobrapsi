import "server-only";

import { EDUCATION_COURSE_TYPES } from "@/lib/constants";
import { memberPhotoDisplayUrl } from "@/lib/member-photo";

type EducationRecord = {
  institution: string;
  courseName: string;
  courseType: string | null;
  status: string | null;
  endDate: Date | null;
};

type ApplicationCandidate = {
  fullName: string;
  city: string | null;
  state: string | null;
  profession: string | null;
  occupation: string | null;
  institution: string | null;
  practiceCity: string | null;
  practiceModality: string | null;
  studyAreas: string | null;
  professionalWebsite: string | null;
  linkedin: string | null;
  instagram: string | null;
};

type ApplicationPublicProfileDraft = {
  publicName: string;
  publicCity: string | null;
  publicState: string | null;
  publicBio: string | null;
  publicEducationSummary: string | null;
  publicStudyAreas: string | null;
  publicWebsite: string | null;
  publicLinkedin: string | null;
  publicInstagram: string | null;
  profilePhotoPath: string | null;
};

type CurriculumRecord = {
  summary: string | null;
};

type Person = {
  fullName: string;
  city: string | null;
  state: string | null;
};

export type PublicProfileSourceData = {
  profile: {
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
    isPublic: boolean;
    publishBio: boolean;
    publishLinks: boolean;
    publishPhoto: boolean;
    reviewStatus: string;
  };
  person?: Person | null;
  candidate?: ApplicationCandidate | null;
  draft?: ApplicationPublicProfileDraft | null;
  educationRecords?: EducationRecord[];
  curriculum?: CurriculumRecord | null;
};

function coalesce(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (value?.trim()) return value.trim();
  }
  return "";
}

function courseTypeLabel(courseType: string | null | undefined): string | null {
  if (!courseType) return null;
  return EDUCATION_COURSE_TYPES.find((item) => item.id === courseType)?.label ?? courseType;
}

export function buildEducationSummaryFromRecords(records: EducationRecord[]): string {
  if (!records.length) return "";

  return records
    .map((record) => {
      const parts = [record.courseName, record.institution].filter(Boolean);
      const typeLabel = courseTypeLabel(record.courseType);
      if (typeLabel) parts.push(typeLabel);

      if (record.status === "concluido") {
        const year = record.endDate ? new Date(record.endDate).getFullYear() : null;
        parts.push(year ? `concluído em ${year}` : "concluído");
      } else if (record.status === "em_andamento") {
        parts.push("em andamento");
      }

      return parts.join(" — ");
    })
    .join("\n");
}

export function buildProfessionalSummaryFromCandidate(
  candidate: ApplicationCandidate | null | undefined
): string {
  if (!candidate) return "";

  const parts: string[] = [];
  if (candidate.profession) parts.push(candidate.profession);
  if (candidate.occupation && candidate.occupation !== candidate.profession) {
    parts.push(candidate.occupation);
  }
  if (candidate.institution) parts.push(`Vínculo institucional: ${candidate.institution}`);

  const location = coalesce(candidate.practiceCity, candidate.city);
  if (location) parts.push(`Atuação em ${location}`);

  if (candidate.practiceModality) {
    const modalityLabels: Record<string, string> = {
      presencial: "Atendimento presencial",
      online: "Atendimento online",
      ambos: "Atendimento presencial e online",
    };
    const label = modalityLabels[candidate.practiceModality];
    if (label) parts.push(label);
  }

  return parts.join(". ");
}

export function mergePublicProfileWithApplicationData(source: PublicProfileSourceData) {
  const { profile, person, candidate, draft, educationRecords = [], curriculum } = source;

  const educationSummary = buildEducationSummaryFromRecords(educationRecords);
  const professionalSummary = buildProfessionalSummaryFromCandidate(candidate);

  const publicPhotoUrl = coalesce(profile.publicPhotoUrl, draft?.profilePhotoPath);

  return {
    publicName: coalesce(
      profile.publicName,
      draft?.publicName,
      person?.fullName,
      candidate?.fullName
    ),
    publicCity: coalesce(
      profile.publicCity,
      draft?.publicCity,
      candidate?.practiceCity,
      person?.city,
      candidate?.city
    ),
    publicState: coalesce(
      profile.publicState,
      draft?.publicState,
      person?.state,
      candidate?.state
    ),
    publicBio: coalesce(profile.publicBio, draft?.publicBio, curriculum?.summary, professionalSummary),
    publicEducationSummary: coalesce(
      profile.publicEducationSummary,
      draft?.publicEducationSummary,
      educationSummary
    ),
    publicStudyAreas: coalesce(profile.publicStudyAreas, draft?.publicStudyAreas, candidate?.studyAreas),
    publicWebsite: coalesce(profile.publicWebsite, draft?.publicWebsite, candidate?.professionalWebsite),
    publicLinkedin: coalesce(profile.publicLinkedin, draft?.publicLinkedin, candidate?.linkedin),
    publicInstagram: coalesce(profile.publicInstagram, draft?.publicInstagram, candidate?.instagram),
    publicPhotoUrl,
    photoUrl: memberPhotoDisplayUrl(publicPhotoUrl || null),
    authorizeList: profile.isPublic,
    authorizeBio: profile.publishBio,
    authorizeLinks: profile.publishLinks,
    authorizePhoto: profile.publishPhoto,
    reviewStatus: profile.reviewStatus,
  };
}
