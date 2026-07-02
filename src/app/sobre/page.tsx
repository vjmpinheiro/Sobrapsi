import type { Metadata } from "next";
import { PageHero, Section, SectionHeader } from "@/components/layout/sections";

export const metadata: Metadata = {
  title: "Sobre a SOBRAPSI",
  description:
    "Conheça a história, missão, visão e valores da Sociedade Brasileira de Psicanálise.",
};

const VALUES = [
  "Ética",
  "Responsabilidade",
  "Formação permanente",
  "Respeito à singularidade",
  "Transmissão da psicanálise",
  "Compromisso institucional",
  "Diálogo entre teoria e prática",
  "Reconhecimento entre pares",
];

export default function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Institucional"
        title="Sobre a SOBRAPSI"
        subtitle="Uma entidade associativa dedicada ao fortalecimento da psicanálise no Brasil."
        backgroundText="SOBRE"
      />

      <Section>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-muted">
            A Sociedade Brasileira de Psicanálise — SOBRAPSI — é uma entidade
            associativa dedicada ao fortalecimento da psicanálise no Brasil por
            meio da formação continuada, da ética, da supervisão, da produção
            intelectual, da organização de eventos e da construção de uma rede
            nacional de psicanalistas e estudantes.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            A SOBRAPSI compreende que a formação do psicanalista não se reduz à
            obtenção de certificados. Ela envolve estudo permanente, análise
            pessoal, supervisão, experiência clínica, transmissão teórica e
            compromisso ético com a escuta.
          </p>
        </div>
      </Section>

      <Section variant="card">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
              Missão
            </h3>
            <p className="text-muted leading-relaxed">
              Promover a psicanálise no Brasil por meio de uma rede associativa
              comprometida com a ética, a formação continuada, a supervisão e a
              responsabilidade clínica.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
              Visão
            </h3>
            <p className="text-muted leading-relaxed">
              Ser uma referência nacional em associação psicanalítica,
              contribuindo para a valorização, organização e qualificação da
              prática psicanalítica.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
              Valores
            </h3>
            <ul className="space-y-2">
              {VALUES.map((value) => (
                <li key={value} className="text-sm text-muted">
                  • {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader
          title="Estrutura institucional"
          subtitle="Transparência e organização como pilares da sociedade."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Diretoria",
            "Conselho de Ética",
            "Conselho Científico",
            "Documentos institucionais",
            "Instituições parceiras",
            "Transparência institucional",
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/10 p-6 transition-colors hover:border-primary/30"
            >
              <h3 className="font-bold text-white">{item}</h3>
              <p className="mt-2 text-sm text-muted">
                Informações serão publicadas conforme atualização institucional.
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
