import { RagService } from '../services/ragService.js';

// Pre-defined test questions list for rapid evaluation
const SAMPLE_TEST_QUESTIONS = [
  {
    id: 1,
    category: 'Working Hours',
    question: 'What are the core collaboration hours when employees must be online?',
    inDocument: true,
  },
  {
    id: 2,
    category: 'Vacation & PTO',
    question: 'How many days of Paid Time Off (PTO) do full-time employees receive annually, and how many can rollover?',
    inDocument: true,
  },
  {
    id: 3,
    category: 'Sick Leave',
    question: 'When is a physician note or medical certificate required for sick leave?',
    inDocument: true,
  },
  {
    id: 4,
    category: 'Remote Work',
    question: 'What is the financial assistance provided for remote work setup and internet?',
    inDocument: true,
  },
  {
    id: 5,
    category: 'Expense Reimbursement',
    question: 'What is the daily travel meal allowance limit, and is alcohol reimbursed?',
    inDocument: true,
  },
  {
    id: 6,
    category: 'Equipment',
    question: 'What is the deadline for returning company equipment after resignation or termination?',
    inDocument: true,
  },
  {
    id: 7,
    category: 'Equipment',
    question: 'How often are primary work laptops refreshed or upgraded?',
    inDocument: true,
  },
  {
    id: 8,
    category: 'Sick Leave',
    question: 'By what time must an employee notify their supervisor if taking an unplanned sick day?',
    inDocument: true,
  },
  {
    id: 9,
    category: 'Expense Reimbursement',
    question: 'What is the mileage reimbursement rate for personal vehicle travel?',
    inDocument: true,
  },
  {
    id: 10,
    category: 'Sick Leave',
    question: 'Can employees take mental health recharge days under the sick leave policy?',
    inDocument: true,
  },
  {
    id: 11,
    category: 'Out of Document',
    question: 'What is the company 401(k) matching percentage and stock option vesting schedule?',
    inDocument: false,
  },
  {
    id: 12,
    category: 'Out of Document',
    question: 'What is the company dress code policy for casual Fridays?',
    inDocument: false,
  },
];

export class ChatController {
  /**
   * Handle user Q&A request through the RAG pipeline
   */
  static async askQuestion(req, res, next) {
    try {
      const { question, documentId } = req.body;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Empty question provided. Please enter a question about your document.',
        });
      }

      const ragService = new RagService();
      const result = await ragService.answerQuestion(question, documentId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pre-built sample test questions
   */
  static getSampleQuestions(req, res) {
    return res.status(200).json({
      success: true,
      questions: SAMPLE_TEST_QUESTIONS,
    });
  }
}
