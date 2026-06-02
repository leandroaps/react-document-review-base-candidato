import { statusLabels } from "@constants/status";
import { CustomerDocument } from "@typing/document";
import { formatDate } from "@utils/date";
import { useEffect, useRef } from "react";

interface DocumentDrawerProps {
  document: CustomerDocument;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function DocumentDrawer({
  document,
  onClose,
}: DocumentDrawerProps) {
  // `document` (prop) sombreia o global; usamos `window.document` para o DOM.
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = drawerRef.current;
    if (!root) {
      return;
    }

    // Guarda quem tinha o foco (a linha de origem) para restaurar ao fechar.
    const previouslyFocused = window.document
      .activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute("disabled"),
      );

    // Move o foco para dentro do drawer ao abrir.
    (getFocusable()[0] ?? root).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      // Focus trap: mantém o Tab/Shift+Tab ciclando dentro do drawer.
      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = window.document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    root.addEventListener("keydown", handleKeyDown);

    return () => {
      root.removeEventListener("keydown", handleKeyDown);
      // Devolve o foco à linha de origem ao fechar.
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <aside
      ref={drawerRef}
      className="drawer"
      tabIndex={-1}
      aria-labelledby="drawer-title"
    >
      <button className="close" onClick={onClose} aria-label="Fechar detalhes">
        ×
      </button>
      <h2 id="drawer-title">{document.title}</h2>
      <p>
        <strong>Cliente:</strong> {document.customerName}
      </p>
      <p>
        <strong>Status:</strong> {statusLabels[document.status]}
      </p>
      <p>
        <strong>Categoria:</strong> {document.category}
      </p>
      <p>
        <strong>Criado em:</strong> {formatDate(document.createdAt)}
      </p>
    </aside>
  );
}
