# architrack-dashboard

Dashboard Next.js 15 para gestores do ArchiTrack.

## Stack

- **Next.js 15** App Router + TypeScript
- **Supabase JS v2** (client + server components via `@supabase/ssr`)
- **Tailwind CSS** + componentes customizados
- **Recharts** (gráfico de barras)
- **date-fns** + locale pt-BR
- **lucide-react** (ícones)

## Rotas

| Rota | Descrição |
|---|---|
| `/login` | Magic link por e-mail (Supabase Auth) |
| `/overview` | KPIs + tabela de registros + gráfico horas/projeto |
| `/projects` | Lista de projetos com % de horas consumidas |
| `/team` | Cards da equipe ativa |
| `/settings` | Hub de configurações |
| `/settings/users` | Listagem de usuários (pré-cadastro para onboarding) |
| `/settings/projects` | Listagem de projetos com detalhes |

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas credenciais Supabase

# 3. Rodar em dev
npm run dev
# Abrir http://localhost:3000
```

## Variáveis de ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> Nunca commitar `.env.local`.

## Deploy (Vercel)

```bash
vercel --prod
# Adicionar as variáveis de ambiente no painel Vercel
```

## Auth

- Magic link por e-mail para directors/admins
- Middleware protege `/overview`, `/projects`, `/settings`, `/team`
- Arquitetos: acesso exclusivo via WhatsApp (sem acesso ao dashboard no MVP)
- RLS no Supabase filtra dados por `org_id` automaticamente
