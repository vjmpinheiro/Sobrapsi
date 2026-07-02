import type { MemberCategory } from "@/lib/member-types";

export const APPLICATION_STEP_DEFINITIONS = [
  { key: "category", label: "Categoria" },
  { key: "attendingStudy", label: "Estudos atuais" },
  { key: "personal", label: "Dados pessoais" },
  { key: "education", label: "Formação" },
  { key: "psychoanalyticTripod", label: "Tripé psicanalítico", psychoanalystOnly: true as const },
  { key: "professional", label: "Dados profissionais" },
  { key: "documents", label: "Documentos" },
  { key: "consents", label: "Termos e contratos" },
] as const;

export type ApplicationStepKey = (typeof APPLICATION_STEP_DEFINITIONS)[number]["key"];

export function getApplicationStepsForCategory(category: MemberCategory) {
  return APPLICATION_STEP_DEFINITIONS.filter(
    (step) => !("psychoanalystOnly" in step && step.psychoanalystOnly) || category === "psychoanalyst"
  );
}

export function getApplicationStepIndex(
  category: MemberCategory,
  stepKey: ApplicationStepKey
): number {
  const steps = getApplicationStepsForCategory(category);
  const index = steps.findIndex((step) => step.key === stepKey);
  return index === -1 ? 1 : index + 1;
}

export function getApplicationStepKey(
  category: MemberCategory,
  stepIndex: number
): ApplicationStepKey | undefined {
  return getApplicationStepsForCategory(category)[stepIndex - 1]?.key;
}
