import { memo } from 'react';
import type { StatusFilter } from '../types';

interface ToolbarProps {
  query: string;
  status: StatusFilter;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
}

function ToolbarComponent({ query, status, onQueryChange, onStatusChange }: ToolbarProps) {
  return (
    <section className="toolbar">
      <input
        placeholder="Buscar por título, cliente ou categoria"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <select value={status} onChange={(event) => onStatusChange(event.target.value as StatusFilter)}>
        <option value="all">Todos os status</option>
        <option value="pending">Pendente</option>
        <option value="reviewing">Em análise</option>
        <option value="approved">Aprovado</option>
        <option value="rejected">Rejeitado</option>
      </select>
    </section>
  );
}

export const Toolbar = memo(ToolbarComponent);
