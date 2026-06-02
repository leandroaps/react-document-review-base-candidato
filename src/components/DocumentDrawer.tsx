import { statusLabels } from "@constants/status";
import { CustomerDocument } from "@typing/document";
import { formatDate } from "@utils/date";

interface DocumentDrawerProps {
  document: CustomerDocument;
  onClose: () => void;
}

export default function DocumentDrawer({
  document,
  onClose,
}: DocumentDrawerProps) {
  return (
    <aside className="drawer">
      <button className="close" onClick={onClose}>
        ×
      </button>
      <h2>{document.title}</h2>
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
