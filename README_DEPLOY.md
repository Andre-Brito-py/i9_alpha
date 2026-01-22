# Guia de Deploy (Vercel + Neon)

Este guia ajuda você a colocar seu projeto Next.js no ar usando Vercel (Hospedagem) e Neon (Banco de Dados PostgreSQL).

## 1. Configurar o Banco de Dados (Neon)

1. Crie uma conta em [Neon.tech](https://neon.tech).
2. Crie um novo projeto.
3. No painel (Dashboard), copie a **Connection String** (URL de conexão). Ela se parece com:
   `postgresql://neondb_owner:*******@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

## 2. Configurar o Projeto Localmente (Opcional, mas recomendado)

Para testar se a conexão funciona antes de subir:

1. Abra o arquivo `.env` na raiz do projeto.
2. Substitua o valor de `DATABASE_URL` pela URL que você copiou do Neon.
3. Rode o comando para criar as tabelas no banco novo:
   ```bash
   npx prisma db push
   ```
4. Se quiser popular o banco com dados iniciais:
   ```bash
   npx prisma db seed
   ```

## 3. Fazer o Deploy na Vercel

1. Crie uma conta em [Vercel.com](https://vercel.com) e conecte com seu GitHub.
2. Faça o **Push** do seu código atual para um repositório no GitHub.
3. Na Vercel, clique em **"Add New..."** -> **"Project"**.
4. Importe seu repositório do GitHub.
5. Na tela de configuração de deploy ("Configure Project"):
   * Vá na seção **Environment Variables**.
   * Adicione as seguintes variáveis:
     * `DATABASE_URL`: Cole a URL do Neon aqui.
     * `NEXTAUTH_SECRET`: Gere uma chave aleatória (pode digitar qualquer coisa longa e segura) ou use `openssl rand -base64 32` no terminal para gerar uma.
     * `NEXTAUTH_URL`: Coloque a URL que a Vercel gerar para seu projeto (ex: `https://seu-projeto.vercel.app`). *Nota: No primeiro deploy pode deixar sem, ou colocar a URL provisória se souber, mas depois de deployar, volte aqui e ajuste se necessário.*

6. Clique em **Deploy**.

## 4. Pós-Deploy

A Vercel vai construir o projeto. O Prisma vai rodar automaticamente o `prisma generate` durante o build (já configurado no package.json).

Se precisar rodar migrações ou seeds no banco de produção, você pode rodar localmente apontando para o banco de produção (via `.env`) ou configurar comandos de build na Vercel (avançado). O método mais simples é usar `npx prisma db push` localmente com a URL do banco de produção no seu `.env`.

---

**Observação:**
Como mudamos de SQLite para PostgreSQL, seus dados locais antigos (que estavam no arquivo `dev.db`) foram removidos para evitar conflitos. Você começará com um banco limpo.
