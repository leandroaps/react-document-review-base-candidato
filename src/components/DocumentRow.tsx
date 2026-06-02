import { statusLabels } from "@constants/status";
import type { CustomerDocument, DocumentStatus } from "@typing/document";
import { formatDate } from "@utils/date";
import { forwardRef, memo } from "react";

interface DocumentRowProps {
  document: CustomerDocument;
  /** Índice real no array, usado pelo virtualizer para medir a linha. */
  index: number;
  /** Deslocamento vertical (px) calculado pelo virtualizer. */
  start: number;
  onSelect: (document: CustomerDocument) => void;
  onStatusChange: (id: string, status: DocumentStatus) => void;
}

const DocumentRowComponent = forwardRef<HTMLDivElement, DocumentRowProps>(
  function DocumentRow(
    { document, index, start, onSelect, onStatusChange },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-index={index}
        className="grid-row grid-body__row"
        role="row"
        onClick={() => onSelect(document)}
        style={{ transform: `translateY(${start}px)` }}
      >
        <span className="grid-cell" role="cell">
          <strong>{document.title}</strong>
          <small>{document.id}</small>
        </span>
        <span className="grid-cell" role="cell">
          {document.customerName}
          <small>{document.customerEmail || "Sem e-mail cadastrado"}</small>
        </span>
        <span className="grid-cell" role="cell">
          {document.category}
        </span>
        <span className="grid-cell" role="cell">
          <span className={`badge ${document.status}`}>
            {statusLabels[document.status]}
          </span>
        </span>
        <span className="grid-cell" role="cell">
          {Math.round((document.confidence || 0) * 100)}%
        </span>
        <span className="grid-cell" role="cell">
          {formatDate(document.createdAt)}
        </span>
        <span className="grid-cell" role="cell">
          {document.assignedTo || "Não atribuído"}
        </span>
        <span className="grid-cell grid-cell--actions" role="cell">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onStatusChange(document.id, "approved");
            }}
          >
            Aprovar
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onStatusChange(document.id, "rejected");
            }}
          >
            Rejeitar
          </button>
        </span>
      </div>
    );
  },
);

export const DocumentRow = memo(DocumentRowComponent);
