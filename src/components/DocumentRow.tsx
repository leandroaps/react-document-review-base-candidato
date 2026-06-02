import { memo } from 'react';
import { statusLabels } from '../constants/status';
import type { CustomerDocument, DocumentStatus } from '../types';
import { formatDate } from '../utils/date';

interface DocumentRowProps {
  document: CustomerDocument;
  onSelect: (document: CustomerDocument) => void;
  onStatusChange: (id: string, status: DocumentStatus) => void;
}

function DocumentRowComponent({ document, onSelect, onStatusChange }: DocumentRowProps) {
  return (
    <tr onClick={() => onSelect(document)}>
      <td>
        <strong>{document.title}</strong>
        <small>{document.id}</small>
      </td>
      <td>
        {document.customerName}
        <small>{document.customerEmail || 'Sem e-mail cadastrado'}</small>
      </td>
      <td>{document.category}</td>
      <td>
        <span className={`badge ${document.status}`}>{statusLabels[document.status]}</span>
      </td>
      <td>{Math.round((document.confidence || 0) * 100)}%</td>
      <td>{formatDate(document.createdAt)}</td>
      <td>{document.assignedTo || 'Não atribuído'}</td>
      <td>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onStatusChange(document.id, 'approved');
          }}
        >
          Aprovar
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onStatusChange(document.id, 'rejected');
          }}
        >
          Rejeitar
        </button>
      </td>
    </tr>
  );
}

export const DocumentRow = memo(DocumentRowComponent);
