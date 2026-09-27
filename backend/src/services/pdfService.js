import { extractText } from 'unpdf';
import pdfParse from 'pdf-parse';

/**
 * Robust Service to parse, extract, and validate PDF files.
 * Uses unpdf as primary parser with pdf-parse as an automatic fallback
 * to support all types of PDFs (CVs, resumes, handbooks, reports, invoices).
 */
export class PdfService {
  /**
   * Validate buffer is a genuine PDF by checking magic header `%PDF-`
   * @param {Buffer|Uint8Array} buffer 
   * @returns {boolean}
   */
  static isValidPdfBuffer(buffer) {
    if (!buffer || buffer.length < 5) return false;
    const header = Buffer.isBuffer(buffer) 
      ? buffer.subarray(0, 5).toString('ascii') 
      : String.fromCharCode(...buffer.slice(0, 5));
    return header.startsWith('%PDF-');
  }

  /**
   * Extract plain text and metadata from PDF buffer
   * @param {Buffer|Uint8Array} buffer 
   * @param {string} originalName 
   * @returns {Promise<{text: string, numPages: number, wordCount: number, fileName: string}>}
   */
  static async extractText(buffer, originalName = 'document.pdf') {
    if (!this.isValidPdfBuffer(buffer)) {
      throw new Error('Invalid PDF format. The file is corrupted or not a valid PDF document.');
    }

    let extractedText = '';
    let pageCount = 1;

    // Method 1: unpdf with a dedicated, cleanly allocated Uint8Array to avoid Node buffer transfer issues
    try {
      const cleanUint8 = new Uint8Array(buffer.byteLength);
      cleanUint8.set(buffer);
      const result = await extractText(cleanUint8, { mergePages: false });
      
      if (result) {
        pageCount = result.totalPages || 1;
        if (Array.isArray(result.text)) {
          extractedText = result.text.filter(Boolean).join('\n\n');
        } else if (typeof result.text === 'string') {
          extractedText = result.text;
        }
      }
    } catch (unpdfErr) {
      console.warn(`Primary unpdf parser encountered an issue for ${originalName}:`, unpdfErr.message);
    }

    // Method 2: Fallback to pdf-parse if unpdf returned empty text or failed
    if (!extractedText || extractedText.trim().length < 10) {
      try {
        const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
        const parseResult = await pdfParse(nodeBuffer);
        if (parseResult && parseResult.text && parseResult.text.trim().length >= 10) {
          extractedText = parseResult.text;
          pageCount = parseResult.numpages || pageCount;
          console.log(`Fallback pdf-parse successfully extracted text for ${originalName}`);
        }
      } catch (pdfParseErr) {
        console.warn(`Fallback pdf-parse parser also encountered an issue for ${originalName}:`, pdfParseErr.message);
      }
    }

    const trimmed = (extractedText || '').trim();

    if (!trimmed || trimmed.length < 10) {
      throw new Error(
        'The uploaded PDF does not contain extractable text. Please ensure it is a text-based document (not a flattened or scanned image).'
      );
    }

    // Clean up excessive whitespace & line breaks
    const sanitizedText = trimmed
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n');

    const wordCount = sanitizedText.split(/\s+/).filter(Boolean).length;

    return {
      text: sanitizedText,
      numPages: pageCount,
      wordCount,
      fileName: originalName,
    };
  }
}
