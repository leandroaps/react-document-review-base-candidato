import type { DocumentStatus } from '../types';

export const statusLabels: Record<DocumentStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  reviewing: 'Em análise',
};
