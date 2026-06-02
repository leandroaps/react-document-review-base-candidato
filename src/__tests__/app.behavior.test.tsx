import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import App from "../App";
import type { CustomerDocument } from "../types";

vi.mock("../api", () => ({
  fetchDocuments: vi.fn(),
  updateDocumentStatus: vi.fn(),
}));

import { fetchDocuments, updateDocumentStatus } from "../api";

const fetchDocumentsMock = vi.mocked(fetchDocuments);
const updateDocumentStatusMock = vi.mocked(updateDocumentStatus);

const DOCUMENTS: CustomerDocument[] = [
  {
    id: "doc-001",
    title: "Contrato Social - ACME LTDA",
    customerName: "ACME LTDA",
    customerEmail: "financeiro@acme.com",
    status: "pending",
    category: "Contrato",
    createdAt: "2026-05-26T10:30:00Z",
    confidence: 0.74,
    assignedTo: null,
  },
  {
    id: "doc-002",
    title: "Nota Fiscal 98217",
    customerName: "Mercado Azul",
    status: "approved",
    category: "Fiscal",
    createdAt: "2026-05-27T13:10:00Z",
    confidence: 0.96,
    assignedTo: "Marina",
  },
  {
    id: "doc-004",
    title: "DANFE 445901",
    customerName: "Transportes Bela Vista",
    status: "rejected",
    category: "Fiscal",
    createdAt: "2026-05-30T16:45:00Z",
    confidence: 0.41,
    assignedTo: "Marina",
  },
];

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

/** Localiza a linha (role="row") que contém o título informado. */
function getRowByTitle(title: string): HTMLElement {
  const row = screen.getByText(title).closest('[role="row"]');
  if (!row) {
    throw new Error(`Linha não encontrada para o título: ${title}`);
  }
  return row as HTMLElement;
}

// O jsdom não calcula layout; sem isso o virtualizer mede o container como 0
// e não renderiza nenhuma linha. Simulamos dimensões para as linhas aparecerem.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    private readonly callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(element: Element) {
      this.callback(
        [
          {
            target: element,
            contentRect: { width: 1000, height: 600 },
            borderBoxSize: [{ inlineSize: 1000, blockSize: 600 }],
          },
        ] as unknown as ResizeObserverEntry[],
        this as unknown as ResizeObserver,
      );
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get: () => 600,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get: () => 1000,
  });
  HTMLElement.prototype.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 72,
      width: 1000,
      height: 72,
      toJSON: () => ({}),
    }) as DOMRect;
});

beforeEach(() => {
  vi.clearAllMocks();
  // Cada teste recebe uma cópia fresca para evitar mutação entre casos.
  fetchDocumentsMock.mockResolvedValue(DOCUMENTS.map((doc) => ({ ...doc })));
});

describe("filtros", () => {
  test("busca filtra por título/cliente/categoria (com debounce)", async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByText("Contrato Social - ACME LTDA");

    await user.type(screen.getByPlaceholderText(/buscar/i), "DANFE");

    await waitFor(
      () => {
        expect(screen.getByText("DANFE 445901")).toBeInTheDocument();
        expect(
          screen.queryByText("Contrato Social - ACME LTDA"),
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  test("filtro de status mostra apenas documentos com o status selecionado", async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByText("Contrato Social - ACME LTDA");

    await user.selectOptions(screen.getByRole("combobox"), "rejected");

    await waitFor(() => {
      expect(screen.getByText("DANFE 445901")).toBeInTheDocument();
      expect(
        screen.queryByText("Contrato Social - ACME LTDA"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Nota Fiscal 98217")).not.toBeInTheDocument();
    });
  });
});

describe("mutação de status", () => {
  test("aplica atualização otimista ao aprovar", async () => {
    const user = userEvent.setup();
    updateDocumentStatusMock.mockResolvedValue({
      ...DOCUMENTS[0],
      status: "approved",
      updatedAt: "2026-06-02T12:00:00Z",
    });

    renderApp();
    await screen.findByText("Contrato Social - ACME LTDA");

    const row = getRowByTitle("Contrato Social - ACME LTDA");
    expect(within(row).getByText("Pendente")).toBeInTheDocument();

    await user.click(within(row).getByRole("button", { name: "Aprovar" }));

    await waitFor(() => {
      const updatedRow = getRowByTitle("Contrato Social - ACME LTDA");
      expect(within(updatedRow).getByText("Aprovado")).toBeInTheDocument();
    });
    expect(updateDocumentStatusMock).toHaveBeenCalledWith(
      "doc-001",
      "approved",
    );
  });

  test("faz rollback quando a API falha", async () => {
    const user = userEvent.setup();
    updateDocumentStatusMock.mockRejectedValue(new Error("Falha na API"));

    renderApp();
    await screen.findByText("Contrato Social - ACME LTDA");

    const row = getRowByTitle("Contrato Social - ACME LTDA");
    await user.click(within(row).getByRole("button", { name: "Aprovar" }));

    // Após o erro, o status volta para "Pendente".
    await waitFor(() => {
      const revertedRow = getRowByTitle("Contrato Social - ACME LTDA");
      expect(within(revertedRow).getByText("Pendente")).toBeInTheDocument();
    });
  });
});

describe("drawer", () => {
  test("abre ao clicar na linha e fecha pelo botão", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText("Contrato Social - ACME LTDA");

    await user.click(screen.getByText("Contrato Social - ACME LTDA"));

    // O drawer é carregado via lazy/Suspense.
    const drawer = await screen.findByRole("complementary");
    expect(within(drawer).getByText("ACME LTDA")).toBeInTheDocument();
    expect(within(drawer).getByText("Contrato")).toBeInTheDocument();

    await user.click(within(drawer).getByRole("button", { name: "×" }));

    await waitFor(() => {
      expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });
  });
});
