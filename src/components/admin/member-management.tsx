"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { MemberCategory } from "@/lib/member-types";
import { formatDate } from "@/lib/utils";

export interface AdminMemberItem {
  id: string;
  userId: string;
  email: string;
  publicName: string;
  registrationNumber: string;
  category: MemberCategory;
  categoryLabel: string;
  status: string;
  statusLabel: string;
  validUntil?: string | null;
  birthDate?: string | null;
  publicCity?: string | null;
  publicState?: string | null;
}

interface MemberManagementProps {
  members: AdminMemberItem[];
  loading: boolean;
  actionLoading: boolean;
  onRefresh: () => void;
}

interface EditForm {
  fullName: string;
  email: string;
  publicName: string;
  category: MemberCategory;
  validUntil: string;
  publicCity: string;
  publicState: string;
  publicBio: string;
  isPublic: boolean;
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function MemberManagement({
  members,
  loading,
  actionLoading,
  onRefresh,
}: MemberManagementProps) {
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);

  async function openEdit(memberId: string) {
    setError("");
    const res = await fetch(`/api/admin/members/${memberId}`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Não foi possível carregar o associado.");
      return;
    }

    const member = data.member;
    setEditingId(memberId);
    setForm({
      fullName: member.fullName,
      email: member.email,
      publicName: member.publicName,
      category: member.category,
      validUntil: toDateInput(member.validUntil),
      publicCity: member.publicCity ?? "",
      publicState: member.publicState ?? "",
      publicBio: member.publicBio ?? "",
      isPublic: member.isPublic ?? false,
    });
  }

  async function runAction(memberId: string, payload: Record<string, unknown>) {
    setError("");
    const res = await fetch(`/api/admin/members/${memberId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Não foi possível concluir a ação.");
      return false;
    }
    onRefresh();
    return true;
  }

  async function handleSuspend(memberId: string) {
    if (!confirm("Suspender este associado?")) return;
    await runAction(memberId, { action: "suspend" });
  }

  async function handleActivate(memberId: string) {
    await runAction(memberId, { action: "activate" });
  }

  async function handleResetPassword(memberId: string) {
    if (
      !confirm(
        "Redefinir a senha para a data de nascimento? O associado precisará alterá-la no próximo login."
      )
    ) {
      return;
    }
    await runAction(memberId, { action: "resetPassword" });
  }

  async function handleDelete(memberId: string, name: string) {
    if (!confirm(`Excluir permanentemente o associado ${name}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setError("");
    const res = await fetch(`/api/admin/members/${memberId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Não foi possível excluir o associado.");
      return;
    }
    setEditingId(null);
    setForm(null);
    onRefresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !form) return;

    const ok = await runAction(editingId, {
      action: "update",
      fullName: form.fullName,
      email: form.email,
      publicName: form.publicName,
      category: form.category,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
      publicCity: form.publicCity || null,
      publicState: form.publicState || null,
      publicBio: form.publicBio || null,
      isPublic: form.isPublic,
    });

    if (ok) {
      setEditingId(null);
      setForm(null);
    }
  }

  if (loading) {
    return <p className="text-muted">Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-400">{error}</p>}

      {editingId && form && (
        <Card className="border-primary/30 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Editar associado</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nome público</Label>
                <Input
                  value={form.publicName}
                  onChange={(e) => setForm({ ...form, publicName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <select
                  className="flex h-11 w-full rounded-lg border border-white/20 bg-transparent px-3 text-sm text-white"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as MemberCategory })
                  }
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-zinc-900">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Validade</Label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={form.publicCity}
                  onChange={(e) => setForm({ ...form, publicCity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={form.publicState}
                  onChange={(e) => setForm({ ...form, publicState: e.target.value })}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Bio pública</Label>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
                  value={form.publicBio}
                  onChange={(e) => setForm({ ...form, publicBio: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                />
                Perfil visível na consulta pública
              </label>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button type="submit" disabled={actionLoading}>
                  Salvar alterações
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader>
          <CardTitle>Associados cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted">Nenhum associado no banco.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted">
                    <th className="pb-3 pr-4">Nome</th>
                    <th className="pb-3 pr-4">Registro</th>
                    <th className="pb-3 pr-4">Categoria</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Validade</th>
                    <th className="pb-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-white/5 align-top">
                      <td className="py-3 pr-4 text-white">{member.publicName}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{member.registrationNumber}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">{member.categoryLabel}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={member.status === "active" ? "success" : "warning"}>
                          {member.statusLabel}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {formatDate(member.validUntil ?? null)}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(member.id)}>
                            Editar
                          </Button>
                          {member.status === "suspended" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading}
                              onClick={() => handleActivate(member.id)}
                            >
                              Reativar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading}
                              onClick={() => handleSuspend(member.id)}
                            >
                              Suspender
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading}
                            onClick={() => handleResetPassword(member.id)}
                          >
                            Resetar senha
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading}
                            onClick={() => handleDelete(member.id, member.publicName)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
