import { useVirtualizer } from "@tanstack/react-virtual";
import type { CustomerDocument, DocumentStatus } from "@typing/document";
import { useCallback, useEffect, useRef, useState } from "react";
import { DocumentRow } from "./DocumentRow";

interface DocumentTableProps {
  documents: CustomerDocument[];
  onSelect: (document: CustomerDocument) => void;
  onStatusChange: (id: string, status: DocumentStatus) => void;
}

const COLUMNS = [
  "Documento",
  "Cliente",
  "Categoria",
  "Status",
  "Confiança IA",
  "Criado em",
  "Responsável",
  "Ações",
] as const;

/** Altura estimada de uma linha; ajustada por medição real após renderizar. */
const ESTIMATED_ROW_HEIGHT = 72;

export function DocumentTable({
  documents,
  onSelect,
  onStatusChange,
}: DocumentTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Índice que detém o tabindex (roving tabindex). Mantido em sincronia
  // mesmo quando a lista encolhe via filtro.
  const [focusedIndex, setFocusedIndex] = useState(0);
  // Índice cujo foco DOM ainda precisa ser aplicado após o scroll/render.
  const pendingFocusRef = useRef<number | null>(null);

  const virtualizer = useVirtualizer({
    count: documents.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 6,
  });

  const virtualRows = virtualizer.getVirtualItems();

  const lastIndex = Math.max(0, documents.length - 1);
  // Mantém o foco dentro dos limites quando o filtro reduz a lista.
  const safeFocusedIndex = Math.min(focusedIndex, lastIndex);

  const handleNavigate = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(target, documents.length - 1));
      pendingFocusRef.current = clamped;
      setFocusedIndex(clamped);
      virtualizer.scrollToIndex(clamped, { align: "auto" });
    },
    [documents.length, virtualizer],
  );

  // Aplica o foco DOM na linha alvo assim que ela é renderizada. Se o scroll
  // ainda não a montou, o próximo render (disparado pelo virtualizer) tenta de novo.
  useEffect(() => {
    const target = pendingFocusRef.current;
    if (target == null) {
      return;
    }
    const row = scrollRef.current?.querySelector<HTMLElement>(
      `[data-index="${target}"]`,
    );
    if (row) {
      row.focus();
      pendingFocusRef.current = null;
    }
  });

  return (
    <section className="table-card">
      <div
        className="grid-table"
        role="table"
        aria-label="Documentos"
        aria-rowcount={documents.length + 1}
      >
        <div className="grid-row grid-header" role="row" aria-rowindex={1}>
          {COLUMNS.map((column) => (
            <span key={column} className="grid-cell" role="columnheader">
              {column}
            </span>
          ))}
        </div>

        <div ref={scrollRef} className="grid-body">
          {documents.length === 0 ? (
            <p className="grid-empty">Nenhum documento encontrado.</p>
          ) : (
            <div
              className="grid-viewport"
              style={{ height: virtualizer.getTotalSize() }}
            >
              {virtualRows.map((virtualRow) => {
                const document = documents[virtualRow.index];
                return (
                  <DocumentRow
                    key={document.id}
                    ref={virtualizer.measureElement}
                    index={virtualRow.index}
                    count={documents.length}
                    start={virtualRow.start}
                    isFocused={virtualRow.index === safeFocusedIndex}
                    document={document}
                    onSelect={onSelect}
                    onStatusChange={onStatusChange}
                    onNavigate={handleNavigate}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
