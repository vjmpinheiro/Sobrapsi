import type { Metadata } from "next";
import Link from "next/link";
import { ConsentDocumentPage } from "@/components/content/consent-document-page";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/sections";

export const metadata: Metadata = {
  title: "Código de Ética",
  description: "Código de Ética da SOBRAPSI — orientações para a prática psicanalítica.",
};

export default function CodigoEticaPage() {
  return (
    <>
      <ConsentDocumentPage documentId="ethics_code" />
      <Section>
        <Button asChild>
          <Link href="/contato?assunto=etica">Enviar manifestação ao Conselho de Ética</Link>
        </Button>
      </Section>
    </>
  );
}
