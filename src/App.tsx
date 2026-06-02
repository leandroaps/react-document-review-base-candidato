import { DocumentTable } from "@components/DocumentTable";
import { Hero } from "@components/Hero";
import { Loader } from "@components/Loader";
import { StatsBar } from "@components/StatsBar";
import { Toolbar } from "@components/Toolbar";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { useDocuments, useUpdateDocumentStatus } from "@hooks/useDocuments";
import type {
  CustomerDocument,
  DocumentStats,
  DocumentStatus,
  StatusFilter,
} from "@typing/document";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";

const DocumentDrawer = lazy(() => import("@components/DocumentDrawer"));

const EMPTY_DOCUMENTS: CustomerDocument[] = [];

export default function App() {
  const {
    data: documents = EMPTY_DOCUMENTS,
    isError,
    error,
    isFetching,
    refetch,
  } = useDocuments();
  const updateStatus = useUpdateDocumentStatus();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 300);
  // Busca "pendente" enquanto o valor digitado ainda não foi aplicado.
  const isSearching = query.trim() !== debouncedQuery.trim();

  const stats = useMemo<DocumentStats>(
    () => ({
      total: documents.length,
      pending: documents.filter((item) => item.status === "pending").length,
      reviewing: documents.filter((item) => item.status === "reviewing").length,
      rejected: documents.filter((item) => item.status === "rejected").length,
    }),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesQuery =
        normalizedQuery === "" ||
        document.title.toLowerCase().includes(normalizedQuery) ||
        document.customerName.toLowerCase().includes(normalizedQuery) ||
        document.category.toLowerCase().includes(normalizedQuery);

      const matchesStatus = status === "all" || document.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [documents, debouncedQuery, status]);

  // Deriva o documento selecionado do cache para refletir mudanças de status.
  const selectedDocument = useMemo(
    () => documents.find((item) => item.id === selectedId) ?? null,
    [documents, selectedId],
  );

  const handleStatusChange = useCallback(
    (id: string, nextStatus: DocumentStatus) => {
      updateStatus.mutate({ id, status: nextStatus });
    },
    [updateStatus],
  );

  const handleSelect = useCallback((document: CustomerDocument) => {
    setSelectedId(document.id);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleReload = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <main className="page">
      <Hero onReload={handleReload} isReloading={isFetching} />

      <StatsBar stats={stats} />

      <Toolbar
        query={query}
        status={status}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
      />

      {isFetching && <Loader fullScreen label="Carregando documentos..." />}
      {isError && <p className="feedback error">{error.message}</p>}

      {!isError &&
        (isSearching ? (
          <Loader label="Buscando documentos..." />
        ) : (
          <DocumentTable
            documents={filteredDocuments}
            onSelect={handleSelect}
            onStatusChange={handleStatusChange}
          />
        ))}

      {selectedDocument && (
        <Suspense fallback={<Loader label="Carregando detalhes..." />}>
          <DocumentDrawer
            document={selectedDocument}
            onClose={handleCloseDrawer}
          />
        </Suspense>
      )}
    </main>
  );
}
