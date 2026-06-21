# 💒 Wedding Media — PWA de Casamento

Uma PWA simples e elegante para convidados compartilharem fotos e vídeos de um casamento. Construída com Next.js, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

- 📸 **Upload de fotos e vídeos** com compressão automática de imagens
- 🎭 **4 etapas do casamento**: Recepção, Cerimônia, Festa, Pós-casamento
- 📱 **Stories estilo Instagram**: visualização fullscreen com gestos touch
- 🔐 **Painel admin**: aprovar, ocultar, excluir e baixar mídias
- 📲 **PWA**: instalável no celular, funciona offline (parcialmente)
- 🎨 **Design elegante**: visual romântico, dourado, mobile-first

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- Conta no [Supabase](https://supabase.com/) (gratuito)
- Conta na [Vercel](https://vercel.com/) para deploy (opcional)

---

## 🛠️ Setup Completo

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com/) e faça login.
2. Clique em **New Project**.
3. Escolha um nome (ex: `casamento`) e defina uma senha para o banco.
4. Selecione a região mais próxima (ex: South America / São Paulo).
5. Aguarde a criação do projeto.

### 2. Configurar banco de dados e storage

1. No dashboard do Supabase, vá em **SQL Editor** > **New Query**.
2. Copie e cole todo o conteúdo do arquivo [`supabase-setup.sql`](./supabase-setup.sql).
3. Clique em **Run** para executar.

**Alternativa para o bucket (via Dashboard):**
1. Vá em **Storage** > **New Bucket**.
2. Nome: `wedding-media`
3. Marque **Public bucket**: ✅ ON
4. Clique em **Create**.

### 3. Obter chaves do Supabase

1. No dashboard, vá em **Settings** > **API**.
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Manter secreta!

### 4. Configurar variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
ADMIN_PASSWORD=sua-senha-admin-aqui
```

### 5. Rodar localmente

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## ✏️ Personalização

### Alterar nome do casal e textos

Edite o arquivo `src/config/wedding.ts`:

```typescript
export const WEDDING_CONFIG = {
  coupleName: "Maria & João",         // Nome do casal
  weddingDate: "2026-06-20",          // Data (YYYY-MM-DD)
  welcomeText: "Seu texto aqui...",   // Mensagem de boas-vindas
  // ...
};
```

### Alterar horários das etapas

No mesmo arquivo, preencha `startTime` e `endTime` de cada etapa:

```typescript
stages: [
  {
    id: "reception",
    label: "Recepção",
    startTime: "15:00",   // Formato HH:MM
    endTime: "16:00",
  },
  {
    id: "ceremony",
    label: "Cerimônia",
    startTime: "16:00",
    endTime: "17:30",
  },
  {
    id: "party",
    label: "Festa",
    startTime: "17:30",
    endTime: "23:59",
  },
  {
    id: "after_wedding",
    label: "Pós-casamento",
    startTime: "00:00",
    endTime: "23:59",  // Dia seguinte
  },
]
```

> Se `startTime` e `endTime` estiverem vazios, o convidado escolhe a etapa manualmente.

---

## 🚀 Deploy na Vercel

### Via CLI

```bash
npm install -g vercel
vercel
```

### Via Dashboard

1. Acesse [vercel.com](https://vercel.com/) e faça login.
2. Clique em **Add New** > **Project**.
3. Importe o repositório Git.
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
5. Clique em **Deploy**.

---

## 📱 Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial com nome do casal e botões |
| `/upload` | Envio de fotos e vídeos |
| `/stories` | Visualização estilo stories |
| `/admin` | Painel admin (protegido por senha) |

---

## 🔒 Segurança

- **Frontend**: usa apenas `anon key` (pública)
- **API Routes**: usam `service_role key` (server-only, nunca exposta)
- **Admin**: autenticado via senha → cookie httpOnly
- **RLS**: SELECT público apenas para `approved`, INSERT público
- **Upload**: validação de tipo e tamanho no servidor
- **Exclusão/Status**: apenas via admin (service_role)

---

## 📁 Estrutura

```
wedding-app/
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home
│   │   ├── globals.css      # Estilos globais
│   │   ├── upload/page.tsx  # Upload
│   │   ├── stories/page.tsx # Stories
│   │   ├── admin/page.tsx   # Admin
│   │   └── api/             # API routes
│   ├── components/          # Componentes React
│   ├── config/wedding.ts    # Configuração do casamento
│   ├── lib/supabase/        # Clients Supabase
│   └── types/               # TypeScript types
├── supabase-setup.sql       # SQL para setup
└── .env.local               # Variáveis de ambiente
```

---

## 📄 Licença

Projeto pessoal para uso em um casamento específico.
