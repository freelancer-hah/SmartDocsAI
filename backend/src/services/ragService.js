import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { EmbeddingService } from './embeddingService.js';
import { globalVectorStore } from './vectorStore.js';

export class RagService {
  constructor(apiKey = config.geminiApiKey) {
    this.apiKey = apiKey;
    this.embeddingService = new EmbeddingService(apiKey);
    this.modelName = config.geminiModel || 'gemini-3.6-flash';
  }

  /**
   * Main RAG Q&A Execution pipeline
   * @param {string} question - User's natural language question
   * @param {string} [documentId] - Optional document ID to target
   * @returns {Promise<{answer: string, sources: Array<any>, foundInDocument: boolean, latencyMs: number}>}
   */
  async answerQuestion(question, documentId = null) {
    const startTime = Date.now();

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      throw new Error('Question cannot be empty. Please ask a valid question about the document.');
    }

    const trimmedQuestion = question.trim();

    // Check if any document is uploaded/active
    const activeDoc = globalVectorStore.getActiveDocument();
    if (!activeDoc) {
      throw new Error('No document is currently loaded. Please upload a PDF policy document first.');
    }

    // Step 1: Generate vector embedding for the incoming question
    const queryEmbedding = await this.embeddingService.generateEmbedding(trimmedQuestion);

    // Step 2: Retrieve Top-K matching chunks from the Vector Store
    const matchedChunks = globalVectorStore.search(
      queryEmbedding,
      config.topK,
      config.similarityThreshold,
      documentId
    );

    if (matchedChunks.length === 0) {
      return {
        answer: 'I could not find any relevant sections in the uploaded document to answer your question. Please ensure your question relates to the uploaded document content.',
        sources: [],
        foundInDocument: false,
        latencyMs: Date.now() - startTime,
      };
    }

    // Step 3: Construct Grounded RAG Prompt with Retrieved Context
    const contextText = matchedChunks
      .map((item, idx) => `[Source ${idx + 1} | Section: ${item.section} (Match Score: ${(item.score * 100).toFixed(1)}%)]\n${item.text}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are SmartDocs AI, a precise enterprise Document Q&A assistant.
Your job is to answer the user's question strictly and truthfully based ONLY on the provided context excerpts from the uploaded document.

### CRITICAL RULES:
1. STRICT GROUNDEDNESS: Use ONLY the information provided in the Context below. Do not use prior training assumptions or outside knowledge.
2. OUT-OF-DOCUMENT REFUSAL: If the question cannot be answered directly and factually from the provided Context, say:
   "Based on the provided document, this information is not available."
   Do NOT attempt to guess, assume, or fabricate policies that are not stated.
3. CONCISE & STRUCTURED: Format your answer clearly using Markdown (bullet points, bold numbers, clear headers).
4. CITATIONS: When mentioning specific policies, refer to the relevant section names where applicable.

---
### DOCUMENT CONTEXT:
${contextText}
---
`;

    // Step 4: Generate Grounded Answer using Gemini
    const genAI = this.embeddingService.getClient();
    const candidateModels = [this.modelName, 'gemini-3.6-flash', 'gemini-3.5-flash']
      .filter(Boolean)
      .filter((m, idx, arr) => arr.indexOf(m) === idx);

    let answerText = '';
    let lastError = null;

    for (const modelToTry of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelToTry,
          generationConfig: {
            temperature: 0.1, // Low temperature for high factual accuracy
            topP: 0.8,
            maxOutputTokens: 800,
          },
        });

        const chat = model.startChat({
          history: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }],
            },
            {
              role: 'model',
              parts: [{ text: 'Understood. I will answer strictly based on the provided document context and explicitly decline if the answer is not present.' }],
            },
          ],
        });

        const response = await chat.sendMessage(trimmedQuestion);
        answerText = response.response.text();
        this.modelName = modelToTry; // Update working model
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Chat completion attempt with ${modelToTry} failed, trying fallback model:`, err.message);
      }
    }

    if (lastError && !answerText) {
      console.error('Gemini RAG Generation Error:', lastError);
      throw new Error(`Failed to generate answer from Gemini API: ${lastError.message}`);
    }

      // Check if answer indicates absence of information
      const isNotFound =
        answerText.toLowerCase().includes('not available') ||
        answerText.toLowerCase().includes('not present') ||
        answerText.toLowerCase().includes('not mentioned') ||
        answerText.toLowerCase().includes('does not contain');

      // Step 5: Format Source References for Frontend
      const sources = matchedChunks.map((chunk, idx) => ({
        sourceNumber: idx + 1,
        chunkId: chunk.id,
        section: chunk.section,
        relevanceScore: `${(chunk.score * 100).toFixed(1)}%`,
        score: chunk.score,
        snippet: chunk.text.length > 250 ? chunk.text.slice(0, 250) + '...' : chunk.text,
        fullText: chunk.text,
      }));

      return {
        answer: answerText,
        sources: isNotFound && matchedChunks[0].score < 0.4 ? [] : sources,
        foundInDocument: !isNotFound,
        latencyMs: Date.now() - startTime,
        documentTitle: activeDoc.fileName || activeDoc.title || 'Uploaded Document',
      };
  }
}
