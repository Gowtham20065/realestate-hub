import { Router } from 'express';
import { createReview, getAgentReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public route to fetch agent reviews and sentiment metrics
router.get('/:agentId', getAgentReviews);

// Protected route to write an agent review (buyers)
router.post('/:agentId', authenticate, createReview);

export default router;
