"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero, Section } from "@/components/layout/sections";
import {
  BRAZILIAN_STATES,
  CATEGORY_LABELS,
  PUBLIC_MEMBER_SEARCH_CATEGORIES,
} from "@/lib/constants";
import { memberHasPublicProfile, type PublicMemberResult } from "@/lib/member-types";
import { formatDate } from "@/lib/utils";

export default function ConsultarAssociadoPage() {
  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<PublicMemberResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (registrationNumber) params.set("registrationNumber", registrationNumber);
    if (state) params.set("state", state);
    if (category) params.set("category", category);

    const res = await fetch(`/api/members/search?${params.toString()}`);
    const data = await res.json();
    setResults(data.members ?? []);
    setLoading(false);
  }

  return (
    <>
      <PageHero
        eyebrow="Consulta pública"
        title="Consultar Associado SOBRAPSI"
        subtitle="Verifique a situação associativa de membros ativos da SOBRAPSI — sem exposição de dados sensíveis."
        backgroundText="CONSULTA"
      />

      <Section>
        <Card className="w-full border-white/10 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Buscar associado</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome do associado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg">Número de registro</Label>
                  <Input
                    id="reg"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="SBR-000001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-border bg-zinc-900 px-4 text-sm text-white"
                  >
                    <option value="">Todas</option>
                    {BRAZILIAN_STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-border bg-zinc-900 px-4 text-sm text-white"
                  >
                    <option value="">Todas</option>
                    {PUBLIC_MEMBER_SEARCH_CATEGORIES.map((key) => (
                      <option key={key} value={key}>
                        {CATEGORY_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-center">
                <Button type="submit" disabled={loading}>
                  {loading ? "Buscando..." : "Consultar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {searched && (
          <div className="mt-10 space-y-4">
            {results.length === 0 ? (
              <p className="text-center text-muted">
                Nenhum associado encontrado com os critérios informados.
              </p>
            ) : (
              results.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))
            )}
          </div>
        )}
      </Section>
    </>
  );
}

function MemberCard({ member }: { member: PublicMemberResult }) {
  const router = useRouter();
  const [profileUnavailableOpen, setProfileUnavailableOpen] = useState(false);

  const statusVariant =
    member.status === "active"
      ? "success"
      : member.status === "expired"
        ? "warning"
        : "outline";

  function handleViewProfile() {
    if (memberHasPublicProfile(member)) {
      router.push(`/associado/${member.registrationNumber}`);
      return;
    }
    setProfileUnavailableOpen(true);
  }

  return (
    <>
      <Card className="border-white/10 bg-zinc-900/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{member.publicName}</h3>
              <p className="mt-1 text-sm text-muted">
                Registro SOBRAPSI: {member.registrationNumber}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="default">{member.categoryLabel}</Badge>
                <Badge variant={statusVariant}>{member.statusLabel}</Badge>
                {member.publicState && (
                  <Badge variant="outline">UF: {member.publicState}</Badge>
                )}
              </div>
              {member.validUntil && (
                <p className="mt-3 text-sm text-muted">
                  Validade: {formatDate(member.validUntil)}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Button variant="outline" size="sm" onClick={handleViewProfile}>
                Ver perfil
              </Button>
              <Button size="sm" asChild>
                <Link href={`/validar/${member.registrationNumber}`}>
                  Validar carteira
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={profileUnavailableOpen} onOpenChange={setProfileUnavailableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perfil não disponível</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-muted">
            Os dados de perfil deste membro não estão públicos por opção do associado.
          </p>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setProfileUnavailableOpen(false)}
          >
            Entendi
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
