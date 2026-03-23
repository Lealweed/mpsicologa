# SaaS Psicóloga

## Setup

1. Copie `.env.example` para `.env.local` e preencha as variáveis do Supabase e Stripe.
2. Instale as dependências:
   ```
   npm install
   ```
3. Rode o projeto em desenvolvimento:
   ```
   npm run dev
   ```
4. Para build de produção:
   ```
   npm run build && npm start
   ```

## Estrutura
- `src/app`: App Router, layout e página inicial
- `src/lib/supabase`: Instâncias do Supabase (client/server)
- `src/types/database.ts`: Tipos do banco (importa de `types/database.types.ts`)
- `db/`: Migrações SQL
- `types/`: Tipos globais
- `docs/`: Documentação
