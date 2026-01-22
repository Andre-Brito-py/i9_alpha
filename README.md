# i9 Alpha

Sistema de Gestão de Demandas (i9 Alpha)

## Sobre o Projeto

Este é um sistema de gestão de demandas desenvolvido com Next.js, Prisma e Tailwind CSS.
O sistema permite o gerenciamento de demandas com controle de acesso baseado em cargos (RBAC).

## Funcionalidades

- **Autenticação**: Login seguro com NextAuth.
- **Gestão de Demandas**: Criação, edição e visualização de demandas.
- **Controle de Acesso (RBAC)**:
  - **Admin**: Acesso total.
  - **Supervisor**: Gerencia demandas próprias e de Backoffice.
  - **Backoffice**: Gerencia apenas demandas próprias.
- **Dashboard**: Visão geral das demandas, status e atrasos.
- **Exportação**: Exportação de dados (Excel/PDF).

## Tecnologias Utilizadas

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI.
- **Backend**: Next.js API Routes.
- **Banco de Dados**: PostgreSQL (via Prisma ORM).
- **Autenticação**: NextAuth.js.

## Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/Andre-Brito-py/i9_alpha.git
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as chaves necessárias (ver `.env.example` se houver, ou consulte o administrador).

4. Configure o banco de dados:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

6. Acesse `http://localhost:3000`.

## Deploy

Veja o arquivo [README_DEPLOY.md](./README_DEPLOY.md) para instruções detalhadas de deploy na Vercel com Neon (PostgreSQL).
