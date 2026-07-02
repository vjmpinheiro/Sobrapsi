import type { Metadata } from "next";
import { ConsentDocumentPage } from "@/components/content/consent-document-page";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de Uso do site e plataforma da SOBRAPSI.",
};

export default function TermosPage() {
  return <ConsentDocumentPage documentId="terms_of_use" />;
}
