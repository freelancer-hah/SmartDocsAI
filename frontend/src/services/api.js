/**
 * API Client for SmartDocs AI Backend
 */

const API_BASE = '/api';

async function parseResponse(res, fallbackErrMsg) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || fallbackErrMsg };
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || fallbackErrMsg || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  /**
   * Check backend health and Gemini status
   */
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await parseResponse(res, 'Backend offline');
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  },

  /**
   * Upload a PDF file
   * @param {File} file 
   */
  async uploadPdf(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    return await parseResponse(res, 'Failed to upload document.');
  },

  /**
   * Load built-in Acme Sample Policy PDF
   */
  async loadSamplePolicy() {
    const res = await fetch(`${API_BASE}/documents/sample`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    return await parseResponse(res, 'Failed to load sample policy.');
  },

  /**
   * Get active document information
   */
  async getActiveDocument() {
    const res = await fetch(`${API_BASE}/documents/active`);
    return await parseResponse(res, 'Failed to get active document.');
  },

  /**
   * Clear active document
   */
  async clearDocument() {
    const res = await fetch(`${API_BASE}/documents/clear`, {
      method: 'DELETE',
    });
    return await parseResponse(res, 'Failed to clear document.');
  },

  /**
   * Ask question to RAG pipeline
   * @param {string} question 
   * @param {string} [documentId] 
   */
  async askQuestion(question, documentId) {
    const res = await fetch(`${API_BASE}/chat/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, documentId }),
    });

    return await parseResponse(res, 'Failed to get answer.');
  },

  /**
   * Get sample test questions list
   */
  async getSampleQuestions() {
    const res = await fetch(`${API_BASE}/chat/sample-questions`);
    const data = await parseResponse(res, 'Failed to get sample questions.');
    return data.questions || [];
  },
};
