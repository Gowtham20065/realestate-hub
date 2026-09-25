import { Router } from 'express';
import {
  getRecommendations,
  getSimilarProperties,
  recalculateRecommendations,
} from '../controllers/recommendation.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getRecommendations);
router.get('/similar/:propertyId', getSimilarProperties);
router.post('/recalculate', recalculateRecommendations);

export default router;
