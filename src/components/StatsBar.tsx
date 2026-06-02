import { memo } from 'react';
import type { DocumentStats } from '../types';

interface StatsBarProps {
  stats: DocumentStats;
}

function StatsBarComponent({ stats }: StatsBarProps) {
  return (
    <section className="stats" aria-label="Indicadores">
      <div>
        <strong>{stats.total}</strong>
        <span>Total</span>
      </div>
      <div>
        <strong>{stats.pending}</strong>
        <span>Pendentes</span>
      </div>
      <div>
        <strong>{stats.reviewing}</strong>
        <span>Em análise</span>
      </div>
      <div>
        <strong>{stats.rejected}</strong>
        <span>Rejeitados</span>
      </div>
    </section>
  );
}

export const StatsBar = memo(StatsBarComponent);
