# PromptForge - AI Engineering Workbench

PromptForge is a full-stack MLOps platform designed for AI Engineers to prototype, manage, and test prompt templates efficiently. It features a dual-model playground (Groq & Gemini), real-time version control, and robust batch testing with automated quality metrics.

## 🚀 Features

- **🔐 Secure Authentication**: User registration and login with JWT-based security.
- **📂 Project Management**: Organize prompts into distinct projects with a clear hierarchy.
- **⚔️ Dual-Model Playground**: Compare **Llama 3.3 (via Groq)** and **Gemini 2.5 (via Google)** side-by-side to optimize cost and latency.
- **⏱️ Version Control**: Automatically tracks history (v1, v2, v3) of every prompt save.
- **📊 Batch Testing**: Upload CSV files to run prompts against multiple test cases.
- **✅ Quality Metrics**: Automated assessment of outputs (e.g., JSON validity checks) displayed in real-time.

---

## 🛠️ Tech Stack

### Backend

- **Framework**: NestJS (Modular Architecture)
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: Passport-JWT
- **AI Integration**: Groq SDK + Google Generative AI SDK
- **Tooling**: TypeScript, pnpm

### Frontend

- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia (Auth Store)
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor (VS Code core)
- **HTTP Client**: Axios (with Auth Interceptors)

---

## ⚙️ Setup & Installation

### 1. Prerequisites

- Node.js (v18+)
- pnpm (recommended)
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
JWT_SECRET="your_super_secret_key_generated_via_node"
GROQ_API_KEY="your_groq_key"
GEMINI_API_KEY="your_gemini_key"
```

Initialize database and start server:

```bash
npx prisma db push
npx prisma generate
pnpm start:dev
```

---

### 3. Frontend Setup

```bash
cd prompt-forge-frontend
pnpm install
pnpm dev
```

Access the app at **http://localhost:5173**

---

## 🧪 Usage Guide

### Workflow 1: The Happy Path

1. Register or Login
2. Create a Project from Dashboard
3. Create a Prompt inside the project
4. Use the Playground to:
   - Enter template: `Write a reply to {{customer}} about {{issue}}`
   - Compare Llama 3.3 vs Gemini 2.5
   - Save prompt version

---

### Workflow 2: Batch Testing with Quality Metrics

Create `test.csv`:

```csv
customer,issue
John Doe,Late Delivery
Jane Smith,Wrong Item
```

Upload CSV in **Batch Testing** tab and observe quality badges.

---

## 🔒 Security

- Passwords are hashed using Argon2/Bcrypt
- JWT-protected APIs using AuthGuards
- Secrets are stored only in `.env` files

---

# ARCHITECTURE

> **Document Status:** Final  
> **Last Updated:** 2025-12-20

---

## 1. System Overview

**PromptForge** is a specialized MLOps tool for prompt engineering. It solves prompt drift and model selection by enabling structured experimentation across multiple LLM providers.

---

## 2. High-Level Architecture

PromptForge follows a **Three-Tier Architecture**:

1. **Presentation Layer** – Vue 3 + Pinia
2. **Application Layer** – NestJS API
3. **Data Layer** – PostgreSQL (Prisma ORM)

```mermaid
graph TD
    User --> Client[Vue 3 Frontend]
    Client -->|JWT| Server[NestJS Backend]

    Server --> AuthService
    Server --> PromptService
    Server --> AIService

    AuthService --> DB[(PostgreSQL)]
    PromptService --> DB
    AIService --> Groq[Groq API]
    AIService --> Gemini[Google Gemini API]
```

---

## 3. Component Design

### 3.1 Frontend

- Vue 3 with `<script setup>`
- Pinia for auth state
- Monaco Editor for prompt editing
- Axios with JWT interceptors

### 3.2 Backend

- NestJS modular structure
- Passport-JWT authentication
- AiService as provider-agnostic facade

### 3.3 Database Schema

- **User**: id, email, passwordHash
- **Project**: id, name, userId
- **Prompt**: id, name, projectId
- **PromptVersion**: id, template, model, version
- **BatchResult**: id, inputs, output, qualityScore

---

## 4. Key Workflows

### 4.1 Model Comparison

- Frontend triggers parallel inference
- Backend routes to Groq & Gemini
- Responses normalized and returned with metadata

### 4.2 Quality Metrics

- Backend validates JSON output
- Quality score assigned (1 or 0)
- Persisted and returned to UI

---

## 5. Security Measures

- JWT authentication
- CORS restricted to frontend origin
- All secrets managed via environment variables

---

## ✅ Final Checklist

- `.env` files ignored via `.gitignore`
- No secrets committed
- Ready for deployment
