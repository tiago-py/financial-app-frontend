# Financial App Frontend

Frontend mobile-first do aplicativo de financas pessoais.

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

Home, Contas, Extrato, Adicionar, Dividas, Relatorios e Ajustes consomem a API
Go por meio do proxy `/api/backend` configurado no Next.js. A autenticacao usa
cookie HttpOnly emitido pelo backend; o frontend nao armazena o JWT.

Configure `BACKEND_URL` quando a API nao estiver em
`http://localhost:8080`. Consulte `.env.example`.

O service worker nao armazena dados financeiros: ele cobre apenas shell publico, icones e a pagina offline.
