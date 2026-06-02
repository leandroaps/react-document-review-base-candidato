# DECISIONS.md

Use este arquivo para explicar suas decisões técnicas.

## Principais problemas encontrados

- **Erro de tipos no import de CSS** (`TS2882` em `@styles/styles.css`): o arquivo `vite-env.d.ts`, que contém a referência `vite/client` (responsável por declarar os módulos `*.css`), estava na raiz do projeto, fora do `include: ["src"]` do `tsconfig.json`. Por isso o TypeScript não carregava a declaração ambiente de `.css`.
- **`App.tsx` monolítico** (171 linhas): toda a UI, formatação, rótulos de status e regras de filtro estavam concentrados em um único componente.
- **Filtragem recalculada a cada render**: `filteredDocuments` era computado fora de `useMemo`, refazendo o filtro em toda renderização (digitação, mudança de status, abertura do drawer).
- **Busca de dados com `useState`/`useEffect`**: sem cache, retry ou refetch, mesmo com o `QueryClientProvider` já presente em `main.tsx`. O botão "Recarregar" usava `window.location.reload()`.
- **Mudança de status sem feedback otimista**: a UI só refletia o novo status após o round-trip da API, e não havia rollback em caso de falha.
- **Uso de `any`**: `statusLabels: any` e `selectedDocument: any` removiam a segurança de tipos.
- **Bug de interação**: clicar em "Aprovar"/"Rejeitar" também disparava o `onClick` da linha (abertura do drawer), por falta de `stopPropagation`.
- **Tabela sem virtualização**: todas as linhas eram montadas no DOM, custo que cresce linearmente com o volume de documentos.
- **Tabela inacessível por teclado**: a seleção dependia exclusivamente de clique; as linhas não eram focáveis nem operáveis por teclado.

## Mudanças realizadas

- **Correção do alias de CSS**: `vite-env.d.ts` movido para `src/vite-env.d.ts`, passando a ser coberto pelo `include` do `tsconfig.json`. Isso carrega as declarações `declare module '*.css'` do `vite/client` e resolve o `TS2882`.
- **Tipos movidos para `src/types/`**: `src/types/document.ts` (`CustomerDocument`, `DocumentStatus`, `StatusFilter`, `DocumentStats`), acessado pelo alias `@typing`.
- **Extração de constantes e utilitários**: `statusLabels` tipado em `src/constants/status.ts` e `formatDate` em `src/utils/date.ts`.
- **Quebra em componentes pequenos** em `src/components/`: `Hero`, `StatsBar`, `Toolbar`, `DocumentTable`, `DocumentRow`, `DocumentDrawer` e `Loader`.
- **`App.tsx` virou orquestrador**: apenas estado de UI (busca, filtro, seleção), hooks de dados e composição dos componentes.
- **Camada de API isolada** em `src/api/api.ts`: `fetchDocuments` e `updateDocumentStatus` simulam latência e instabilidade ocasional, mantendo o estado mockado fora dos componentes.
- **Migração para React Query**: hooks `useDocuments` (`useQuery`) e `useUpdateDocumentStatus` (`useMutation`) em `src/hooks/useDocuments.ts`. O `QueryClient` em `main.tsx` define `retry: 2`, `staleTime: 30s` e `refetchOnWindowFocus: false`. O botão "Recarregar" agora chama `refetch()` em vez de recarregar a página.
- **Mutação otimista com rollback**: `onMutate` cancela queries em andamento, salva o estado anterior e aplica a mudança no cache; `onError` restaura o snapshot; `onSuccess` sincroniza com a resposta real da API (ex.: `updatedAt`).
- **Busca com debounce**: `useDebouncedValue` (300ms) evita refiltrar a cada tecla; um estado "Buscando..." é exibido enquanto o valor digitado ainda não foi aplicado.
- **Virtualização da tabela**: `DocumentTable` usa `@tanstack/react-virtual` (`useVirtualizer`) para renderizar apenas as linhas visíveis (+ overscan), com altura medida via `measureElement`.
- **Aliases de import** configurados em `vite.config.ts` e `tsconfig.json` (`@`, `@api`, `@components`, `@constants`, `@data`, `@hooks`, `@styles`, `@typing`, `@utils`).
- **Navegação por teclado na tabela**: as linhas agora são focáveis e operáveis sem mouse — `Enter`/`Espaço` abre o drawer, `ArrowUp`/`ArrowDown` movem o foco entre linhas, `Home`/`End` vão para a primeira/última, com estilo `:focus-visible` e atributos `aria-rowcount`/`aria-rowindex`.
- **Gerenciamento de foco no drawer**: ao abrir, o foco move para dentro do drawer; `Tab`/`Shift+Tab` ficam presos (focus trap) e `Escape` fecha; ao fechar, o foco retorna à linha de origem (capturado via `document.activeElement` na montagem). O botão fechar ganhou `aria-label` e o drawer um `aria-labelledby` apontando para o título.
- **Anúncio de status via `aria-live`**: uma região `role="status"` (`aria-live="polite"`, visualmente oculta com `.sr-only`) informa a leitores de tela a mudança aplicada e a falha em caso de erro na mutação.
- **Formatação automática no commit**: Prettier (`.prettierrc.json` / `.prettierignore`) + Husky + lint-staged. O hook `pre-commit` (`.husky/pre-commit`) roda `npx lint-staged`, que aplica `prettier --write` apenas nos arquivos em stage. `eslint-config-prettier` foi adicionado ao final do `eslint.config.js` para desligar regras de formatação do ESLint que conflitariam com o Prettier. Scripts `format` e `format:check` disponíveis para uso manual/CI.

## Decisões de arquitetura

