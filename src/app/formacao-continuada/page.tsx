import type { Metadata } from "next";
import { PageHero, Section, SectionHeader } from "@/components/layout/sections";

export const metadata: Metadata = {
  title: "Formação Continuada",
  description: "Formação continuada, supervisão e rede de análise da SOBRAPSI.",
};

const AREAS = [
  { title: "Cursos e seminários", desc: "Espaços de estudo teórico e debate clínico." },
  { title: "Grupos de estudo", desc: "Leituras e discussões orientadas por associados." },
  { title: "Eventos científicos", desc: "Congressos, jornadas e seminários." },
  { title: "Supervisões", desc: "Acompanhamento da prática clínica." },
  { title: "Rede de análise", desc: "Espaço de formação prática e escuta." },
  { title: "Biblioteca", desc: "Acervo de referências psicanalíticas." },
  { title: "Publicações", desc: "Artigos, textos e chamadas científicas." },
  { title: "Apoio profissional", desc: "Orientações institucionais e modelos." },
  { title: "Marketing ético", desc: "Diretrizes para presença profissional responsável." },
];

export default function FormacaoContinuadaPage() {
  return (
    <>
      <PageHero
        eyebrow="Formação"
        title="Formação Continuada"
        subtitle="A formação do psicanalista não termina em um certificado."
        backgroundText="FORMAÇÃO"
      />

      <Section>
        <p className="max-w-3xl text-lg leading-relaxed text-muted">
          A SOBRAPSI promove espaços de formação continuada, debate teórico,
          supervisão, análise institucional e produção intelectual, contribuindo
          para que seus associados mantenham uma relação viva com a psicanálise.
        </p>
      </Section>

      <Section variant="card">
        <SectionHeader title="Áreas de formação" align="center" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((area) => (
            <div
              key={area.title}
              className="rounded-xl border border-white/10 bg-zinc-900/50 p-6"
            >
              <h3 className="mb-2 font-bold text-white">{area.title}</h3>
              <p className="text-sm text-muted">{area.desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
