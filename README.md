# PromptForge - AI Engineering Workbench

PromptForge is a full-stack platform designed for AI Engineers to prototype, manage, and test prompt templates efficiently. It features a VS Code-style editor, real-time AI generation (via Groq), version control for prompts, and robust batch testing capabilities with database persistence.

## 🚀 Features

- **Project Management**: Organize prompts into distinct projects.
- **Advanced Playground**: Monaco Editor with Handlebars syntax highlighting.
- **Prompt Versioning**: Automatically tracks history (v1, v2, v3) of every prompt save.
- **Model Selection**: Dynamic switching between Llama 3 and Mixtral models.
- **Batch Testing**: Upload CSV files to run prompts against multiple test cases; results are stored in PostgreSQL for review.
- **Security**: Environment variable management for API keys.

---

## 🛠️ Tech Stack

### Backend

- **Framework**: NestJS (Modular Architecture)
- **Database**: PostgreSQL
- **ORM**: Prisma (Type-safe database access)
- **AI Integration**: Groq SDK (Llama 3, Mixtral)
- **Tooling**: TypeScript, pnpm

### Frontend

- **Framework**: Vue 3 (Composition API)
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor (Powering VS Code)
- **State**: Vue Reactivity System
- **HTTP Client**: Axios

---

## ⚙️ Setup & Installation Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- PostgreSQL (running locally on port 5432)

---

### 2. Backend Setup

```bash
cd prompt-forge-backend
pnpm install
```

Create a `.env` file in `prompt-forge-backend`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/promptforge?schema=public"
GROQ_API_KEY="your_groq_api_key_here"
```

Initialize database and start server:

```bash
npx prisma db push
npx prisma generate
pnpm start:dev
```

Backend runs at **http://localhost:3000**

---

### 3. Frontend Setup

```bash
cd prompt-forge-frontend
pnpm install
pnpm dev
```

Frontend runs at **http://localhost:5173**

---

## 🧪 Usage Guide (For Evaluators)

### Workflow 1: Creating & Versioning Prompts

1. Open the Dashboard
2. Click **+ New Project**
3. Open the project
4. Type:

```handlebars
Explain {{topic}} to a {{audience}}.
```

5. Click **Run**
6. Click **Save** (Version 1)
7. Change model to **Mixtral**
8. Click **Save** again (Version 2)

---

### Workflow 2: Batch Testing

Create `test.csv`:

```csv
topic,audience
Quantum Physics,Five Year Old
Tax Returns,Teenager
```

Upload it in **Batch Testing** tab and observe persisted results.

---

## 🔒 Security Note

- API keys are stored in `.env`
- `.env` is ignored via `.gitignore`
- No secrets are committed to version control

---

# ARCHITECTURE

## High-Level Overview

PromptForge follows a **Client–Server Architecture**. Vue 3 SPA communicates with a NestJS backend over REST APIs. The backend manages persistence using PostgreSQL and handles LLM inference via Groq.

## Architecture Diagram

```mermaid
graph TD
    User --> Client
    Client --> Server
    Server --> Prisma
    Prisma --> DB[(PostgreSQL)]
    Server --> AI[Groq API]
```

---

## System Components

### Frontend

- Vue 3 + Composition API
- Monaco Editor
- Reactive local state

### Backend

- Modular NestJS architecture
- Feature-based modules
- AI logic abstracted in AiService

### Database

- Project → Prompt → PromptVersion
- Prompt → BatchRun → BatchResult

---

## Key Design Decisions

### AI Abstraction

LLM logic is isolated to allow future provider swaps without frontend changes.

### Batch Persistence

Batch results are streamed, processed, and persisted for auditability.

---

## 🎥 Video Demo Script (2–5 Minutes)

### Scene 1: Project Creation

- Show dashboard
- Create new project

### Scene 2: Prompt Versioning

- Run prompt
- Save v1
- Modify and save v2

### Scene 3: Batch Testing

- Upload CSV
- Show results
- Refresh to prove persistence

### Scene 4: Code Glance

- Show ai.service.ts
- Explain env-based security

---

## ✅ Final Security Checklist

- `.env` present in `.gitignore`
- No API keys committed
- Ready for submission
