import { config } from '../config.js';

/**
 * Service to chunk raw document text into overlapping segments for vector search.
 */
export class ChunkingService {
  /**
   * Splits text into overlapping chunks with section context
   * @param {string} text - Raw sanitized text from document
   * @param {number} chunkSize - Target size in characters per chunk
   * @param {number} overlap - Overlap in characters between chunks
   * @returns {Array<{id: string, text: string, chunkIndex: number, section: string, charCount: number}>}
   */
  static splitText(text, chunkSize = config.chunkSize, overlap = config.chunkOverlap) {
    if (!text || typeof text !== 'string') return [];

    // Normalize text into lines
    const lines = text.split('\n');
    const chunks = [];
    let currentChunkLines = [];
    let currentChunkLength = 0;
    let currentSection = 'General Document Overview';
    let chunkIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check if line represents a section header (e.g. "Section 1: ...", "Chapter 2: ...", "1. ...", "### ...")
      const isHeader =
        /^section\s+\d+[:\.\-]/i.test(line) ||
        /^chapter\s+\d+[:\.\-]/i.test(line) ||
        /^\d+\.\s+[A-Z]/i.test(line) ||
        /^#{1,3}\s+[A-Z]/i.test(line) ||
        (/^[A-Z\s\-]{4,30}:?$/.test(line) && line.length < 40);

      if (isHeader) {
        currentSection = line;
      }

      // If adding this line exceeds the target chunk size, finalize current chunk
      if (currentChunkLength + line.length > chunkSize && currentChunkLines.length > 0) {
        const chunkText = currentChunkLines.join('\n').trim();
        chunks.push({
          id: `chunk_${chunkIndex}`,
          chunkIndex,
          text: chunkText,
          section: currentSection,
          charCount: chunkText.length,
        });
        chunkIndex++;

        // Calculate overlap lines from the tail of current chunk
        let overlapLines = [];
        let accumulatedOverlapLength = 0;

        for (let j = currentChunkLines.length - 1; j >= 0; j--) {
          const l = currentChunkLines[j];
          if (accumulatedOverlapLength + l.length <= overlap) {
            overlapLines.unshift(l);
            accumulatedOverlapLength += l.length;
          } else {
            break;
          }
        }

        currentChunkLines = [...overlapLines, line];
        currentChunkLength = currentChunkLines.reduce((acc, l) => acc + l.length + 1, 0);
      } else {
        currentChunkLines.push(line);
        currentChunkLength += line.length + 1;
      }
    }

    // Add remaining lines as the final chunk
    if (currentChunkLines.length > 0) {
      const chunkText = currentChunkLines.join('\n').trim();
      if (chunkText.length > 0) {
        chunks.push({
          id: `chunk_${chunkIndex}`,
          chunkIndex,
          text: chunkText,
          section: currentSection,
          charCount: chunkText.length,
        });
      }
    }

    return chunks;
  }
}
