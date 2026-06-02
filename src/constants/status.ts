import type { DocumentStatus } from "@typing/document";

export const statusLabels: Record<DocumentStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  reviewing: "Em análise",
};
