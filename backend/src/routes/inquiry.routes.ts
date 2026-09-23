import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createInquiry,
  getMyInquiries,
  getAgentInquiries,
  updateInquiryStatus,
} from '../controllers/inquiry.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createInquiry);
router.get('/my-inquiries', getMyInquiries);
router.get('/agent/received', requireRole(Role.AGENT), getAgentInquiries);
router.patch('/:id/status', requireRole(Role.AGENT), updateInquiryStatus);

export default router;
