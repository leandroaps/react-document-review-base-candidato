import { statusLabels } from "@constants/status";
import type { CustomerDocument, DocumentStatus } from "@typing/document";
import { formatDate } from "@utils/date";
import { forwardRef, memo, type KeyboardEvent } from "react";

interface DocumentRowProps {
  document: CustomerDocument;
  /** Índice real no array, usado pelo virtualizer para medir a linha. */
  index: number;
  /** Total de linhas, usado para navegar até o fim (tecla End). */
  count: number;
  /** Deslocamento vertical (px) calculado pelo virtualizer. */
  start: number;
  /** Roving tabindex: só a linha "ativa" é alcançável por Tab. */
  isFocused: boolean;
  onSelect: (document: CustomerDocument) => void;
  onStatusChange: (id: string, status: DocumentStatus) => void;
  /** Move o foco do teclado para a linha de índice informado. */
  onNavigate: (index: number) => void;
}

const DocumentRowComponent = forwardRef<HTMLDivElement, DocumentRowProps>(
  function DocumentRow(
    {
      document,
      index,
      count,
      start,
      isFocused,
      onSelect,
      onStatusChange,
      onNavigate,
    },
    ref,
  ) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      // Ignora teclas originadas nos botões de ação (Aprovar/Rejeitar).
      if (event.target !== event.currentTarget) {
        return;
      }

      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          onSelect(document);
          break;
        case "ArrowDown":
          event.preventDefault();
          onNavigate(index + 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          onNavigate(index - 1);
          break;
        case "Home":
          event.preventDefault();
          onNavigate(0);
          break;
        case "End":
          event.preventDefault();
          onNavigate(count - 1);
          break;
      }
    };

    return (
      <div
        ref={ref}
        data-index={index}
        className="grid-row grid-body__row"
        role="row"
        aria-rowindex={index + 2}
        tabIndex={isFocused ? 0 : -1}
        onClick={() => onSelect(document)}
        onKeyDown={handleKeyDown}
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
