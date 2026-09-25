import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import AgentReview from '../models/AgentReview';
import { analyzeSentiment } from '../services/sentiment.service';
import { createReviewSchema } from '../validations/review.validation';
import { ZodError } from 'zod';

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { agentId } = req.params;
    const validatedData = createReviewSchema.parse(req.body);

    // 1. Guard against self-reviews
    if (agentId === req.user.id) {
      res.status(400).json({
        success: false,
        message: 'Agents cannot review their own profile.',
      });
      return;
    }

    // 2. Verify agent exists in PostgreSQL relational database
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: { id: true, name: true, role: true },
    });

    if (!agent || agent.role !== Role.AGENT) {
      res.status(404).json({
        success: false,
        message: 'Licensed agent not found.',
      });
      return;
    }

    // 3. Fetch buyer name from PostgreSQL for denormalization
    const reviewer = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true },
    });

    // 4. Perform Natural Language Sentiment Analysis on review text
    const sentiment = analyzeSentiment(validatedData.reviewText);

    // 5. Persist Document in MongoDB
    const review = await AgentReview.create({
      agentId,
      userId: req.user.id,
      userName: reviewer?.name || 'Verified Buyer',
      rating: validatedData.rating,
      reviewText: validatedData.reviewText,
      sentimentScore: sentiment.score,
      sentimentLabel: sentiment.label,
    });

    res.status(201).json({
      success: true,
      message: 'Agent review submitted successfully.',
      data: { review },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    console.error('Error creating agent review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit agent review.',
    });
  }
};

export const getAgentReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agentId } = req.params;

    // Fetch reviews from MongoDB sorted by newest first
    const reviews = await AgentReview.find({ agentId })
      .sort({ createdAt: -1 })
      .lean();

    if (reviews.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          reviews: [],
          stats: {
            totalReviews: 0,
            averageRating: 0,
            averageSentiment: 0,
            positivePercentage: 0,
            breakdown: { positive: 0, neutral: 0, negative: 0 },
          },
        },
      });
      return;
    }

    // Calculate aggregated review and sentiment statistics
    const total = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const totalSentiment = reviews.reduce((sum, r) => sum + r.sentimentScore, 0);
    const positiveCount = reviews.filter((r) => r.sentimentLabel === 'POSITIVE').length;
    const neutralCount = reviews.filter((r) => r.sentimentLabel === 'NEUTRAL').length;
    const negativeCount = reviews.filter((r) => r.sentimentLabel === 'NEGATIVE').length;

    const stats = {
      totalReviews: total,
      averageRating: parseFloat((totalRating / total).toFixed(1)),
      averageSentiment: parseFloat((totalSentiment / total).toFixed(2)),
      positivePercentage: Math.round((positiveCount / total) * 100),
      breakdown: {
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
      },
    };

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching agent reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agent reviews.',
    });
  }
};
