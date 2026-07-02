import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  InstitutionalNotice,
  PageHero,
  Section,
  SectionHeader,
} from "@/components/layout/sections";
import { BENEFITS, MEMBERSHIP_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Associe-se",
  description:
    "Faça parte da SOBRAPSI — sociedade psicanalítica dedicada à formação continuada, ética e supervisão.",
};

const STEPS = [
  "Crie sua conta",
  "Escolha sua categoria",
  "Preencha seus dados pessoais",
  "Informe sua formação e currículo",
  "Envie os documentos solicitados",
  "Aceite os termos e a política de privacidade",
  "Envie sua candidatura",
  "Aguarde análise",
  "Se aprovado, receba seu número de registro e carteira digital",
  "Seu perfil institucional poderá ser publicado na consulta de associados ativos",
];

const ELIGIBLE = [
  "Estudantes de psicanálise",
  "Alunos de instituições parceiras",
  "Psicanalistas formados",
  "Profissionais em formação continuada",
  "Supervisores",
  "Pesquisadores",
  "Instituições formadoras",
];

export default function AssocieSePage() {
  return (
    <>
      <PageHero
        eyebrow="Associação"
        title="Associe-se à SOBRAPSI"
        subtitle="Faça parte de uma sociedade psicanalítica dedicada à formação continuada, à ética e ao desenvolvimento da prática psicanalítica."
        backgroundText="ASSOCIE"
      >
        <Button size="lg" asChild>
          <Link href="/candidatura">Iniciar candidatura</Link>
        </Button>
      </PageHero>

      <Section>
        <p className="max-w-3xl text-lg leading-relaxed text-muted">
          A associação à SOBRAPSI é destinada a estudantes, psicanalistas,
          supervisores, pesquisadores e instituições que compartilham o
          compromisso com a psicanálise, a ética e a formação permanente. O
          processo é feito por candidatura online e a aprovação não é automática.
        </p>
      </Section>

      <Section variant="card">
        <SectionHeader title="Quem pode se candidatar" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ELIGIBLE.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-white/10 px-4 py-3 text-sm text-zinc-200"
            >
              {item}
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          title="Categorias de associação"
          align="center"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MEMBERSHIP_CATEGORIES.map((cat, i) => (
            <div
              key={cat.id}
              className="rounded-xl border border-white/10 bg-zinc-900/50 p-6"
            >
              <span className="mb-3 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                CATEGORIA {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 text-lg font-bold text-white">{cat.title}</h3>
              <p className="text-sm leading-relaxed text-muted">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="card" id="beneficios">
        <SectionHeader title="Benefícios" />
        <div className="grid gap-3 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit}
              className="flex items-start gap-3 rounded-lg border border-white/5 px-4 py-3"
            >
              <span className="mt-1 text-primary">✓</span>
              <span className="text-sm text-zinc-200">{benefit}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader title="O que a associação não é" />
        <InstitutionalNotice>
          A associação à SOBRAPSI não substitui a formação psicanalítica, a
          análise pessoal, a supervisão clínica nem a responsabilidade ética do
          profissional. A SOBRAPSI não é conselho profissional, não exerce
          fiscalização estatal e não concede, por si só, autorização legal para
          atuação clínica. Sua função é associativa, institucional, científica,
          cultural e formativa.
        </InstitutionalNotice>
      </Section>

      <Section variant="card">
        <SectionHeader title="Como funciona" />
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-1 text-muted">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Button size="lg" asChild>
            <Link href="/candidatura">Iniciar candidatura</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
