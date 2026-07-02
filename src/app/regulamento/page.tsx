import type { Metadata } from "next";
import { ConsentDocumentPage } from "@/components/content/consent-document-page";

export const metadata: Metadata = {
  title: "Regulamento de Associação",
  description: "Regulamento de associação da SOBRAPSI.",
};

export default function RegulamentoPage() {
  return <ConsentDocumentPage documentId="regulation" />;
}
