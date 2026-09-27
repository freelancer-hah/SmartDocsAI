import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PdfService } from './services/pdfService.js';
import { ChunkingService } from './services/chunkingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.resolve(__dirname, '../../sample_data/Acme_Global_Employee_Handbook_2026.pdf');
const buffer = fs.readFileSync(pdfPath);

console.log(`Reading test PDF from: ${pdfPath}`);
const result = await PdfService.extractText(buffer, 'Acme_Global_Employee_Handbook_2026.pdf');

console.log(`✓ Number of pages: ${result.numPages}`);
console.log(`✓ Total word count: ${result.wordCount}`);
console.log(`✓ Extracted text length: ${result.text.length} characters`);

const chunks = ChunkingService.splitText(result.text, 500, 100);
console.log(`✓ Chunks generated: ${chunks.length}`);
chunks.forEach((c, idx) => {
  console.log(`  [Chunk ${idx + 1}] (${c.charCount} chars) Section: "${c.section}"`);
});

console.log('✅ PDF extraction & chunking verified successfully!');
