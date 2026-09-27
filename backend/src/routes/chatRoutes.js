import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';

const router = Router();

router.post('/ask', ChatController.askQuestion);
router.get('/sample-questions', ChatController.getSampleQuestions);

export default router;
