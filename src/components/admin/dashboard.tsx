"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicMemberResult } from "@/lib/member-types";
import { formatDate } from "@/lib/utils";

interface Stats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  suspendedMembers: number;
}

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [members, setMembers] = useState<PublicMemberResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("sobrapsi_admin");
    if (stored) {
      setAuthenticated(true);
      loadData(stored);
    }
  }, []);

  async function loadData(token: string) {
    setLoading(true);
    const res = await fetch("/api/admin/members", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members);
      setStats(data.stats);
    }
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    if (res.ok) {
      sessionStorage.setItem("sobrapsi_admin", secret);
      setAuthenticated(true);
      loadData(secret);
    } else {
      setError("Senha administrativa inválida.");
    }
  }

  if (!authenticated) {
    return (
      <Card className="mx-auto max-w-md border-white/10 bg-zinc-900/50">
        <CardHeader>
          <CardTitle>Acesso restrito</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secret">Senha administrativa</Label>
              <Input
                id="secret"
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total", value: stats.totalMembers },
            { label: "Ativos", value: stats.activeMembers },
            { label: "Vencidos", value: stats.expiredMembers },
            { label: "Suspensos", value: stats.suspendedMembers },
          ].map((s) => (
            <Card key={s.label} className="border-white/10 bg-zinc-900/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted">{s.label}</p>
                <p className="text-3xl font-bold text-white">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader>
          <CardTitle>Associados cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted">Carregando...</p>
          ) : members.length === 0 ? (
            <p className="text-muted">
              Nenhum associado no banco. Execute o seed ou cadastre manualmente.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted">
                    <th className="pb-3 pr-4">Nome</th>
                    <th className="pb-3 pr-4">Registro</th>
                    <th className="pb-3 pr-4">Categoria</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Validade</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-white">{m.publicName}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{m.registrationNumber}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">{m.categoryLabel}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={m.status === "active" ? "success" : "warning"}
                        >
                          {m.statusLabel}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted">
                        {formatDate(m.validUntil)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted">
        Lista atualizada conforme novos cadastros são aprovados pela equipe.
      </p>
    </div>
  );
}
