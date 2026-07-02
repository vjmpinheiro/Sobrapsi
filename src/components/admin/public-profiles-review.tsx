"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

export interface AdminPublicProfileItem {
  id: string;
  publicName: string;
  publicCity: string | null;
  publicState: string | null;
  publicBio: string | null;
  publicEducationSummary: string | null;
  publicStudyAreas: string | null;
  publicWebsite: string | null;
  publicLinkedin: string | null;
  publicInstagram: string | null;
  photoUrl: string | null;
  publishPhoto: boolean;
  publishBio: boolean;
  publishLinks: boolean;
  isPublic: boolean;
  reviewStatus: string;
  reviewStatusLabel: string;
  reviewedAt: string | null;
  updatedAt: string;
  registrationNumber: string;
  memberCategoryLabel: string;
  memberEmail: string;
  memberFullName: string;
}

interface ProfileStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
}

interface PublicProfilesReviewProps {
  loading: boolean;
  profiles: AdminPublicProfileItem[];
  stats: ProfileStats | null;
  actionLoading: boolean;
  adminToken: string;
  onRefresh: () => void;
  onReview: (profileId: string, action: "approve" | "reject", reasonPublic?: string) => Promise<void>;
}

function AdminProfilePhoto({
  photoUrl,
  name,
  adminToken,
}: {
  photoUrl: string | null;
  name: string;
  adminToken: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!photoUrl) {
      setSrc(null);
      return;
    }

    let objectUrl: string | null = null;
    fetch(photoUrl, { headers: { Authorization: `Bearer ${adminToken}` } })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoUrl, adminToken]);

  if (!photoUrl) {
    return (
      <div className="flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-white/20 text-sm text-muted">
        Sem foto
      </div>
    );
  }

  if (!src) {
    return (
      <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/20 text-xs text-muted">
        Carregando...
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Foto de ${name}`}
      className="h-32 w-32 rounded-full border-2 border-primary/40 object-cover"
    />
  );
}

function statusVariant(status: string): "default" | "success" | "warning" | "outline" {
  if (status === "approved") return "success";
  if (status === "pending_review") return "warning";
  if (status === "rejected") return "outline";
  return "default";
}

export function PublicProfilesReview({
  loading,
  profiles,
  stats,
  actionLoading,
  adminToken,
  onRefresh,
  onReview,
}: PublicProfilesReviewProps) {
  const [filter, setFilter] = useState<"pending_review" | "all">("pending_review");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const visible =
    filter === "all"
      ? profiles
      : profiles.filter((p) => p.reviewStatus === "pending_review");

  const selected = visible.find((p) => p.id === selectedId) ?? visible[0] ?? null;

  useEffect(() => {
    if (visible.length > 0 && (!selectedId || !visible.some((p) => p.id === selectedId))) {
      setSelectedId(visible[0].id);
    }
    if (visible.length === 0) {
      setSelectedId(null);
    }
  }, [visible, selectedId]);

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Aguardando revisão", value: stats.pending },
            { label: "Publicados", value: stats.approved },
            { label: "Ajustes necessários", value: stats.rejected },
            { label: "Rascunhos", value: stats.draft },
          ].map((item) => (
            <Card key={item.label} className="border-white/10 bg-zinc-900/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={filter === "pending_review" ? "default" : "outline"}
          onClick={() => setFilter("pending_review")}
        >
          Pendentes
        </Button>
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Todos
        </Button>
        <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading}>
          Atualizar
        </Button>
      </div>

      {loading ? (
        <p className="text-muted">Carregando perfis...</p>
      ) : visible.length === 0 ? (
        <Card className="border-white/10 bg-zinc-900/50">
          <CardContent className="p-6">
            <p className="text-muted">Nenhum perfil nesta fila.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="border-white/10 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-base">Fila de revisão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {visible.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelectedId(profile.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selected?.id === profile.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <p className="font-medium text-white">{profile.publicName}</p>
                  <p className="mt-1 text-xs text-muted">{profile.registrationNumber}</p>
                  <Badge className="mt-2" variant={statusVariant(profile.reviewStatus)}>
                    {profile.reviewStatusLabel}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {selected && (
            <Card className="border-white/10 bg-zinc-900/50">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle>{selected.publicName}</CardTitle>
                  <p className="mt-1 text-sm text-muted">
                    {selected.registrationNumber} · {selected.memberCategoryLabel}
                  </p>
                  <p className="text-sm text-muted">{selected.memberEmail}</p>
                </div>
                <Badge variant={statusVariant(selected.reviewStatus)}>
                  {selected.reviewStatusLabel}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <AdminProfilePhoto
                    photoUrl={selected.photoUrl}
                    name={selected.publicName}
                    adminToken={adminToken}
                  />
                  <div className="space-y-1 text-sm text-muted">
                    <p>
                      Atualizado em {formatDate(selected.updatedAt)}
                    </p>
                    {selected.reviewedAt && (
                      <p>Revisado em {formatDate(selected.reviewedAt)}</p>
                    )}
                    {selected.publicCity && selected.publicState && (
                      <p>
                        {selected.publicCity}/{selected.publicState}
                      </p>
                    )}
                  </div>
                </div>

                {selected.publicBio && (
                  <div>
                    <h3 className="mb-2 font-semibold text-white">Mini bio</h3>
                    <p className="text-sm leading-relaxed text-muted">{selected.publicBio}</p>
                  </div>
                )}

                {selected.publicEducationSummary && (
                  <div>
                    <h3 className="mb-2 font-semibold text-white">Formação</h3>
                    <p className="text-sm text-muted">{selected.publicEducationSummary}</p>
                  </div>
                )}

                {selected.publicStudyAreas && (
                  <div>
                    <h3 className="mb-2 font-semibold text-white">Áreas</h3>
                    <p className="text-sm text-muted">{selected.publicStudyAreas}</p>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
                  {selected.publicWebsite && (
                    <div>
                      <p className="text-xs uppercase text-muted">Site</p>
                      <p className="text-sm text-white">{selected.publicWebsite}</p>
                    </div>
                  )}
                  {selected.publicLinkedin && (
                    <div>
                      <p className="text-xs uppercase text-muted">LinkedIn</p>
                      <p className="text-sm text-white">{selected.publicLinkedin}</p>
                    </div>
                  )}
                  {selected.publicInstagram && (
                    <div>
                      <p className="text-xs uppercase text-muted">Instagram</p>
                      <p className="text-sm text-white">{selected.publicInstagram}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-white/10 p-4 text-sm text-muted">
                  <p className="mb-2 font-medium text-white">Autorizações</p>
                  <ul className="space-y-1">
                    <li>{selected.isPublic ? "✓" : "✗"} Consulta pública</li>
                    <li>{selected.publishBio ? "✓" : "✗"} Mini bio</li>
                    <li>{selected.publishLinks ? "✓" : "✗"} Links</li>
                    <li>{selected.publishPhoto ? "✓" : "✗"} Foto</li>
                  </ul>
                </div>

                {selected.reviewStatus === "pending_review" && (
                  <div className="space-y-4 border-t border-white/10 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted" htmlFor="rejectReason">
                        Motivo (opcional, para reprovação)
                      </label>
                      <Textarea
                        id="rejectReason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Descreva o que o associado deve ajustar..."
                        rows={3}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        disabled={actionLoading}
                        onClick={() => onReview(selected.id, "approve")}
                      >
                        Aprovar publicação
                      </Button>
                      <Button
                        variant="outline"
                        disabled={actionLoading}
                        onClick={() =>
                          onReview(
                            selected.id,
                            "reject",
                            rejectReason.trim() || undefined
                          )
                        }
                      >
                        Solicitar ajustes
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
