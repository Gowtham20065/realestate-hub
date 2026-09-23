import { Router } from 'express';
import { recordInteraction, getInteractionFeed } from '../controllers/interaction.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', optionalAuth, recordInteraction);
router.get('/export', getInteractionFeed);

export default router;
