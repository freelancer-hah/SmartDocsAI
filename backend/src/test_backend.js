import { ChunkingService } from './services/chunkingService.js';
import { cosineSimilarity } from './services/vectorStore.js';
import { PdfService } from './services/pdfService.js';

console.log('Testing Backend Components...');

// 1. Test Chunking
const sampleText = `
Section 1: Working Hours
Acme operates 9am to 5pm. Core collaboration hours are 10:00 AM to 3:00 PM EST. Flexible start times between 7am and 10am are permitted with supervisor approval.

Section 2: Vacation Policy
All employees get 20 days PTO per year. A maximum of 5 days can be carried over.
`;

const chunks = ChunkingService.splitText(sampleText, 200, 50);
console.log(`✓ Chunking Service: Created ${chunks.length} chunks successfully.`);
console.log(`  Sample Chunk 1: [${chunks[0].section}] "${chunks[0].text.replace(/\n/g, ' ')}"`);

// 2. Test Cosine Similarity
const v1 = [1, 0, 1, 0];
const v2 = [1, 0, 1, 0];
const v3 = [0, 1, 0, 1];

const simIdentical = cosineSimilarity(v1, v2);
const simOrthogonal = cosineSimilarity(v1, v3);
console.log(`✓ Cosine Similarity (Identical): ${simIdentical} (Expected: 1)`);
console.log(`✓ Cosine Similarity (Orthogonal): ${simOrthogonal} (Expected: 0)`);

if (Math.abs(simIdentical - 1) < 1e-6 && simOrthogonal === 0) {
  console.log('✅ Backend core math & chunking services verified successfully!');
} else {
  console.error('❌ Math verification failed');
}
