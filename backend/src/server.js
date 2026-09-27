import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import documentRoutes from './routes/documentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow frontend during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const hasApiKey = Boolean(config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here');
  res.status(200).json({
    status: 'healthy',
    service: 'SmartDocs AI Backend',
    version: '1.0.0',
    geminiConfigured: hasApiKey,
    models: {
      llm: config.geminiModel,
      embeddings: config.embeddingModel,
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error Handler Caught:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });
});

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log('='.repeat(55));
  console.log(`🚀 SmartDocs AI Backend Server running on port ${PORT}`);
  console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Gemini API Key configured: ${Boolean(config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here')}`);
  console.log('='.repeat(55));
});

export default app;
