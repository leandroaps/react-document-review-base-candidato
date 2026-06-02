import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { CustomerDocument, DocumentStatus } from '../types';
import { DocumentRow } from './DocumentRow';

interface DocumentTableProps {
  documents: CustomerDocument[];
  onSelect: (document: CustomerDocument) => void;
  onStatusChange: (id: string, status: DocumentStatus) => void;
}

const COLUMNS = [
  'Documento',
  'Cliente',
  'Categoria',
  'Status',
  'Confiança IA',
  'Criado em',
  'Responsável',
  'Ações',
] as const;

/** Altura estimada de uma linha; ajustada por medição real após renderizar. */
const ESTIMATED_ROW_HEIGHT = 72;

export function DocumentTable({ documents, onSelect, onStatusChange }: DocumentTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: documents.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 6,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <section className="table-card">
      <div className="grid-table" role="table" aria-label="Documentos">
        <div className="grid-row grid-header" role="row">
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
            <div className="grid-viewport" style={{ height: virtualizer.getTotalSize() }}>
              {virtualRows.map((virtualRow) => {
                const document = documents[virtualRow.index];
                return (
                  <DocumentRow
                    key={document.id}
                    ref={virtualizer.measureElement}
                    index={virtualRow.index}
                    start={virtualRow.start}
                    document={document}
                    onSelect={onSelect}
                    onStatusChange={onStatusChange}
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
