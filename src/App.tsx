import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchDocuments, updateDocumentStatus } from "./api";
import { DocumentTable } from "./components/DocumentTable";
import { Hero } from "./components/Hero";
import { Loader } from "./components/Loader";
import { StatsBar } from "./components/StatsBar";
import { Toolbar } from "./components/Toolbar";
import type {
  CustomerDocument,
  DocumentStats,
  DocumentStatus,
  StatusFilter,
} from "./types";

const DocumentDrawer = lazy(() => import("./components/DocumentDrawer"));

export default function App() {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDocument, setSelectedDocument] =
    useState<CustomerDocument | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchDocuments()
      .then((result) => {
        setDocuments(result);
        setError("");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

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
    const normalizedQuery = query.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesQuery =
        normalizedQuery === "" ||
        document.title.toLowerCase().includes(normalizedQuery) ||
        document.customerName.toLowerCase().includes(normalizedQuery) ||
        document.category.toLowerCase().includes(normalizedQuery);

      const matchesStatus = status === "all" || document.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [documents, query, status]);

  const handleStatusChange = useCallback(
    async (id: string, nextStatus: DocumentStatus) => {
      const updated = await updateDocumentStatus(id, nextStatus);
      setDocuments((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
      setSelectedDocument((current) =>
        current?.id === id ? updated : current,
      );
    },
    [],
  );

  const handleSelect = useCallback((document: CustomerDocument) => {
    setSelectedDocument(document);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedDocument(null);
  }, []);

  return (
    <main className="page">
      <Hero />

      <StatsBar stats={stats} />

      <Toolbar
        query={query}
        status={status}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
      />

      {isLoading && <Loader fullScreen label="Carregando documentos..." />}
      {error && <p className="feedback error">{error}</p>}

      {!isLoading && !error && (
        <DocumentTable
          documents={filteredDocuments}
          onSelect={handleSelect}
          onStatusChange={handleStatusChange}
        />
      )}

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
