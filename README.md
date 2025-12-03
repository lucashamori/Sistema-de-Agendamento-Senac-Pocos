# 🧪 LabManager - Sistema de Agendamento de Laboratórios

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

O **LabManager** é uma aplicação web desenvolvida para otimizar e controlar o agendamento de laboratórios escolares (focado no contexto do Senac Minas). O sistema resolve problemas de conflitos de horários, gestão de equipamentos e controle de acesso de docentes e coordenadores.

##  Tecnologias Utilizadas

O projeto utiliza uma stack moderna, focada em performance e escalabilidade Serverless.

* **Frontend & Backend:** [Next.js 14+](https://nextjs.org/) (App Router & Server Actions)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/ui](https://ui.shadcn.com/)
* **Banco de Dados:** [Neon Database](https://neon.tech/) (PostgreSQL Serverless)
* **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
* **Autenticação:** [Firebase Auth](https://firebase.google.com/)
* **Hospedagem:** [Vercel](https://vercel.com/)

## ⚙️ Funcionalidades Principais

* ✅ **Login Híbrido:** Autenticação via Firebase integrada com permissões no PostgreSQL.
* 📅 **Agendamento Inteligente:** Sistema de calendário com **trava nativa de banco de dados** (`EXCLUDE constraint`) que impede fisicamente agendamentos duplicados na mesma sala/horário.
* 🛡️ **Controle de Acesso (RBAC):**
    * **Administrador:** Acesso total (Aprovar, Cancelar, Gerir Usuários).
    * **Docente:** Solicitar agendamentos e realizar Checklists.
    * **Coordenador:** Gestão de inventário e equipamentos.
    * **Consulta:** Visualização apenas (Alunos).
* 📋 **Checklist de Sala:** Controle de entrega da sala e materiais após o uso.

---

## 🛠️ Como rodar o projeto localmente

Siga os passos abaixo para configurar o ambiente de desenvolvimento.

### 1. Pré-requisitos
* Node.js (v18 ou superior)
* Conta no [Neon.tech](https://neon.tech) (Postgres)
* Projeto no [Firebase Console](https://console.firebase.google.com/)

### 2. Clonar o repositório e instalar dependências

```bash
git clone (https://github.com/alunosDesenvolvimentoSenac/projeto-integrador.git)
cd projeto-integrador
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto e preencha com suas chaves:

```bash
# --- NEON DATABASE (Pegar no Console do Neon) ---
# Selecione a opção "Pooled connection" se disponível
DATABASE_URL="postgres://usuario:senha@ep-exemplo.aws.neon.tech/labmanager?sslmode=require"

# --- FIREBASE CONFIG (Pegar no Console do Firebase > Project Settings) ---
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="seu-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="seu-app"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="seu-app.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:123..."
```

### 4. Sincronizar Banco de Dados (Drizzle)
```bash
npx drizzle-kit introspect
```

### 5. Rodar o servidor
```bash
npm run dev
```
