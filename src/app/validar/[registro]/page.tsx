import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberAvatar } from "@/components/members/member-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getMemberValidationPhotoUrl } from "@/lib/member-photo-urls";

interface PageProps {
  params: Promise<{ registro: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { registro } = await params;
  return {
    title: `Validar ${registro}`,
    robots: { index: false, follow: false },
  };
}

export default async function ValidarPage({ params, searchParams }: PageProps) {
  const { registro } = await params;
  const { token } = await searchParams;

  const { validateMembership } = await import("@/lib/members");
  const result = await validateMembership(registro, token);

  if (!result.member && !result.valid) {
    notFound();
  }

  const member = result.member;
  const photoUrl = member ? getMemberValidationPhotoUrl(member) : null;

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-black py-12">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
        <div className="mb-6 flex justify-center">
          {member ? (
            <MemberAvatar
              photoUrl={photoUrl}
              name={member.publicName}
              variant="validation"
            />
          ) : (
            <MemberAvatar name="SOBRAPSI" variant="validation" />
          )}
        </div>

        <Badge
          variant={result.valid ? "success" : "warning"}
          className="mb-4 text-sm"
        >
          {result.message}
        </Badge>

        {member && (
          <div className="mt-6 space-y-3 text-left">
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-muted">Associado</p>
              <p className="font-bold text-white">{member.publicName}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-muted">Registro</p>
              <p className="font-mono text-white">{member.registrationNumber}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-muted">Categoria</p>
              <p className="text-white">{member.categoryLabel}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-muted">Situação</p>
              <p className="text-white">{member.statusLabel}</p>
            </div>
            {member.validUntil && (
              <div className="rounded-lg border border-white/10 p-4">
                <p className="text-sm text-muted">Validade</p>
                <p className="text-white">{formatDate(member.validUntil)}</p>
              </div>
            )}
          </div>
        )}

        <Button variant="outline" className="mt-8" asChild>
          <Link href="/consultar-associado">Nova consulta</Link>
        </Button>
      </div>
    </section>
  );
}
