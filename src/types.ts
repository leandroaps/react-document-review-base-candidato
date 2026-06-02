// Arquivo propositalmente incompleto. O candidato deve melhorar a modelagem.
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'reviewing';

export type CustomerDocument = {
  id: string;
  title: string;
  customerName: string;
  customerEmail?: string;
  status: DocumentStatus;
  category: string;
  createdAt: string;
  updatedAt?: string;
  confidence?: number;
  assignedTo?: string | null;
};
