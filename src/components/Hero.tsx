import { memo } from 'react';

function HeroComponent() {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Operação interna</p>
        <h1>Documentos de clientes</h1>
        <p className="subtitle">
          Revise documentos classificados automaticamente e acompanhe pendências da operação.
        </p>
      </div>
      <button onClick={() => window.location.reload()}>Recarregar</button>
    </section>
  );
}

export const Hero = memo(HeroComponent);
