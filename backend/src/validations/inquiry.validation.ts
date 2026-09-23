import { z } from 'zod';
import { InquiryStatus } from '@prisma/client';

export const createInquirySchema = z.object({
  propertyId: z
    .string({ required_error: 'Property ID is required' })
    .uuid('Property ID must be a valid UUID'),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),
});

export const updateInquiryStatusSchema = z.object({
  status: z.nativeEnum(InquiryStatus, {
    errorMap: () => ({ message: 'Status must be PENDING, CONTACTED, or RESOLVED' }),
  }),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
