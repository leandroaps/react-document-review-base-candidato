import { memo } from 'react';

interface LoaderProps {
  /** Texto acessível e exibido ao lado do spinner. */
  label?: string;
  /** Exibe o loader cobrindo a tela inteira, com overlay escuro. */
  fullScreen?: boolean;
}

function LoaderComponent({ label = 'Carregando...', fullScreen = false }: LoaderProps) {
  const content = (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return <div className="loader-overlay">{content}</div>;
}

export const Loader = memo(LoaderComponent);
