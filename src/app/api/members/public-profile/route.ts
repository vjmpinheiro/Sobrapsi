import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { prisma } from "@/lib/prisma";
import { publicProfileSchema } from "@/lib/validations/application";
import { mergePublicProfileWithApplicationData } from "@/lib/public-profile-defaults";

async function loadMemberProfileContext(memberId: string, userId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      publicProfile: true,
      application: {
        include: {
          candidate: true,
          publicProfileDraft: true,
          educationRecords: { orderBy: { createdAt: "asc" } },
          curriculumRecord: true,
        },
      },
      user: { include: { person: true } },
    },
  });

  if (!member?.publicProfile) return null;

  let application = member.application;

  if (!application) {
    application = await prisma.application.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        candidate: true,
        publicProfileDraft: true,
        educationRecords: { orderBy: { createdAt: "asc" } },
        curriculumRecord: true,
      },
    });
  }

  return {
    profile: member.publicProfile,
    person: member.user?.person ?? null,
    candidate: application?.candidate ?? null,
    draft: application?.publicProfileDraft ?? null,
    educationRecords: application?.educationRecords ?? [],
    curriculum: application?.curriculumRecord ?? null,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await getUserById(session.userId);
  if (!user?.member) {
    return NextResponse.json({ error: "Associado não encontrado" }, { status: 403 });
  }

  const context = await loadMemberProfileContext(user.member.id, user.id);
  if (!context) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    profile: mergePublicProfileWithApplicationData(context),
    registrationNumber: user.member.registrationNumber,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await getUserById(session.userId);
  if (!user?.member) {
    return NextResponse.json({ error: "Associado não encontrado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = publicProfileSchema.parse(body);

    const profile = await prisma.publicProfile.update({
      where: { memberId: user.member.id },
      data: {
        publicName: data.publicName,
        publicCity: data.publicCity || null,
        publicState: data.publicState || null,
        publicBio: data.publicBio || null,
        publicEducationSummary: data.publicEducationSummary || null,
        publicStudyAreas: data.publicStudyAreas || null,
        publicWebsite: data.publicWebsite || null,
        publicLinkedin: data.publicLinkedin || null,
        publicInstagram: data.publicInstagram || null,
        ...(data.publicPhotoUrl ? { publicPhotoUrl: data.publicPhotoUrl } : {}),
        isPublic: data.authorizeList,
        publishBio: data.authorizeBio,
        publishLinks: data.authorizeLinks,
        publishPhoto: data.authorizePhoto,
        reviewStatus: "approved",
      },
    });

    const context = await loadMemberProfileContext(user.member.id, user.id);
    const mergedProfile = context
      ? mergePublicProfileWithApplicationData({ ...context, profile })
      : mergePublicProfileWithApplicationData({
          profile,
          person: user.person,
        });

    return NextResponse.json({
      ok: true,
      profile: mergedProfile,
    });
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}
