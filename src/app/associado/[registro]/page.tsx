import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero, Section } from "@/components/layout/sections";
import { MemberAvatar } from "@/components/members/member-avatar";
import { PublicProfileSocialLinks } from "@/components/portal/public-profile-social-links";
import { getMemberByRegistration } from "@/lib/members";
import { memberHasPublicProfile } from "@/lib/member-types";
import { getMemberPublishedPhotoUrl } from "@/lib/member-photo-urls";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ registro: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { registro } = await params;
  const member = await getMemberByRegistration(registro);
  return {
    title: member?.publicName ?? "Associado",
    robots: { index: false, follow: false },
  };
}

export default async function AssociadoPerfilPage({ params }: PageProps) {
  const { registro } = await params;
  const member = await getMemberByRegistration(registro);

  if (!member || !memberHasPublicProfile(member)) {
    notFound();
  }

  const photoUrl = getMemberPublishedPhotoUrl(member);

  return (
    <>
      <PageHero
        eyebrow="Perfil institucional"
        title={member.publicName}
        subtitle={`Registro SOBRAPSI: ${member.registrationNumber}`}
      />

      <Section>
        <div className="space-y-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {member.publishPhoto && (
              <MemberAvatar
                photoUrl={photoUrl}
                name={member.publicName}
                variant="profile"
              />
            )}

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{member.categoryLabel}</Badge>
                <Badge variant="success">{member.statusLabel}</Badge>
                {member.publicState && (
                  <Badge variant="outline">
                    {member.publicCity ? `${member.publicCity}/` : ""}
                    {member.publicState}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {member.publicBio && (
            <div>
              <h2 className="mb-3 text-lg font-bold">Sobre</h2>
              <p className="leading-relaxed text-muted">{member.publicBio}</p>
            </div>
          )}

          {member.publicEducationSummary && (
            <div>
              <h2 className="mb-3 text-lg font-bold">Formação</h2>
              <p className="text-muted">{member.publicEducationSummary}</p>
            </div>
          )}

          {member.publicStudyAreas && (
            <div>
              <h2 className="mb-3 text-lg font-bold">Áreas de estudo</h2>
              <p className="text-muted">{member.publicStudyAreas}</p>
            </div>
          )}

          {member.publishLinks && (
            <PublicProfileSocialLinks
              website={member.publicWebsite}
              linkedin={member.publicLinkedin}
              instagram={member.publicInstagram}
            />
          )}

          {member.validUntil && (
            <p className="text-sm text-muted">
              Validade associativa: {formatDate(member.validUntil)}
            </p>
          )}

          <Button asChild>
            <Link href={`/validar/${member.registrationNumber}`}>
              Validar carteira
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
