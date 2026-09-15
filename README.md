# Financial App Frontend

Mock mobile-first do aplicativo de financas pessoais.

## Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS 4
- Lucide React
- PWA basico com manifesto e service worker publico

## Comandos

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run check:mock
```

## Escopo atual

Esta etapa implementa um mock local da Home e das principais abas do frontend: Contas, Extrato, Adicionar, Dividas, Relatorios e Ajustes. Os dados sao ficticios e ficam principalmente em `src/features/home/mock.ts` e `src/features/accounts/mock.ts`.
Nao ha autenticacao, API real, persistencia, cadastro de bancos ou backend integrado.
As interacoes atuais sao simulacoes locais em estado de React; recarregar a pagina restaura os mocks.

O service worker nao armazena dados financeiros: ele cobre apenas shell publico, icones e a pagina offline.
