"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface StaffAccount {
  id: string;
  email: string;
  fullName: string;
  role: "secretaria" | "editor" | string;
  staffEditor: boolean;
  roleLabel: string;
  createdAt: string;
  lastLoginAt: string | null;
}

interface StaffManagementProps {
  staff: StaffAccount[];
  loading: boolean;
  actionLoading: boolean;
  onRefresh: () => void;
}

export function StaffManagement({
  staff,
  loading,
  actionLoading,
  onRefresh,
}: StaffManagementProps) {
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"secretaria" | "editor">("secretaria");
  const [staffEditor, setStaffEditor] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/staff", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, role, staffEditor }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Não foi possível criar a conta.");
      return;
    }

    setFullName("");
    setEmail("");
    setPassword("");
    setRole("secretaria");
    setStaffEditor(false);
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta conta da equipe?")) return;

    const res = await fetch(`/api/admin/staff/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) onRefresh();
  }

  return (
    <div className="space-y-8">
      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader>
          <CardTitle>Nova conta da equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Nome</Label>
              <Input
                id="staff-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">E-mail</Label>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-password">Senha inicial</Label>
              <Input
                id="staff-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-role">Função</Label>
              <select
                id="staff-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "secretaria" | "editor")}
                className="flex h-11 w-full rounded-lg border border-border bg-zinc-900 px-4 text-sm text-white"
              >
                <option value="secretaria">Secretaria</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            {role === "secretaria" && (
              <label className="flex items-center gap-2 text-sm text-muted md:col-span-2">
                <input
                  type="checkbox"
                  checked={staffEditor}
                  onChange={(e) => setStaffEditor(e.target.checked)}
                />
                Também pode editar blog e conteúdos do site
              </label>
            )}
            {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}
            <div className="md:col-span-2">
              <Button type="submit" disabled={actionLoading}>
                Criar conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader>
          <CardTitle>Equipe cadastrada</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted">Carregando...</p>
          ) : staff.length === 0 ? (
            <p className="text-muted">Nenhuma conta cadastrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted">
                    <th className="pb-3 pr-4">Nome</th>
                    <th className="pb-3 pr-4">E-mail</th>
                    <th className="pb-3 pr-4">Função</th>
                    <th className="pb-3 pr-4">Último acesso</th>
                    <th className="pb-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((account) => (
                    <tr key={account.id} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-white">{account.fullName}</td>
                      <td className="py-3 pr-4">{account.email}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">{account.roleLabel}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {account.lastLoginAt
                          ? new Date(account.lastLoginAt).toLocaleString("pt-BR")
                          : "—"}
                      </td>
                      <td className="py-3">
                        {account.role !== "admin" && account.role !== "superadmin" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading}
                            onClick={() => handleDelete(account.id)}
                          >
                            Remover
                          </Button>
                        )}
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
