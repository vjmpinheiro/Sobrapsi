import type { Metadata } from "next";
import { ConsentDocumentPage } from "@/components/content/consent-document-page";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de Privacidade da SOBRAPSI em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  return <ConsentDocumentPage documentId="privacy_policy" />;
}
