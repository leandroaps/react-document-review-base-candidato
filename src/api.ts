import { documents } from './data';
import type { CustomerDocument, DocumentStatus } from './types';

let state = [...documents];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchDocuments(): Promise<CustomerDocument[]> {
  await wait(600);

  // Simula instabilidade ocasional. O candidato deve decidir como lidar com erro.
  if (Math.random() < 0.03) {
    throw new Error('Falha ao carregar documentos');
  }

  return [...state];
}

export async function updateDocumentStatus(id: string, status: DocumentStatus): Promise<CustomerDocument> {
  await wait(350);

  const document = state.find((item) => item.id === id);
  if (!document) {
    throw new Error('Documento não encontrado');
  }

  const updated = {
    ...document,
    status,
    updatedAt: new Date().toISOString()
  };

  state = state.map((item) => (item.id === id ? updated : item));
  return updated;
}
