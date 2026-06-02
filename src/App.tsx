import { useEffect, useMemo, useState } from 'react';
import { fetchDocuments, updateDocumentStatus } from './api';
import type { CustomerDocument, DocumentStatus } from './types';

const statusLabels: any = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  reviewing: 'Em análise'
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function App() {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchDocuments()
      .then((result) => {
        setDocuments(result);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = useMemo(() => {
    return {
      total: documents.length,
      pending: documents.filter((item) => item.status === 'pending').length,
      reviewing: documents.filter((item) => item.status === 'reviewing').length,
      rejected: documents.filter((item) => item.status === 'rejected').length
    };
  }, [documents]);

  const filteredDocuments = documents.filter((document) => {
    const matchesQuery =
      document.title.toLowerCase().includes(query.toLowerCase()) ||
      document.customerName.toLowerCase().includes(query.toLowerCase()) ||
      document.category.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = status === 'all' ? true : document.status === status;
    return matchesQuery && matchesStatus;
  });

  async function handleStatusChange(id: string, nextStatus: DocumentStatus) {
    const updated = await updateDocumentStatus(id, nextStatus);
    setDocuments((current) => current.map((item) => (item.id === id ? updated : item)));
  }

  return (
    <main className="page">
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

      <section className="toolbar">
        <input
          placeholder="Buscar por título, cliente ou categoria"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="reviewing">Em análise</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Rejeitado</option>
        </select>
      </section>

      {isLoading && <p className="feedback">Carregando documentos...</p>}
      {error && <p className="feedback error">{error}</p>}

      {!isLoading && !error && (
        <section className="table-card">
          <table>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Cliente</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Confiança IA</th>
                <th>Criado em</th>
                <th>Responsável</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document.id} onClick={() => setSelectedDocument(document)}>
                  <td>
                    <strong>{document.title}</strong>
                    <small>{document.id}</small>
                  </td>
                  <td>
                    {document.customerName}
                    <small>{document.customerEmail || 'Sem e-mail cadastrado'}</small>
                  </td>
                  <td>{document.category}</td>
                  <td>
                    <span className={`badge ${document.status}`}>{statusLabels[document.status]}</span>
                  </td>
                  <td>{Math.round((document.confidence || 0) * 100)}%</td>
                  <td>{formatDate(document.createdAt)}</td>
                  <td>{document.assignedTo || 'Não atribuído'}</td>
                  <td>
                    <button onClick={() => handleStatusChange(document.id, 'approved')}>Aprovar</button>
                    <button onClick={() => handleStatusChange(document.id, 'rejected')}>Rejeitar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {selectedDocument && (
        <aside className="drawer">
          <button className="close" onClick={() => setSelectedDocument(null)}>×</button>
          <h2>{selectedDocument.title}</h2>
          <p><strong>Cliente:</strong> {selectedDocument.customerName}</p>
          <p><strong>Status:</strong> {statusLabels[selectedDocument.status]}</p>
          <p><strong>Categoria:</strong> {selectedDocument.category}</p>
          <p><strong>Criado em:</strong> {formatDate(selectedDocument.createdAt)}</p>
        </aside>
      )}
    </main>
  );
}
