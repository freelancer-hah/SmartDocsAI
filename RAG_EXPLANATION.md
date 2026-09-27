# SmartDocs AI – RAG (Retrieval-Augmented Generation) Architecture & Retrieval Explanation

This document explains the technical architecture, mathematical foundations, and pipeline flow powering the **SmartDocs AI** Document Question & Answering system.

---

## 1. High-Level Architecture Overview

```
                          [ User Uploads PDF ]
                                   │
                                   ▼
                 ┌───────────────────────────────────┐
                 │        PDF Extraction &           │
                 │     Structure Sanitization        │
                 │      (Magic header check)         │
                 └─────────────────┬─────────────────┘
                                   │ Raw Text & Page Stream
                                   ▼
                 ┌───────────────────────────────────┐
                 │    Section-Aware Text Chunking    │
                 │  (Window: 600 chars, Ovlp: 150)   │
                 └─────────────────┬─────────────────┘
                                   │ Text Segments + Metadata
                                   ▼
                 ┌───────────────────────────────────┐
                 │     Google Gemini Embeddings      │
                 │       (text-embedding-004)        │
                 └─────────────────┬─────────────────┘
                                   │ 768-dim Dense Vectors
                                   ▼
                 ┌───────────────────────────────────┐
                 │       In-Memory Vector Store      │
                 │     (Multi-Doc Document Index)    │
                 └─────────────────┬─────────────────┘
                                   │
┌──────────────────────────────┐   │
│       User Natural Query     │───┼────────────────────────────────┐
└──────────────────────────────┘   │                                │
                                   ▼                                ▼
                     ┌───────────────────────────┐    ┌───────────────────────────┐
                     │   Query Vector Embedding  │    │ Cosine Similarity Search  │
                     │   (text-embedding-004)    │───▶│  (Top-K Ranking & Filter) │
                     └───────────────────────────┘    └─────────────┬─────────────┘
                                                                    │
                                                         Top-K Relevant Chunks
                                                                    │
                                                                    ▼
                                                      ┌───────────────────────────┐
                                                      │  Grounded Prompt Assembly │
                                                      │  (Strict context bounds)  │
                                                      └─────────────┬─────────────┘
                                                                    │
                                                                    ▼
                                                      ┌───────────────────────────┐
                                                      │  Gemini 1.5 Flash LLM     │
                                                      │  (Low Temp 0.1 Factual)   │
                                                      └─────────────┬─────────────┘
                                                                    │
                                                                    ▼
                                                      ┌───────────────────────────┐
                                                      │ Answer + Source Citations │
                                                      │ (Returned to Frontend UI) │
                                                      └───────────────────────────┘
```

---

## 2. Ingestion & Preprocessing Pipeline

### A. Document Validation & Text Extraction
- **Format Verification**: Checks binary magic headers (`%PDF-`) to reject renamed non-PDF files and corrupt streams before parsing.
- **Text Extraction**: Uses `unpdf` / `pdfjs-dist` to parse textual layer content across all pages while preserving line breaks.
- **Sanitization**: Strips erratic control characters and normalizes consecutive whitespace and paragraph boundaries.

### B. Section-Aware Text Chunking (`ChunkingService.js`)
Rather than blindly splitting text at arbitrary character limits (which chops sentences or splits critical policy numbers in half), SmartDocs AI utilizes a **Sliding-Window Section-Aware Chunking Strategy**:
- **Target Chunk Size**: ~600 characters.
- **Sliding Overlap**: ~150 characters (ensures concepts bridging two chunks retain surrounding context).
- **Header & Section Propagation**: Detects section markers (`Section X: ...`, `1. ...`, `Chapter ...`) and tags each chunk with its originating section name.

---

## 3. Vector Embeddings & Similarity Math

### A. Dense Embeddings (`EmbeddingService.js`)
- Each chunk text $C_i$ and the user's question $Q$ are converted into high-dimensional semantic vectors using Google Gemini `text-embedding-004`:
  $$\vec{E}(C_i) \in \mathbb{R}^{768}, \quad \vec{E}(Q) \in \mathbb{R}^{768}$$

### B. Cosine Similarity Formula (`vectorStore.js`)
To measure the semantic closeness between the user's question vector $\vec{u}$ and candidate document chunk vector $\vec{v}$, the cosine of the angle between them is computed:

$$\text{Cosine Similarity}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|_2 \|\vec{v}\|_2} = \frac{\sum_{i=1}^{n} u_i v_i}{\sqrt{\sum_{i=1}^{n} u_i^2} \sqrt{\sum_{i=1}^{n} v_i^2}}$$

- **Range**: $-1.0 \le \text{similarity} \le 1.0$ (typically $0.0$ to $1.0$ for normalized semantic embeddings).
- **Thresholding**: Chunks scoring above `SIMILARITY_THRESHOLD = 0.35` are retained; the top $K=4$ highest-ranking chunks are selected for synthesis.

---

## 4. Grounded Prompt Engineering & Anti-Hallucination Guardrails

To eliminate hallucinations and prevent the model from assuming facts outside the uploaded handbook:
1. **Strict Context Isolation**: The system instruction explicitly commands Gemini to act solely as a retriever for the supplied text.
2. **Explicit Fallback Protocol**: If the retrieved context does not contain the answer, the LLM is instructed to explicitly state:
   > *"Based on the provided document, this information is not available."*
3. **Deterministic Sampling**: `temperature: 0.1` and `top_p: 0.8` ensure maximum factual consistency and deterministic generation.

---

## 5. Source Attribution & Grounding Verification

Every generated answer is returned alongside its **Grounding Sources**:
- **Section Title** (e.g., `Section 4: Remote Work and Home Office Policy`)
- **Cosine Relevance Score** (e.g., `89.4% Match`)
- **Exact Chunk Excerpt**: The user can expand the sources accordion to verify the AI's answer against the exact text in the PDF.
