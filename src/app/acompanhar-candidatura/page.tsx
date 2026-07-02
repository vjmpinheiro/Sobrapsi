"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero, Section } from "@/components/layout/sections";
import { PaymentCheckoutPanel } from "@/components/payments/payment-checkout-panel";
import {
  APPLICATION_FEE_CARD_AMOUNT,
  APPLICATION_FEE_CASH_AMOUNT,
  ANNUAL_FEE_INSTALLMENTS,
} from "@/lib/constants";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

type TrackingStep = {
  id: string;
  label: string;
  description: string;
  state: "done" | "current" | "pending";
};

type TrackingData = {
  candidateName: string;
  categoryLabel: string;
  statusLabel: string;
  submittedAtLabel: string;
  steps: TrackingStep[];
  isRejected: boolean;
  isCancelled: boolean;
  rejectionReason?: string | null;
  complementNotes: { id: string; note: string; createdAt: string }[];
  showPaymentPending: boolean;
  payment: { id: string; amount: number; status: string; dueDate: string } | null;
  registrationNumber: string | null;
  canResumeCandidature: boolean;
};

export default function AcompanharCandidaturaPage() {
  const [cpf, setCpf] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  const loadSession = useCallback(async () => {
    setCheckingSession(true);
    const res = await fetch("/api/candidatura/acompanhar", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setTracking(data.tracking);
    }
    setCheckingSession(false);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/candidatura/acompanhar", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, birthYear: Number(birthYear) }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Não foi possível consultar a candidatura.");
      return;
    }

    setTracking(data.tracking);
  }

  async function handleLogout() {
    await fetch("/api/candidatura/acompanhar", { method: "DELETE" });
    setTracking(null);
    setCpf("");
    setBirthYear("");
  }

  return (
    <>
      <PageHero
        eyebrow="Candidatura"
        title="Acompanhar candidatura"
        subtitle="Consulte o andamento do seu processo de associação à SOBRAPSI."
        backgroundText="STATUS"
      />

      <Section>
        {checkingSession ? (
          <p className="text-center text-muted">Carregando...</p>
        ) : !tracking ? (
          <Card className="max-w-md border-white/10 bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Identifique-se</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted">
                  Informe o CPF e o ano de nascimento usados na candidatura.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthYear">Ano de nascimento</Label>
                  <Input
                    id="birthYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="Ex.: 1985"
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Consultando..." : "Consultar status"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-2xl space-y-6">
            <Card className="border-white/10 bg-zinc-900/50">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{tracking.candidateName}</CardTitle>
                    <p className="mt-1 text-sm text-muted">{tracking.categoryLabel}</p>
                  </div>
                  <Badge>{tracking.statusLabel}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted">
                  Enviada em: {tracking.submittedAtLabel || "—"}
                </p>

                {tracking.isRejected && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                    Sua candidatura foi reprovada neste momento.
                    {tracking.rejectionReason && (
                      <p className="mt-2">{tracking.rejectionReason}</p>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {tracking.steps.map((step) => (
                    <div key={step.id} className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {step.state === "done" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : step.state === "current" ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            step.state === "current" ? "text-white" : step.state === "done" ? "text-zinc-200" : "text-muted"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.state === "current" && (
                          <p className="mt-1 text-sm text-muted">{step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {tracking.complementNotes.length > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                    <p className="mb-2 text-sm font-medium text-amber-200">Solicitações da equipe</p>
                    <ul className="space-y-2 text-sm text-muted">
                      {tracking.complementNotes.map((note) => (
                        <li key={note.id}>
                          <span className="text-xs text-amber-200/70">{note.createdAt}</span>
                          <p>{note.note}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tracking.showPaymentPending && tracking.payment && (
                  <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                    <div>
                      <p className="font-medium text-white">Pagamento pendente</p>
                      <p className="mt-1 text-muted">
                        Cartão: R$ {APPLICATION_FEE_CARD_AMOUNT.toFixed(0)} em até{" "}
                        {ANNUAL_FEE_INSTALLMENTS}x R${" "}
                        {(APPLICATION_FEE_CARD_AMOUNT / ANNUAL_FEE_INSTALLMENTS).toFixed(0)} · PIX ou
                        boleto: R$ {APPLICATION_FEE_CASH_AMOUNT.toFixed(2)}
                        {tracking.payment.dueDate !== "—" && ` · Vencimento: ${tracking.payment.dueDate}`}
                      </p>
                    </div>
                    <PaymentCheckoutPanel
                      paymentId={tracking.payment.id}
                      showRefreshButton={false}
                      onSuccess={loadSession}
                    />
                  </div>
                )}

                {tracking.payment?.status === "exempt" && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm text-green-200">
                    Taxa de associação isenta (aluno de curso parceiro IBRAPSI).
                  </div>
                )}

                {tracking.registrationNumber && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm">
                    <p className="font-medium text-green-200">Registro SOBRAPSI</p>
                    <p className="mt-1 text-white">{tracking.registrationNumber}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {tracking.canResumeCandidature && (
                    <Button asChild>
                      <Link href="/candidatura">Continuar candidatura</Link>
                    </Button>
                  )}
                  {tracking.showPaymentPending && (
                    <Button variant="outline" onClick={loadSession}>
                      Atualizar status
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleLogout}>
                    Sair
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Section>
    </>
  );
}
