import type { Metadata } from "next";
import { PageHero, Section } from "@/components/layout/sections";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Política de Cookies da SOBRAPSI.",
};

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Cookies"
        title="Política de Cookies"
        subtitle="Como utilizamos cookies e tecnologias similares."
        backgroundText="COOKIES"
      />
      <Section>
        <p className="max-w-3xl text-muted leading-relaxed">
          A SOBRAPSI utiliza cookies essenciais para o funcionamento do site e,
          quando aplicável, ferramentas de analytics respeitando a privacidade
          (como Plausible ou Umami), evitando excesso de rastreamento.
        </p>
      </Section>
    </>
  );
}
