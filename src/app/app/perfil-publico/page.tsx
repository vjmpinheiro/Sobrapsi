"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero, Section } from "@/components/layout/sections";
import {
  MemberPublicProfileEditor,
  MemberPublicProfileView,
  getPublicProfileStatusLabel,
  type MemberPublicProfileData,
} from "@/components/portal/member-public-profile";

export default function PerfilPublicoPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MemberPublicProfileData | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/members/public-profile")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !data.profile) {
          router.push("/app");
          return;
        }
        setProfile(data.profile);
        setRegistrationNumber(data.registrationNumber ?? "");
        setLoading(false);
      })
      .catch(() => {
        router.push("/app");
      });
  }, [router]);

  function handleSaved(updated: MemberPublicProfileData) {
    setProfile(updated);
    setEditing(false);
    setSuccess(
      updated.authorizeList && updated.authorizeBio
        ? "Perfil publicado com sucesso."
        : "Perfil salvo com sucesso."
    );
  }

  function handleCancel() {
    setEditing(false);
    setSuccess("");
  }

  if (loading || !profile) {
    return (
      <Section>
        <p className="text-center text-muted">Carregando perfil...</p>
      </Section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Portal"
        title="Perfil público"
        subtitle="Visualize e edite as informações que poderão aparecer na consulta pública de associados."
      />

      <Section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline">{registrationNumber}</Badge>
            <Badge>{getPublicProfileStatusLabel(profile)}</Badge>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app">Voltar ao portal</Link>
          </Button>
        </div>

        {success && !editing && (
          <p className="mb-4 text-sm text-green-400">{success}</p>
        )}

        {editing ? (
          <MemberPublicProfileEditor
            initialProfile={profile}
            onCancel={handleCancel}
            onSaved={handleSaved}
          />
        ) : (
          <MemberPublicProfileView
            profile={profile}
            registrationNumber={registrationNumber}
            onEdit={() => {
              setSuccess("");
              setEditing(true);
            }}
          />
        )}
      </Section>
    </>
  );
}
