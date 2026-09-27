import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PdfService } from '../services/pdfService.js';
import { ChunkingService } from '../services/chunkingService.js';
import { EmbeddingService } from '../services/embeddingService.js';
import { globalVectorStore } from '../services/vectorStore.js';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DocumentController {
  /**
   * Upload and process a PDF document
   */
  static async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded. Please select and upload a valid PDF document.',
        });
      }

      const file = req.file;

      // Validate MIME type
      if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
        return res.status(400).json({
          success: false,
          error: 'Unsupported file type. Only PDF documents (.pdf) are supported.',
        });
      }

      // Validate size
      if (file.size > config.maxFileSize) {
        return res.status(400).json({
          success: false,
          error: `File size exceeds the maximum limit of ${config.maxFileSize / (1024 * 1024)}MB.`,
        });
      }

      console.log(`Processing uploaded PDF: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`);

      // Step 1: Extract Text & Metadata
      let parsedDoc;
      try {
        parsedDoc = await PdfService.extractText(file.buffer, file.originalname);
      } catch (pdfErr) {
        console.warn(`PDF Parsing error for ${file.originalname}:`, pdfErr.message);
        return res.status(400).json({
          success: false,
          error: pdfErr.message || 'Failed to extract text from PDF. Please ensure the document is not corrupted or an image-only scan.',
        });
      }

      // Step 2: Split text into semantic chunks
      const chunks = ChunkingService.splitText(parsedDoc.text);
      if (chunks.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Could not extract meaningful text chunks from this document.',
        });
      }

      // Step 3: Generate Embeddings using Gemini
      console.log(`Generating embeddings for ${chunks.length} chunks...`);
      const embeddingService = new EmbeddingService();
      const embeddedChunks = await embeddingService.generateBatchEmbeddings(chunks);

      // Step 4: Index into Vector Store
      const documentId = `doc_${Date.now()}`;
      const docMetadata = {
        id: documentId,
        fileName: file.originalname,
        fileSizeBytes: file.size,
        fileSizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
        numPages: parsedDoc.numPages,
        wordCount: parsedDoc.wordCount,
        chunkCount: embeddedChunks.length,
      };

      globalVectorStore.addDocument(documentId, docMetadata, embeddedChunks);

      console.log(`Successfully indexed document: ${file.originalname} with ${embeddedChunks.length} chunks.`);

      return res.status(200).json({
        success: true,
        message: 'PDF successfully uploaded, chunked, and vectorized with Google Gemini embeddings.',
        document: docMetadata,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get metadata about currently active document
   */
  static getActiveDocument(req, res) {
    const activeDoc = globalVectorStore.getActiveDocument();
    return res.status(200).json({
      success: true,
      document: activeDoc,
    });
  }

  /**
   * Load the built-in Acme Sample Policy Document directly
   */
  static async loadSamplePolicy(req, res, next) {
    try {
      const samplePdfPathPrimary = path.resolve(__dirname, '../../../sample_data/Acme_Global_Employee_Handbook_2026.pdf');
      const samplePdfPathFallback = path.resolve(__dirname, '../../sample_data/Acme_Global_Employee_Handbook_2026.pdf');
      const samplePdfPath = fs.existsSync(samplePdfPathPrimary) ? samplePdfPathPrimary : (fs.existsSync(samplePdfPathFallback) ? samplePdfPathFallback : null);

      let pdfBuffer;
      if (samplePdfPath && fs.existsSync(samplePdfPath)) {
        pdfBuffer = fs.readFileSync(samplePdfPath);
      } else {
        return res.status(404).json({
          success: false,
          error: 'Sample policy PDF file not found on server disk. Please generate it or upload a custom PDF.',
        });
      }

      const fileName = 'Acme_Global_Employee_Handbook_2026.pdf';
      const parsedDoc = await PdfService.extractText(pdfBuffer, fileName);
      const chunks = ChunkingService.splitText(parsedDoc.text);

      console.log(`Vectorizing sample policy (${chunks.length} chunks)...`);
      const embeddingService = new EmbeddingService();
      const embeddedChunks = await embeddingService.generateBatchEmbeddings(chunks);

      const documentId = `sample_acme_2026`;
      const docMetadata = {
        id: documentId,
        fileName,
        fileSizeBytes: pdfBuffer.length,
        fileSizeFormatted: `${(pdfBuffer.length / 1024).toFixed(1)} KB`,
        numPages: parsedDoc.numPages,
        wordCount: parsedDoc.wordCount,
        chunkCount: embeddedChunks.length,
        isSample: true,
      };

      globalVectorStore.addDocument(documentId, docMetadata, embeddedChunks);

      return res.status(200).json({
        success: true,
        message: 'Sample Acme Employee Handbook successfully loaded and indexed!',
        document: docMetadata,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear active document
   */
  static clearDocument(req, res) {
    globalVectorStore.clear();
    return res.status(200).json({
      success: true,
      message: 'Active document and index cleared successfully.',
    });
  }
}
