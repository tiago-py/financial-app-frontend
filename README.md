# Financial App Frontend



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

Nao ha autenticacao, API real, persistencia, cadastro de bancos ou backend integrado.
As interacoes atuais sao simulacoes locais em estado de React; recarregar a pagina restaura os mocks.

O service worker nao armazena dados financeiros: ele cobre apenas shell publico, icones e a pagina offline.
