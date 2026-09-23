import { Router } from 'express';
import {
  toggleSavedProperty,
  getSavedProperties,
  checkIsSaved,
} from '../controllers/savedProperty.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSavedProperties);
router.get('/check/:propertyId', checkIsSaved);
router.post('/:propertyId', toggleSavedProperty);

export default router;
