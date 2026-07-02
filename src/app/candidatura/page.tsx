import type { Metadata } from "next";
import { CandidaturaWizard } from "@/components/portal/candidatura-wizard";

export const metadata: Metadata = {
  title: "Candidatura",
  description: "Formulário de candidatura à SOBRAPSI.",
};

export default function CandidaturaPublicPage() {
  return <CandidaturaWizard />;
}
