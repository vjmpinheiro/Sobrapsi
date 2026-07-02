"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero, Section } from "@/components/layout/sections";
import { STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface CardData {
  name: string;
  registrationNumber: string;
  categoryLabel: string;
  status: string;
  validUntil?: string;
  issuedAt: string;
  validationUrl: string;
  qrDataUrl: string;
  daysUntilExpiry: number | null;
}

export default function CarteiraPage() {
  const router = useRouter();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/members/card")
      .then((r) => r.json())
      .then((data) => {
        if (!data.card) {
          if (data.error) setError(data.error);
          router.push("/app");
          return;
        }
        setCard(data.card);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <Section>
        <p className="text-center text-muted">Carregando carteira...</p>
      </Section>
    );
  }

  if (!card) {
    return (
      <Section>
        <p className="text-center text-muted">{error || "Carteira não disponível"}</p>
        <div className="mt-4 text-center">
          <Button variant="outline" asChild>
            <Link href="/app">Voltar ao portal</Link>
          </Button>
        </div>
      </Section>
    );
  }

  const statusLabel = STATUS_LABELS[card.status as keyof typeof STATUS_LABELS] ?? card.status;
  const isExpiring = card.daysUntilExpiry !== null && card.daysUntilExpiry <= 30;

  return (
    <>
      <PageHero
        eyebrow="Carteira"
        title="Carteira Digital"
        subtitle="Sua identificação institucional SOBRAPSI"
      />

      <Section>
        <div className="max-w-lg space-y-6">
          {isExpiring && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Sua associação vence em {card.daysUntilExpiry} dias.{" "}
              <Link href="/app/renovacao" className="underline">
                Renovar agora
              </Link>
            </div>
          )}

          {/* Visual card */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
            <div className="bg-primary px-6 py-4">
              <p className="text-lg font-bold text-white">SOBRAPSI</p>
              <p className="text-xs text-white/70">Sociedade Brasileira de Psicanálise</p>
            </div>
            <div className="flex items-start justify-between gap-4 p-6">
              <div className="space-y-2">
                <p className="text-xl font-bold text-white">{card.name}</p>
                <p className="font-mono text-sm text-primary">{card.registrationNumber}</p>
                <p className="text-sm text-muted">{card.categoryLabel}</p>
                <Badge variant={card.status === "active" ? "success" : "warning"}>
                  {statusLabel}
                </Badge>
                <p className="text-xs text-muted">
                  Validade: {formatDate(card.validUntil)}
                </p>
                <p className="text-xs text-muted">
                  Emissão: {formatDate(card.issuedAt)}
                </p>
              </div>
              <div className="shrink-0 rounded-lg bg-white p-2">
                <Image
                  src={card.qrDataUrl}
                  alt="QR Code de validação"
                  width={120}
                  height={120}
                  unoptimized
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" asChild>
              <a href="/api/members/card/pdf" download>
                Baixar PDF
              </a>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href={card.validationUrl} target="_blank">
                Link de validação
              </Link>
            </Button>
          </div>

          <Card className="border-white/10 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-base">Como validar</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted">
              <p>
                O QR code aponta para a página pública de validação. Qualquer pessoa pode
                verificar se seu registro está ativo — sem exposição de dados sensíveis.
              </p>
            </CardContent>
          </Card>

          <Button variant="ghost" asChild>
            <Link href="/app">← Voltar ao portal</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
