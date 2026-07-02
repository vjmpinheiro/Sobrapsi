export type KanbanColumn = {
  status: string;
  label: string;
  matchStatuses: string[];
};

export const ADMIN_KANBAN_COLUMNS: KanbanColumn[] = [
  { status: "draft", label: "Rascunho", matchStatuses: ["draft"] },
  { status: "submitted", label: "Enviada", matchStatuses: ["submitted"] },
  { status: "awaiting_review", label: "Recebida", matchStatuses: ["awaiting_review"] },
  { status: "in_review", label: "Em verificação", matchStatuses: ["in_review", "complemented"] },
  {
    status: "awaiting_complement",
    label: "Aguardando informações",
    matchStatuses: ["awaiting_complement"],
  },
  {
    status: "approved_pending_payment",
    label: "Aguardando pagamento",
    matchStatuses: ["approved_pending_payment"],
  },
  { status: "approved", label: "Aprovado", matchStatuses: ["approved"] },
  { status: "rejected", label: "Reprovada", matchStatuses: ["rejected"] },
];

export const ADMIN_UPDATABLE_STATUSES = ADMIN_KANBAN_COLUMNS.map((c) => c.status);

export function kanbanColumnForStatus(status: string): KanbanColumn {
  return (
    ADMIN_KANBAN_COLUMNS.find((col) => col.matchStatuses.includes(status)) ??
    ADMIN_KANBAN_COLUMNS[0]
  );
}

export function appsInColumn<T extends { status: string }>(
  applications: T[],
  column: KanbanColumn
): T[] {
  return applications.filter((app) => column.matchStatuses.includes(app.status));
}
