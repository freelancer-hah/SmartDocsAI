import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root or parent root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  embeddingModel: process.env.EMBEDDING_MODEL || 'gemini-embedding-001',
  chunkSize: parseInt(process.env.CHUNK_SIZE || '600', 10),
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '150', 10),
  topK: parseInt(process.env.TOP_K_CHUNKS || '4', 10),
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.35'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE_BYTES || '10485760', 10), // 10MB
};
