# i9 Alpha

Sistema de Gestão de Demandas (i9 Alpha)

## Sobre o Projeto

Este é um sistema de gestão de demandas desenvolvido com Next.js, Prisma e Tailwind CSS.
O sistema permite o gerenciamento de demandas com controle de acesso baseado em cargos (RBAC).

## Funcionalidades

- **Autenticação**: Login seguro com NextAuth.
- **Gestão de Demandas**: Criação, edição e visualização de demandas.
  - **Sub-demandas e Etapas**: Divisão de demandas em tarefas menores com controle de progresso.
- **Gestão de Parceiros e Colaboradores**:
  - Cadastro de Lojas/Parceiros com CNPJ.
  - Cadastro de Funcionários vinculados a lojas.
  - Campos formatados e validados (Telefone, Matrícula, CNPJ).
  - Novos campos: Razão Social, SAP Cliente e SAP Fornecedor.
  - Visualização rápida de detalhes e funcionários ao clicar no apelido do parceiro.
- **Interface e Responsividade**:
  - **Sidebar Colapsável**: Otimização de espaço em desktops.
  - **Menu Mobile**: Navegação adaptada para celulares com menu lateral (Sheet).
  - Layout fluido e responsivo.
- **Controle de Acesso (RBAC)**:
  - **Admin**: Acesso total (Cria/Edita para todos).
  - **Supervisor**: Gerencia demandas próprias e de Backoffice.
  - **Backoffice**: Gerencia apenas demandas próprias.
- **Dashboard**:
  - Visão geral das demandas.
  - Contagem automática de demandas atrasadas.
  - Indicadores de status e urgência.
- **Exportação**: Exportação de dados (Excel/PDF).

## Tecnologias Utilizadas

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI.
- **Backend**: Next.js API Routes.
- **Banco de Dados**: PostgreSQL (via Prisma ORM) - Configurado para deploy na Vercel/Neon.
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
   Crie um arquivo `.env` na raiz do projeto com as chaves necessárias:
   ```env
   DATABASE_URL="sua_string_conexao_postgres"
   NEXTAUTH_SECRET="sua_chave_secreta"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Configure o banco de dados:
   ```bash
   npx prisma generate
   npx prisma db push
   # Opcional: Popular com dados iniciais
   # npx prisma db seed
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

6. Acesse `http://localhost:3000`.

## Deploy (Vercel + Neon)

O projeto já está configurado para deploy na Vercel utilizando banco de dados PostgreSQL (Neon, Supabase, etc).

1. Faça o push do código para o GitHub.
2. Importe o projeto na Vercel.
3. Nas configurações do projeto na Vercel, adicione as variáveis de ambiente:
   - `DATABASE_URL`: String de conexão do seu banco PostgreSQL (ex: Neon).
   - `NEXTAUTH_SECRET`: Uma string aleatória segura.
   - `NEXTAUTH_URL`: A URL do seu domínio na Vercel (ex: `https://i9-alpha.vercel.app`).
4. A Vercel detectará automaticamente o Next.js e fará o build.
