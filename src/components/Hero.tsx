import { memo } from "react";

interface HeroProps {
  onReload: () => void;
  isReloading?: boolean;
}

function HeroComponent({ onReload, isReloading = false }: HeroProps) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Operação interna</p>
        <h1>Documentos de clientes</h1>
        <p className="subtitle">
          Revise documentos classificados automaticamente e acompanhe pendências
          da operação.
        </p>
      </div>
      <button onClick={onReload} disabled={isReloading}>
        {isReloading ? "Recarregando..." : "Recarregar"}
      </button>
    </section>
  );
}

export const Hero = memo(HeroComponent);
