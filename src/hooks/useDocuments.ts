import { fetchDocuments, updateDocumentStatus } from "@api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CustomerDocument, DocumentStatus } from "@typing/document";

export const documentKeys = {
  all: ["documents"] as const,
};

/** Busca a lista de documentos com cache e retry (configurados no QueryClient). */
export function useDocuments() {
  return useQuery({
    queryKey: documentKeys.all,
    queryFn: fetchDocuments,
  });
}

interface UpdateStatusVariables {
  id: string;
  status: DocumentStatus;
}

interface UpdateStatusContext {
  previous?: CustomerDocument[];
}

/**
 * Atualiza o status de um documento com mutação otimista:
 * aplica a mudança no cache imediatamente e faz rollback em caso de erro.
 */
export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    CustomerDocument,
    Error,
    UpdateStatusVariables,
    UpdateStatusContext
  >({
    mutationFn: ({ id, status }) => updateDocumentStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Evita que um refetch em andamento sobrescreva a atualização otimista.
      await queryClient.cancelQueries({ queryKey: documentKeys.all });

      const previous = queryClient.getQueryData<CustomerDocument[]>(
        documentKeys.all,
      );

      queryClient.setQueryData<CustomerDocument[]>(
        documentKeys.all,
        (current) =>
          current?.map((item) => (item.id === id ? { ...item, status } : item)),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(documentKeys.all, context.previous);
      }
    },
    onSuccess: (updated) => {
      // Sincroniza com a resposta real da API (ex.: updatedAt).
      queryClient.setQueryData<CustomerDocument[]>(
        documentKeys.all,
        (current) =>
          current?.map((item) => (item.id === updated.id ? updated : item)),
      );
    },
  });
}
