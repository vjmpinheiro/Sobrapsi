"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHero, Section } from "@/components/layout/sections";

const SUBJECTS = [
  "Associação",
  "Suporte ao associado",
  "Eventos",
  "Imprensa",
  "Privacidade/LGPD",
  "Conselho de ética",
  "Parcerias",
  "Financeiro",
];

export default function ContatoPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <PageHero
        eyebrow="Contato"
        title="Fale com a SOBRAPSI"
        subtitle="Estamos à disposição para dúvidas institucionais, associação e suporte."
        backgroundText="CONTATO"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-xl font-bold">Canais de atendimento</h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 p-4">
                <p className="text-sm font-semibold text-white">Atendimento geral</p>
                <p className="text-sm text-muted">contato@sobrapsi.org.br</p>
              </div>
              <div className="rounded-lg border border-white/10 p-4">
                <p className="text-sm font-semibold text-white">Suporte ao associado</p>
                <p className="text-sm text-muted">associado@sobrapsi.org.br</p>
              </div>
              <div className="rounded-lg border border-white/10 p-4">
                <p className="text-sm font-semibold text-white">Encarregado de dados (LGPD)</p>
                <p className="text-sm text-muted">privacidade@sobrapsi.org.br</p>
              </div>
              <div className="rounded-lg border border-white/10 p-4">
                <p className="text-sm font-semibold text-white">Conselho de Ética</p>
                <p className="text-sm text-muted">etica@sobrapsi.org.br</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
            {sent ? (
              <p className="text-center text-muted">
                Mensagem recebida. Retornaremos em breve.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assunto">Assunto</Label>
                  <select
                    id="assunto"
                    required
                    className="flex h-11 w-full rounded-lg border border-border bg-zinc-900 px-4 text-sm text-white"
                  >
                    <option value="">Selecione</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mensagem">Mensagem</Label>
                  <Textarea id="mensagem" required rows={5} />
                </div>
                <Button type="submit" className="w-full">
                  Enviar mensagem
                </Button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
