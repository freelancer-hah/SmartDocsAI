import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

/**
 * Service to generate vector embeddings using Google Gemini API.
 */
export class EmbeddingService {
  /**
   * @param {string} apiKey 
   */
  constructor(apiKey = config.geminiApiKey) {
    this.apiKey = apiKey;
    this.modelName = config.embeddingModel || 'gemini-embedding-001';
  }

  /**
   * Get an instance of the Google Generative AI client
   * @returns {GoogleGenerativeAI}
   */
  getClient() {
    const key = this.apiKey || config.geminiApiKey;
    if (!key || key === 'your_gemini_api_key_here') {
      throw new Error(
        'GEMINI_API_KEY is not configured. Please set your Gemini API key in backend/.env'
      );
    }
    return new GoogleGenerativeAI(key);
  }

  /**
   * Generate an embedding vector for a single string (chunk or query)
   * @param {string} text 
   * @returns {Promise<number[]>}
   */
  async generateEmbedding(text) {
    const client = this.getClient();
    const candidateModels = [this.modelName, 'gemini-embedding-001', 'gemini-embedding-2']
      .filter(Boolean)
      .filter((m, idx, arr) => arr.indexOf(m) === idx);

    let lastError = null;
    for (const modelToTry of candidateModels) {
      // Try up to 2 attempts per model with small backoff in case of burst rate limits
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = client.getGenerativeModel({ model: modelToTry });
          const result = await model.embedContent(text);
          if (result.embedding && result.embedding.values) {
            this.modelName = modelToTry; // Remember working model
            return result.embedding.values;
          }
        } catch (err) {
          lastError = err;
          // If rate limit or temporary server error, wait before retry
          if (attempt === 1 && (err.message?.includes('429') || err.message?.includes('503'))) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          console.warn(`Embedding attempt with ${modelToTry} failed:`, err.message);
          break;
        }
      }
    }

    console.error('Gemini Embedding generation error across all candidate models:', lastError);
    throw new Error(`Embedding generation failed: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Generate embeddings for a batch of text chunks sequentially / in small batches to respect rate limits
   * @param {Array<{id: string, text: string, [key: string]: any}>} chunks 
   * @returns {Promise<Array<{id: string, text: string, embedding: number[], [key: string]: any}>>}
   */
  async generateBatchEmbeddings(chunks) {
    const embeddedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.generateEmbedding(chunk.text);
      embeddedChunks.push({
        ...chunk,
        embedding,
      });
      // Small 75ms pause to avoid hitting aggressive burst rate limits
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 75));
      }
    }

    return embeddedChunks;
  }
}
