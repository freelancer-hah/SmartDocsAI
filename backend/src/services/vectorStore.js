import { config } from '../config.js';

/**
 * Calculates Cosine Similarity between two numerical vectors.
 * Cosine Similarity = (A · B) / (||A|| * ||B||)
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} Value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized text embeddings)
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * In-Memory Vector Store for SmartDocs AI RAG.
 * Fast, lightweight, zero external DB dependencies required, perfectly suited for interactive document Q&A.
 */
export class VectorStore {
  constructor() {
    /** @type {Map<string, {metadata: any, chunks: Array<any>}>} */
    this.documents = new Map();
    this.activeDocumentId = null;
  }

  /**
   * Save a document and its embedded chunks into the store
   * @param {string} documentId 
   * @param {object} metadata 
   * @param {Array<any>} embeddedChunks 
   */
  addDocument(documentId, metadata, embeddedChunks) {
    this.documents.set(documentId, {
      metadata: {
        id: documentId,
        uploadedAt: new Date().toISOString(),
        chunkCount: embeddedChunks.length,
        ...metadata,
      },
      chunks: embeddedChunks,
    });
    this.activeDocumentId = documentId;
  }

  /**
   * Get active document information
   */
  getActiveDocument() {
    if (!this.activeDocumentId || !this.documents.has(this.activeDocumentId)) {
      return null;
    }
    const doc = this.documents.get(this.activeDocumentId);
    return doc.metadata;
  }

  /**
   * Retrieve the top-K most relevant chunks for a given query vector
   * @param {number[]} queryEmbedding 
   * @param {number} topK 
   * @param {number} threshold 
   * @param {string} [documentId] 
   * @returns {Array<{chunk: any, score: number}>}
   */
  search(
    queryEmbedding,
    topK = config.topK,
    threshold = config.similarityThreshold,
    documentId = this.activeDocumentId
  ) {
    const targetDocId = documentId || this.activeDocumentId;
    if (!targetDocId || !this.documents.has(targetDocId)) {
      return [];
    }

    const doc = this.documents.get(targetDocId);
    const scoredChunks = [];

    for (const chunk of doc.chunks) {
      if (!chunk.embedding) continue;
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);

      scoredChunks.push({
        id: chunk.id,
        chunkIndex: chunk.chunkIndex,
        section: chunk.section || 'General',
        text: chunk.text,
        score: parseFloat(score.toFixed(4)),
      });
    }

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    // Filter by threshold (or return at least the best match if scores are close)
    const filtered = scoredChunks.filter((item) => item.score >= threshold);

    // If no chunk strictly passed the threshold, take the highest scoring 1-2 chunks for context evaluation
    const results = filtered.length > 0 ? filtered.slice(0, topK) : scoredChunks.slice(0, Math.min(2, scoredChunks.length));

    return results;
  }

  /**
   * Clear all indexed documents
   */
  clear() {
    this.documents.clear();
    this.activeDocumentId = null;
  }
}

// Global Singleton vector store
export const globalVectorStore = new VectorStore();
