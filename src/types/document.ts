export type DocumentStatus = "pending" | "approved" | "rejected" | "reviewing";

export interface CustomerDocument {
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
}

export type StatusFilter = DocumentStatus | "all";

export interface DocumentStats {
  total: number;
  pending: number;
  reviewing: number;
  rejected: number;
}