- **Dados via React Query, estado de UI via `useState`**: a fonte da verdade dos documentos é o cache do React Query; `App` guarda só o que é efêmero de UI (query, filtro, `selectedId`). O documento selecionado é derivado do cache (`documents.find`), então reflete mudanças de status sem estado duplicado.
- **`updateDocumentStatus` no hook, não no componente**: centraliza a lógica de cache (otimista + rollback) em um único lugar testável, deixando os componentes apenas disparando `mutate`.
- **`documentKeys` como objeto de chaves**: padroniza o `queryKey` e evita strings soltas espalhadas pelo código.
- **`@typing` em vez de `@types`**: o alias `@types` colidiria com o escopo de pacotes `@types/*` do npm; `@typing` evita a ambiguidade.
- **`DocumentRow` como componente memoizado e posicionado pelo virtualizer**: isola o custo de render por linha (o ponto mais sensível em tabelas grandes) e recebe `start`/`index` para o posicionamento absoluto da virtualização.
- **`DocumentDrawer` com `export default`**: necessário para o code-splitting via `React.lazy`, já que o drawer só aparece após seleção de uma linha.
- **`Intl.DateTimeFormat` instanciado uma única vez** no módulo, em vez de recriar o objeto de opções a cada chamada de `formatDate`.

## Trade-offs

- **Virtualização exige medir o container**: em ambiente sem layout (jsdom) o virtualizer mede 0 e não renderiza linhas. Foi necessário mockar `ResizeObserver`, `offsetHeight/Width` e `getBoundingClientRect` no setup de teste — custo aceitável para ganhar virtualização real em produção.
- **`Suspense` do drawer com `Loader` leve**: como o bundle do drawer é pequeno e abre por clique, o fallback é discreto; em telas mais pesadas valeria um skeleton mais elaborado.
- **`memo` + `useCallback` em todos os componentes**: adiciona alguma verbosidade, mas garante que a memoização das linhas não seja invalidada por novas referências de callback a cada render.
- **Instabilidade simulada (3% de falha) mantida** na API mock: exercita o caminho de erro (`isError`/`error.message`) e o rollback otimista em vez de esconder cenários de falha.

## Testes adicionados

- **`src/__tests__/app.behavior.test.tsx`** cobre o comportamento de ponta a ponta com a API mockada:
  - **Filtros**: busca por título/cliente/categoria (validando o debounce) e filtro por status.
  - **Mutação de status**: atualização otimista ao aprovar (UI muda antes da resposta) e rollback quando a API falha.
  - **Drawer**: abertura ao clicar na linha (carregado via `lazy`/`Suspense`) e fechamento pelo botão.
  - **Acessibilidade por teclado**: `Enter` na linha focada abre o drawer, `ArrowDown` move o foco para a próxima linha e a ativação de "Aprovar" via teclado não abre o drawer (guarda `event.target !== event.currentTarget`).
  - **Foco e `aria-live`**: o foco entra no drawer ao abrir e retorna à linha de origem ao fechar com `Escape`; a região `role="status"` anuncia a mudança de status aplicada.
- **`src/__tests__/app.test.tsx`** (existente) continua validando a renderização base após a refatoração.
- Setup de teste (`src/test-setup.ts` + `beforeAll`) injeta dimensões de layout para que o virtualizer renderize linhas em jsdom.

## Performance e observabilidade

- **React Query com `staleTime` de 30s**: evita refetch desnecessário e serve dados do cache entre montagens.
- **Virtualização da tabela**: apenas as linhas visíveis (+ overscan de 6) ficam no DOM, mantendo o custo constante independente do volume.
- **Debounce na busca (300ms)**: reduz a frequência de refiltragem durante a digitação.
- **`useMemo` em `filteredDocuments`, `stats` e `selectedDocument`**: recalculam só quando suas dependências mudam.
- **`React.memo`** em `Hero`, `StatsBar`, `Toolbar`, `DocumentTable` e `DocumentRow` + **`useCallback`** nos handlers: preserva a memoização das linhas quando outra linha muda de status ou o drawer abre.
- **`React.lazy` + `Suspense`** no `DocumentDrawer`: remove o drawer do bundle inicial.
- **Mutação otimista**: a UI responde imediatamente, sem esperar o round-trip da API.
- Observabilidade ainda não instrumentada — ver seção "O que faria com mais tempo".

## Uso de IA

Descreva quais ferramentas de IA você usou, em quais partes, quais outputs foram revisados/corrigidos e quais decisões continuaram sendo suas.

- O projeto é muito parecido com o que eu já trabalhava há algum tempo, então configurações básicas do Vite, Vitest, aplicação de alias, migração de components, foram feitos manualmente, sem auxilio de IA. Basicamente, usei o CHAT do próprio VS Code para documentar o DECISIONS.md, que ficaria mais fácil do que escrever manualmente.

- Usei um pouco do CoPilot free para configurar a tabela virtual (`@tanstack/react-virtual`) e ajustar a integração com o React Query. Revisei e ajustei a virtualização (medição de linha, overscan) e o mock de layout nos testes manualmente.

## O que faria com mais tempo

- **Observabilidade**: instrumentar métricas de erro de carregamento, taxa de falha de mutação e tempo de resposta da API.
- **Feedback de erro na mutação**: além do rollback silencioso, exibir um toast informando que a atualização falhou.
- **Paginação/scroll infinito** no fetch, caso o volume real de documentos justifique buscar em lotes.
- **Backend**: Configurar um backend e um banco de dados, mesmo que local, para centralizar as requests.
- **Internacionalixação**: Configurar i18N para centralizar os textos e traduções, caso necessário.
- **Integration Tests**: Configurar o Cypress ou Playright para criar testes automatizados.
