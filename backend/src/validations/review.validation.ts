import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.coerce
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  reviewText: z
    .string({ required_error: 'Review text is required' })
    .trim()
    .min(10, 'Review must be at least 10 characters long')
    .max(2000, 'Review cannot exceed 2000 characters'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
