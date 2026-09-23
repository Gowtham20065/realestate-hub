import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getAgentProperties,
} from '../controllers/property.controller';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getProperties);

// Agent specific listings (declared before /:id to prevent route shadowing)
router.get('/agent/me', authenticate, requireRole(Role.AGENT), getAgentProperties);

router.get('/:id', optionalAuth, getPropertyById);

// Agent write routes
router.post('/', authenticate, requireRole(Role.AGENT), createProperty);
router.put('/:id', authenticate, requireRole(Role.AGENT), updateProperty);
router.delete('/:id', authenticate, requireRole(Role.AGENT), deleteProperty);

export default router;
