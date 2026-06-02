# DECISIONS.md

Use este arquivo para explicar suas decisões técnicas.

## Principais problemas encontrados

- **Erro de tipos no import de CSS** (`TS2882` em `@styles/styles.css`): o arquivo `vite-env.d.ts`, que contém a referência `vite/client` (responsável por declarar os módulos `*.css`), estava na raiz do projeto, fora do `include: ["src"]` do `tsconfig.json`. Por isso o TypeScript não carregava a declaração ambiente de `.css`.
- **`App.tsx` monolítico** (171 linhas): toda a UI, formatação, rótulos de status e regras de filtro estavam concentrados em um único componente.
- **Filtragem recalculada a cada render**: `filteredDocuments` era computado fora de `useMemo`, refazendo o filtro em toda renderização (digitação, mudança de status, abertura do drawer).
- **Uso de `any`**: `statusLabels: any` e `selectedDocument: any` removiam a segurança de tipos.
- **Bug de interação**: clicar em "Aprovar"/"Rejeitar" também disparava o `onClick` da linha (abertura do drawer), por falta de `stopPropagation`.

## Mudanças realizadas

- **Correção do alias de CSS**: `vite-env.d.ts` movido para `src/vite-env.d.ts`, passando a ser coberto pelo `include` do `tsconfig.json`. Isso carrega as declarações `declare module '*.css'` do `vite/client` e resolve o `TS2882`.
- **Tipos movidos para `src/types/`**: criados `src/types/document.ts` (`CustomerDocument`, `DocumentStatus`, `StatusFilter`, `DocumentStats`) e `src/types/index.ts` (barrel). O antigo `src/types.ts` foi removido. Imports via `./types` continuam funcionando.
- **Extração de constantes e utilitários**: `statusLabels` tipado em `src/constants/status.ts` e `formatDate` em `src/utils/date.ts`.
- **Quebra em componentes pequenos** em `src/components/`: `Hero`, `StatsBar`, `Toolbar`, `DocumentTable`, `DocumentRow` e `DocumentDrawer`.
- **`App.tsx` virou orquestrador**: apenas estado, efeitos e composição dos componentes.

## Decisões de arquitetura

- **Tipos como pasta com barrel (`types/index.ts`)**: permite separar o domínio (`document.ts`) de futuros agrupamentos sem quebrar os imports existentes (`./types`).
- **Imports relativos entre pastas** (`../types`, `../utils/date`): mais robusto que usar o alias `@types`, que colide com o escopo de pacotes `@types/*` do npm.
- **`DocumentRow` como componente memoizado dedicado**: isola o custo de render por linha, que é o ponto mais sensível em tabelas que crescem.
- **`DocumentDrawer` com `export default`**: necessário para o code-splitting via `React.lazy`, já que o drawer só aparece após seleção de uma linha.
- **`Intl.DateTimeFormat` instanciado uma única vez** no módulo, em vez de recriar o objeto de opções a cada chamada de `formatDate`.

## Trade-offs

- **Mantida a busca de dados com `useState`/`useEffect`** em vez de migrar para `useQuery`, apesar do `QueryClientProvider` já estar configurado em `main.tsx`. Optei por focar no escopo pedido (componentização e performance); a migração para React Query (cache, retry, refetch) ficou registrada como próximo passo.
- **`Suspense` com `fallback={null}`** no drawer: como o bundle é pequeno e o drawer abre por clique, evitei um spinner que apareceria e sumiria rápido demais. Em telas mais pesadas valeria um fallback visível.
- **`memo` + `useCallback` em todos os componentes**: adiciona um pouco de verbosidade, mas garante que a memoização das linhas não seja invalidada por novas referências de callback a cada render.

## Testes adicionados

- Nenhum teste novo adicionado nesta etapa. O teste existente (`src/__tests__/app.test.tsx`) continua passando após a refatoração, validando que a composição via novos componentes não quebrou a renderização do título da página.
- Próximos testes recomendados: filtro por busca/status, mudança de status via API (com `stopPropagation`) e abertura/fechamento do drawer.

## Performance e observabilidade

- **`useMemo` em `filteredDocuments` e `stats`**: o filtro agora só recalcula quando `documents`, `query` ou `status` mudam.
- **`React.memo`** em `Hero`, `StatsBar`, `Toolbar`, `DocumentTable` e `DocumentRow`: evita re-render de linhas não afetadas quando outra linha muda de status ou o drawer abre.
- **`useCallback`** em `handleStatusChange`, `handleSelect` e `handleCloseDrawer`: referências estáveis para preservar a memoização das linhas.
- **`React.lazy` + `Suspense`** no `DocumentDrawer`: remove o drawer do bundle inicial, carregando-o sob demanda.
- **Normalização da busca**: a query é normalizada (`trim`/`toLowerCase`) uma vez por filtragem, em vez de a cada campo de cada linha.
- Observabilidade ainda não instrumentada — ver seção "O que faria com mais tempo".

## Uso de IA

Descreva quais ferramentas de IA você usou, em quais partes, quais outputs foram revisados/corrigidos e quais decisões continuaram sendo suas.

- O projeto é muito parecido com o que eu já trabalhava há algum tempo, então configurações básicas do Vite, Vitest, aplicação de alias, migração de components, foram feitos manualmente, sem auxilio de IA. Basicamente, usei o CHAT do próprio VS Code para documentar o DECISIONS.md, que ficaria mais fácil do que escrever manualmente.

## O que faria com mais tempo

- Migrar a busca de dados para **React Query** (`useQuery`/`useMutation`), aproveitando o `QueryClientProvider` já existente, com cache, retry e refetch — substituindo o `window.location.reload()` do botão "Recarregar".
- Adicionar **mutação otimista** na mudança de status, com rollback em caso de erro da API.
- Cobertura de **testes** para filtros, mutação de status e drawer.
- **Acessibilidade**: tornar as linhas da tabela focáveis/navegáveis por teclado (hoje a seleção depende de clique).
- **Observabilidade**: instrumentar métricas de erro de carregamento e tempo de resposta da API.
- **Virtualização** da tabela (ex.: `@tanstack/react-virtual`) caso o volume de documentos cresça.
