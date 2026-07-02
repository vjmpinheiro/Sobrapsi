import type { Metadata } from "next";
import { ConsentDocumentPage } from "@/components/content/consent-document-page";

export const metadata: Metadata = {
  title: "Declaração de Veracidade",
  description: "Declaração de veracidade das informações prestadas na candidatura à SOBRAPSI.",
};

export default function DeclaracaoVeracidadePage() {
  return <ConsentDocumentPage documentId="veracity" />;
}
