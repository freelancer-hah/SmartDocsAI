# SmartDocs AI – Full Stack AI Document Q&A Application (RAG System)

A full-stack enterprise Retrieval-Augmented Generation (RAG) web application that empowers users to upload PDF documents (e.g. employee handbooks, policy manuals) and ask natural language questions with strict contextual grounding, accurate answers, and expandable source citations.

---

## ⏱️ Time Estimate Breakdown

As required by the practical test brief, the estimated hours breakdown per module is:

| Module / Milestone | Scope & Responsibilities | Estimated Hours |
| :--- | :--- | :---: |
| **Document Processing** | PDF upload interface, buffer validation, MIME verification, text extraction, sliding-window chunking | 2.0 hrs |
| **Retrieval / RAG Pipeline** | Dense vector embeddings, in-memory Cosine Similarity search, Top-K threshold ranking | 2.5 hrs |
| **AI Integration** | Prompt engineering, Google Gemini 1.5 Flash grounded synthesis, anti-hallucination guardrails | 2.0 hrs |
| **Backend API** | Express REST API endpoints, Multer file upload, error handling middlewares, health checks | 2.5 hrs |
| **Frontend UI/UX** | React Vite app, glassmorphism design system, drag-and-drop uploader, chat interface, citations | 3.0 hrs |
| **Testing & Evaluation** | 12-question policy evaluation suite (10 in-doc, 2 out-of-doc), edge case verification | 1.5 hrs |
| **Documentation & Deliverables** | Architecture guide, RAG explanation, README, sample policy generator, .env.example | 1.5 hrs |
| **Total Project Duration** | | **~15.0 hrs** |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 6, Lucide React, Custom Glassmorphism CSS Design System
- **Backend**: Node.js (ES Modules), Express 4, Multer (Memory Storage)
- **PDF Engine**: `unpdf` (universal high-performance PDF text parser), `pdfkit` (sample generator)
- **AI & Embeddings**: Google Gemini API (`@google/generative-ai`)
  - **LLM Model**: `gemini-1.5-flash` (deterministic sampling, temperature: 0.1)
  - **Embedding Model**: `text-embedding-004` (768-dimensional dense vectors)
- **Vector Store**: High-speed Cosine Similarity vector indexing with section-level attribution

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── pdfService.js        # PDF validation & text extraction
│   │   │   ├── chunkingService.js   # Section-aware sliding-window chunker
│   │   │   ├── embeddingService.js  # Google Gemini vector embeddings
│   │   │   ├── vectorStore.js       # Cosine similarity vector search
│   │   │   └── ragService.js        # Grounded prompt synthesis & source attribution
│   │   ├── controllers/
│   │   │   ├── documentController.js# Upload & sample document loader
│   │   │   └── chatController.js    # Q&A query handler & test questions
│   │   ├── routes/
│   │   │   ├── documentRoutes.js
│   │   │   └── chatRoutes.js
│   │   ├── server.js                # Express server with CORS & error handlers
│   │   └── config.js                # Configuration & environment variables
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Status badge & logo
│   │   │   ├── FileUploader.jsx     # Drag & drop upload + sample button
│   │   │   ├── DocumentStatsBar.jsx # Active doc stats (pages, words, chunks)
│   │   │   ├── SampleQuestions.jsx  # Clickable 12-question test suite
│   │   │   ├── SourceReference.jsx  # Collapsible grounding citations
│   │   │   └── ChatInterface.jsx    # Interactive chat thread & markdown renderer
│   │   ├── services/
│   │   │   └── api.js               # REST client
│   │   ├── styles/
│   │   │   └── index.css            # Dark glassmorphic design system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── sample_data/
│   ├── Acme_Global_Employee_Handbook_2026.pdf  # Fictional company policy PDF
│   ├── generate_sample_pdf.js                  # PDF generator script
│   └── test_questions.md                       # 12-question evaluation matrix
│
├── RAG_EXPLANATION.md               # Deep-dive into RAG mathematics & retrieval
├── README.md                        # Project documentation
└── .env.example                     # Environment template without secrets
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18.0.0 or higher, tested on Node v24.x)
- Google Gemini API Key ([Get a free key from Google AI Studio](https://aistudio.google.com/))

### 2. Configure Environment Variables
Create a `.env` file inside the `backend` directory:
```bash
# In backend/.env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=5000
NODE_ENV=development
```

### 3. Start the Backend API Server
```bash
cd backend
npm install
npm start
```
The backend server will run at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

### 4. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔒 Error Handling & Security Features
- **File Validation**: Enforces MIME type checking (`application/pdf`) and binary signature inspection (`%PDF-`).
- **Upload Size Limit**: Strictly prevents Denial of Service by capping uploads at 10MB.
- **Empty Query Guard**: Rejects blank prompts before invoking LLM endpoints.
- **Strict Grounding**: Zero hallucination on out-of-scope questions; refuses to speculate when facts are missing.
- **Safe Secrets Handling**: `.env` files are excluded from Git; `.env.example` provides credential-free templates.





