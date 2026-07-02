export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  submitted: "Enviada",
  awaiting_review: "Recebida",
  in_review: "Em verificação",
  awaiting_complement: "Aguardando informações",
  complemented: "Informações complementadas",
  approved_pending_payment: "Aprovada — aguardando pagamento",
  approved: "Aprovada",
  rejected: "Reprovada",
  cancelled_by_candidate: "Cancelada",
  expired: "Expirada",
};

export type CandidateTrackingStepId =
  | "submitted"
  | "received"
  | "in_review"
  | "awaiting_info"
  | "approved_pending_payment"
  | "approved";

export const CANDIDATE_TRACKING_STEPS: {
  id: CandidateTrackingStepId;
  label: string;
  description: string;
}[] = [
  {
    id: "submitted",
    label: "Enviada",
    description: "Sua candidatura foi enviada com sucesso.",
  },
  {
    id: "received",
    label: "Recebida",
    description: "A SOBRAPSI recebeu sua candidatura e ela está na fila de análise.",
  },
  {
    id: "in_review",
    label: "Em verificação",
    description: "A equipe responsável está revisando seus documentos e informações.",
  },
  {
    id: "awaiting_info",
    label: "Aguardando informações",
    description: "Foram solicitados documentos ou esclarecimentos adicionais.",
  },
  {
    id: "approved_pending_payment",
    label: "Aprovado, aguardando pagamento",
    description: "Sua candidatura foi aprovada. Efetue o pagamento da taxa associativa para concluir.",
  },
  {
    id: "approved",
    label: "Aprovado",
    description: "Candidatura concluída. Você já pode acessar os benefícios da associação.",
  },
];

const STEP_ORDER: CandidateTrackingStepId[] = [
  "submitted",
  "received",
  "in_review",
  "awaiting_info",
  "approved_pending_payment",
  "approved",
];

type TrackingInput = {
  status: string;
  payments?: { type: string; status: string }[];
  hasMember?: boolean;
};

export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

export function cpfMatches(stored: string | null | undefined, input: string): boolean {
  if (!stored) return false;
  return normalizeCpf(stored) === normalizeCpf(input);
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  return digit === Number(cpf[10]);
}

export function formatCpfInput(value: string): string {
  const digits = normalizeCpf(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** Senha inicial padrão: data de nascimento no formato DD/MM/AAAA */
export function formatBirthDateAsPassword(birthDate: Date | string | null | undefined): string | null {
  if (!birthDate) return null;

  if (typeof birthDate === "string") {
    const iso = birthDate.slice(0, 10);
    const [year, month, day] = iso.split("-");
    if (!year || !month || !day) return null;
    return `${day}/${month}/${year}`;
  }

  const day = String(birthDate.getUTCDate()).padStart(2, "0");
  const month = String(birthDate.getUTCMonth() + 1).padStart(2, "0");
  const year = String(birthDate.getUTCFullYear());
  return `${day}/${month}/${year}`;
}

/** Normaliza entrada da senha quando o associado digita a data de nascimento */
export function normalizeBirthDatePasswordInput(input: string): string {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 8) {
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    return `${day}/${month}/${year}`;
  }

  const parts = trimmed.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }

  return trimmed;
}

export function birthYearMatches(
  birthDate: Date | string | null | undefined,
  year: number
): boolean {
  if (!birthDate) return false;
  const d = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  return d.getFullYear() === year;
}

/** Rascunho só persiste no banco quando e-mail e telefone estão preenchidos. */
export function hasPersistableDraftContact(data: {
  email?: string | null;
  phone?: string | null;
}): boolean {
  const email = data.email?.trim() ?? "";
  const phone = data.phone?.replace(/\D/g, "") ?? "";
  return email.includes("@") && email.length >= 5 && phone.length >= 10;
}

export function resolveCandidateTrackingStep(input: TrackingInput): CandidateTrackingStepId {
  const { status } = input;

  if (status === "approved_pending_payment") {
    return "approved_pending_payment";
  }

  if (status === "approved") {
    return "approved";
  }

  if (status === "awaiting_complement") return "awaiting_info";
  if (status === "in_review" || status === "complemented") return "in_review";
  if (status === "awaiting_review") return "received";
  if (status === "submitted") return "submitted";

  return "submitted";
}

export function getCandidateStatusLabel(input: TrackingInput): string {
  const step = resolveCandidateTrackingStep(input);
  return CANDIDATE_TRACKING_STEPS.find((s) => s.id === step)?.label ?? "Em andamento";
}

export function getTrackingStepStates(currentStep: CandidateTrackingStepId) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const isFullyApproved = currentStep === "approved";

  return CANDIDATE_TRACKING_STEPS.map((step) => {
    const index = STEP_ORDER.indexOf(step.id);
    if (isFullyApproved || index < currentIndex) return { ...step, state: "done" as const };
    if (index === currentIndex) return { ...step, state: "current" as const };
    return { ...step, state: "pending" as const };
  });
}

export const DOCUMENT_TYPES = [
  { id: "identity", label: "Documento de identidade" },
  { id: "cpf", label: "CPF" },
  { id: "proof_of_address", label: "Comprovante de endereço" },
  { id: "certificate", label: "Certificado / diploma de formação em psicanálise" },
  { id: "enrollment", label: "Comprovante de matrícula em curso de psicanálise" },
  { id: "analysis_sessions_proof", label: "Comprovante de sessões de análise" },
  { id: "supervision_sessions_proof", label: "Comprovante de sessões de supervisão" },
  { id: "declaration", label: "Declaração" },
  { id: "other", label: "Outro documento" },
  { id: "profile_photo", label: "Foto de perfil público" },
] as const;

export function requiredDocumentsForCategory(category: import("@/lib/member-types").MemberCategory) {
  const base = ["identity", "proof_of_address"];

  switch (category) {
    case "student":
      return [...base, "enrollment"];
    case "psychoanalyst":
      return [...base, "certificate"];
    case "supervisor":
      return base;
    case "institutional":
      return ["identity", "proof_of_address", "other"];
    default:
      return base;
  }
}

export function optionalDocumentsForCategory(
  category: import("@/lib/member-types").MemberCategory
) {
  if (category === "psychoanalyst") {
    return ["analysis_sessions_proof", "supervision_sessions_proof"];
  }
  return [];
}
