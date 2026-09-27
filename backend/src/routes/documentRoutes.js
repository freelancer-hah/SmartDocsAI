import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/documentController.js';
import { config } from '../config.js';

const router = Router();

// Configure multer memory storage with file size limit & filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed.'));
    }
  },
});

// Middleware wrapper for multer to catch and format file upload errors cleanly
const uploadSinglePdf = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: `File exceeds the maximum limit of ${config.maxFileSize / (1024 * 1024)}MB.`,
        });
      }
      return res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Invalid file. Only PDF documents are allowed.',
      });
    }
    next();
  });
};

// Routes
router.post('/upload', uploadSinglePdf, DocumentController.uploadDocument);
router.get('/active', DocumentController.getActiveDocument);
router.post('/sample', DocumentController.loadSamplePolicy);
router.delete('/clear', DocumentController.clearDocument);

export default router;
