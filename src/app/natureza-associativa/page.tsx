import type { Metadata } from "next";
import { ConsentDocumentPage } from "@/components/content/consent-document-page";

export const metadata: Metadata = {
  title: "Natureza da Associação",
  description: "O que representa e o que não substitui a associação à SOBRAPSI.",
};

export default function NaturezaAssociativaPage() {
  return <ConsentDocumentPage documentId="not_substitute" />;
}
