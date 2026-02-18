# i9 Alpha - Sistema de Gestão de Demandas

Sistema corporativo de alta performance para gestão de demandas, focado em rastreabilidade, controle de acesso e experiência do usuário premium.

## 🚀 Sobre o Projeto

O **i9 Alpha** é uma solução robusta desenvolvida para otimizar o fluxo de trabalho entre equipes, parceiros e colaboradores. Com uma interface moderna inspirada no ecossistema SaaS de elite, o sistema oferece controle total sobre o ciclo de vida das demandas.

## ✨ Principais Funcionalidades

- **🔐 Segurança Dinâmica**: 
  - Autenticação avançada com NextAuth.js.
  - **RBAC (Role Based Access Control)**: Permissões granuladas para Admin, Supervisor e Backoffice.
- **📋 Ciclo de Vida de Demandas**: 
  - Gestão de demandas com suporte a sub-demandas e evidências anexas.
  - Controle de prazos inteligente com status automático de "Atrasada".
- **🏪 Ecossistema de Parceiros**:
  - Catálogo completo de lojas e parceiros com validações fiscais (CNPJ).
  - Gestão de colaboradores vinculados a unidades específicas.
  - Integração com dados SAP (Cliente/Fornecedor).
- **📊 Dashboard Analítico**: Visualização clara de KPIs e métricas de desempenho.
- **🤖 Suporte Assistido**: Módulo demonstrativo de atendimento via IA integrada ao WhatsApp.
- **📱 UX Transversal**: Interface 100% responsiva com sidebar inteligente e navegação mobile otimizada.

## 🛠️ Stack Tecnológica

- **Core**: [Next.js](https://nextjs.org/) (App Router) + [TypeScript](https://www.typescriptlang.org/)
- **UI/UX**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **Data Layer**: [Prisma ORM](https://www.prisma.io/) + PostgreSQL (Neon)
- **State & Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Utilities**: [Date-fns](https://date-fns.org/), [XLSX](https://sheetjs.com/)

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js (v18+)
- PostgreSQL (pode ser via Neon.tech)

### Passo a Passo

1. **Clonar e Instalar**:
   ```bash
   git clone https://github.com/Andre-Brito-py/i9_alpha.git
   cd i9_alpha/web_app
   npm install
   ```

2. **Variáveis de Ambiente**:
   Crie um `.env` com base no exemplo abaixo:
   ```env
   DATABASE_URL="sua_url_postres"
   NEXTAUTH_SECRET="sua_chave_secreta"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Rodar em Desenvolvimento**:
   ```bash
   npm run dev
   ```

## 🌐 Deploy

O projeto está otimizado para deploy na **Vercel**. 

1. Conecte seu repositório GitHub à Vercel.
2. Configure as variáveis de ambiente necessárias.
3. O build e deployment ocorrerão automaticamente em cada push para a `main`.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---
Desenvolvido com ❤️ por [André Brito](https://github.com/Andre-Brito-py)
