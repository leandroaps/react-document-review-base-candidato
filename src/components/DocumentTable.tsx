import { memo } from 'react';
import type { CustomerDocument, DocumentStatus } from '../types';
import { DocumentRow } from './DocumentRow';

interface DocumentTableProps {
  documents: CustomerDocument[];
  onSelect: (document: CustomerDocument) => void;
  onStatusChange: (id: string, status: DocumentStatus) => void;
}

function DocumentTableComponent({ documents, onSelect, onStatusChange }: DocumentTableProps) {
  return (
    <section className="table-card">
      <table>
        <thead>
          <tr>
            <th>Documento</th>
            <th>Cliente</th>
            <th>Categoria</th>
            <th>Status</th>
            <th>Confiança IA</th>
            <th>Criado em</th>
            <th>Responsável</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              onSelect={onSelect}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

export const DocumentTable = memo(DocumentTableComponent);
