import type { Metadata } from "next";
import { ConsentDocumentPage } from "@/components/content/consent-document-page";

export const metadata: Metadata = {
  title: "Aprovação da Candidatura",
  description: "Informações sobre o processo de análise e aprovação de candidaturas à SOBRAPSI.",
};

export default function AprovacaoCandidaturaPage() {
  return <ConsentDocumentPage documentId="not_automatic" />;
}
