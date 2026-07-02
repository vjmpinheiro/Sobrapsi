import type { Metadata } from "next";
import { PageHero, Section } from "@/components/layout/sections";

export const metadata: Metadata = {
  title: "Rede de Análise e Supervisão",
  description: "Rede de Análise e Supervisão da SOBRAPSI.",
};

const SECTIONS = [
  { title: "O que é a rede", desc: "Espaço de formação prática, escuta e acompanhamento voltado a estudantes e profissionais em formação." },
  { title: "Quem pode participar", desc: "Estudantes e profissionais em formação, conforme critérios institucionais." },
  { title: "Como funciona", desc: "Organização por grupos, com acompanhamento de analistas e supervisores." },
  { title: "Papel do analisando", desc: "Compromisso com assiduidade, escuta e sigilo." },
  { title: "Papel do supervisor", desc: "Orientação clínica e transmissão da experiência." },
  { title: "Critérios de participação", desc: "Vínculo associativo e requisitos por categoria." },
  { title: "Sigilo e ética", desc: "Confidencialidade como princípio fundamental." },
  { title: "Limites éticos", desc: "A rede não substitui formação institucional completa." },
];

export default function RedeAnalisePage() {
  return (
    <>
      <PageHero
        eyebrow="Rede"
        title="Rede de Análise e Supervisão"
        subtitle="Fortalecendo o tripé fundamental da formação psicanalítica: estudo teórico, análise pessoal e supervisão."
        backgroundText="REDE"
      />

      <Section>
        <p className="max-w-3xl text-lg leading-relaxed text-muted">
          A Rede de Análise e Supervisão é um espaço de formação prática, escuta e
          acompanhamento, voltado a estudantes e profissionais em formação. Seu
          objetivo é fortalecer o tripé fundamental da formação psicanalítica.
        </p>
      </Section>

      <Section variant="card">
        <div className="grid gap-6 md:grid-cols-2">
          {SECTIONS.map((section, i) => (
            <div
              key={section.title}
              className="rounded-xl border border-white/10 p-6"
            >
              <span className="mb-2 inline-block text-xs font-bold text-primary">
                MÓDULO {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 font-bold text-white">{section.title}</h3>
              <p className="text-sm text-muted">{section.desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
