# AgentoServe
AgentoServe is a full-stack AI platform that allows users to create intelligent agents backed by custom knowledge bases. Users can create projects, upload documents (PDF/TXT), and converse with multiple state-of-the-art Large Language Models (LLMs) grounded in their uploaded context.
## 🚀 Features
- **Project Management**: Create, edit, and organize multiple AI agent workspaces.
- **Custom Knowledge Base**: Upload PDF and TXT files to build a specialized context for each project.
- **Vector Search & Embeddings**: Automatically chunks, vectorizes (using `pgvector`), and summarizes document uploads for rapid, context-aware semantic search.
- **Model Flexibility**: Seamlessly toggle between top-tier AI models (e.g., GPT-4o, Claude 3.5 Sonnet, Llama 3.1 405B, Mistral, Phi-3).
- **Intelligent Routing**: Determines user intent dynamically to query specific document chunks or broader summaries based on conversational context.
- **Modern Dashboard**: A clean, responsive Next.js dashboard built with TailwindCSS for a premium user experience.
## 🛠️ Tech Stack
### Backend (`/server`)
- **Framework**: ASP.NET Core Web API (C#)
- **Database**: PostgreSQL with `pgvector` extension for storing and querying embeddings
- **ORM**: Entity Framework Core
- **AI Integrations**: Semantic Kernel / direct APIs for embeddings and chat completions
- **Background Processing**: C# BackgroundServices for asynchronous document slicing, chunking, and embedding generation
### Frontend (`/client`)
- **Framework**: Next.js (React)
- **Styling**: TailwindCSS & Headless UI components
- **State Management**: Zustand
- **Icons**: React Icons (Heroicons)
## 📦 Getting Started
### Prerequisites
- Node.js (v18+)
- .NET 8.0 SDK
- PostgreSQL database with the `pgvector` extension installed
### 1. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Update the database connection string and API keys (OpenAI, etc.) in `appsettings.json`.
3. Apply Entity Framework migrations:
   ```bash
   dotnet ef database update
   ```
4. Run the API:
   ```bash
   dotnet run
   ```
   The backend will start on `http://localhost:5080`.
### 2. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.
## 🧠 Architecture Highlights
- **Smart Retraining**: When editing projects, you can append new files. The `TrainingWorker` is designed to be efficient, identifying and processing only untrained files to save embedding costs and time.
- **Hybrid Context Queries**: The platform detects if a user is asking a broad/summarization question versus a specific question, routing the query to special `IsSummary` chunks or standard document chunks accordingly.
