import type { CustomerDocument } from './types';

export const documents: CustomerDocument[] = [
  {
    id: 'doc-001',
    title: 'Contrato Social - ACME LTDA',
    customerName: 'ACME LTDA',
    customerEmail: 'financeiro@acme.com',
    status: 'pending',
    category: 'Contrato',
    createdAt: '2026-05-26T10:30:00Z',
    confidence: 0.74,
    assignedTo: null
  },
  {
    id: 'doc-002',
    title: 'Nota Fiscal 98217',
    customerName: 'Mercado Azul',
    status: 'approved',
    category: 'Fiscal',
    createdAt: '2026-05-27T13:10:00Z',
    updatedAt: '2026-05-27T14:20:00Z',
    confidence: 0.96,
    assignedTo: 'Marina'
  },
  {
    id: 'doc-003',
    title: 'Comprovante de Endereço',
    customerName: 'João Pereira',
    customerEmail: 'joao@email.com',
    status: 'reviewing',
    category: 'Cadastro',
    createdAt: '2026-05-29T08:05:00Z',
    confidence: 0.62,
    assignedTo: 'Rafa'
  },
  {
    id: 'doc-004',
    title: 'DANFE 445901',
    customerName: 'Transportes Bela Vista',
    status: 'rejected',
    category: 'Fiscal',
    createdAt: '2026-05-30T16:45:00Z',
    updatedAt: '2026-05-30T17:01:00Z',
    confidence: 0.41,
    assignedTo: 'Marina'
  },
  {
    id: 'doc-005',
    title: 'Balanço Patrimonial 2025',
    customerName: 'Grupo Solar',
    customerEmail: 'contabilidade@gruposolar.com',
    status: 'pending',
    category: 'Financeiro',
    createdAt: '2026-06-01T12:22:00Z',
    confidence: 0.81,
    assignedTo: null
  },
  {
    id: 'doc-006',
    title: 'Procuração Digitalizada',
    customerName: 'Carla Mendes',
    status: 'reviewing',
    category: 'Jurídico',
    createdAt: '2026-06-01T18:12:00Z',
    confidence: 0.59,
    assignedTo: 'Diego'
  }
];
