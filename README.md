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
```

## Escopo atual

As rotas da Home, Contas, Extrato, Adicionar, Dividas, Relatorios, Ajustes e
Administracao consomem a API Go pelo proxy `/api/backend`. Autenticacao usa o
cookie HttpOnly `financial_session`; operacoes financeiras aguardam a resposta
do backend. O cadastro de dividas aceita um cronograma mensal parcelado.

O service worker nao armazena dados financeiros: ele cobre apenas shell publico, icones e a pagina offline.
