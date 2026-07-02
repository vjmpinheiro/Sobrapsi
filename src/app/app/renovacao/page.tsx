"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero, Section } from "@/components/layout/sections";
import { PaymentCheckoutPanel } from "@/components/payments/payment-checkout-panel";
import {
  ANNUAL_FEE_CARD_AMOUNT,
  ANNUAL_FEE_CASH_AMOUNT,
  ANNUAL_FEE_INSTALLMENTS,
  STATUS_LABELS,
} from "@/lib/constants";
import { PAYMENT_STATUS_LABELS, PAYMENT_TYPE_LABELS } from "@/lib/payment-shared";
import { formatDate } from "@/lib/utils";

interface MemberInfo {
  id: string;
  registrationNumber: string;
  status: string;
  validUntil?: string;
  needsRenewal: boolean;
}

interface Payment {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
}

export default function RenovacaoPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/payments", { credentials: "include", cache: "no-store" });
    const data = await res.json();
    if (!data.member) {
      router.push("/app");
      return;
    }
    setMember(data.member);
    setPayments(data.payments ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [router]);

  async function handleCreateRenewal() {
    setProcessing(true);
    setMessage("");
    const res = await fetch("/api/payments", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_renewal" }),
    });
    const data = await res.json();
    setProcessing(false);
    if (res.ok) {
      setMessage("Cobrança de renovação criada. Escolha a forma de pagamento abaixo.");
      load();
    } else {
      setMessage(data.error ?? "Erro ao criar cobrança");
    }
  }

  if (loading) {
    return (
      <Section>
        <p className="text-center text-muted">Carregando...</p>
      </Section>
    );
  }

  if (!member) return null;

  const pendingPayment = payments.find((p) => p.status === "pending");
  const statusLabel = STATUS_LABELS[member.status as keyof typeof STATUS_LABELS] ?? member.status;
  const installmentValue = ANNUAL_FEE_CARD_AMOUNT / ANNUAL_FEE_INSTALLMENTS;

  return (
    <>
      <PageHero
        eyebrow="Renovação"
        title="Renovar Associação"
        subtitle="Mantenha seu registro SOBRAPSI ativo"
      />

      <Section>
        <div className="max-w-2xl space-y-6">
          <Card className="border-white/10 bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Situação atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted">Registro:</span>{" "}
                <span className="font-mono text-primary">{member.registrationNumber}</span>
              </p>
              <p>
                <span className="text-muted">Status:</span>{" "}
                <Badge variant={member.status === "active" ? "success" : "warning"}>
                  {statusLabel}
                </Badge>
              </p>
              <p>
                <span className="text-muted">Validade:</span> {formatDate(member.validUntil)}
              </p>
              <div className="pt-2 text-muted">
                <p>
                  Cartão:{" "}
                  <strong className="text-white">
                    R$ {ANNUAL_FEE_CARD_AMOUNT.toFixed(0)} em até {ANNUAL_FEE_INSTALLMENTS}x R${" "}
                    {installmentValue.toFixed(0)}
                  </strong>
                </p>
                <p>
                  PIX ou boleto:{" "}
                  <strong className="text-white">R$ {ANNUAL_FEE_CASH_AMOUNT.toFixed(2)}</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {message && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
              {message}
            </div>
          )}

          {!pendingPayment && member.needsRenewal && (
            <Button className="w-full" onClick={handleCreateRenewal} disabled={processing}>
              {processing ? "Processando..." : "Gerar cobrança de renovação"}
            </Button>
          )}

          {!member.needsRenewal && (
            <p className="text-center text-sm text-muted">
              Sua associação está ativa. A renovação ficará disponível 30 dias antes do vencimento.
            </p>
          )}

          {pendingPayment && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Pagamento pendente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted">
                  {PAYMENT_TYPE_LABELS[pendingPayment.type] ?? pendingPayment.type}
                </p>
                <PaymentCheckoutPanel
                  paymentId={pendingPayment.id}
                  onSuccess={() => {
                    setMessage("Pagamento confirmado! Sua associação foi renovada.");
                    load();
                  }}
                />
              </CardContent>
            </Card>
          )}

          {payments.length > 0 && (
            <Card className="border-white/10 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-base">Histórico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-sm"
                    >
                      <div>
                        <p>{PAYMENT_TYPE_LABELS[p.type] ?? p.type}</p>
                        <p className="text-xs text-muted">{formatDate(p.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p>R$ {Number(p.amount).toFixed(2)}</p>
                        <Badge variant={p.status === "paid" ? "success" : "outline"}>
                          {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button variant="ghost" asChild>
            <Link href="/app">← Voltar ao portal</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
