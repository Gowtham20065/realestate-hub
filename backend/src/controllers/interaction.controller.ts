import { Request, Response } from 'express';
import { InteractionType } from '@prisma/client';
import prisma from '../lib/prisma';
import { z } from 'zod';

const recordInteractionSchema = z.object({
  propertyId: z.string().uuid('Property ID must be a valid UUID'),
  actionType: z.nativeEnum(InteractionType),
});

export const recordInteraction = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = recordInteractionSchema.parse(req.body);

    const interaction = await prisma.userInteraction.create({
      data: {
        propertyId: validatedData.propertyId,
        actionType: validatedData.actionType,
        userId: req.user?.id || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Interaction recorded.',
      data: { interaction },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
      return;
    }

    console.error('Error recording interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record interaction.',
    });
  }
};

export const getInteractionFeed = async (_req: Request, res: Response): Promise<void> => {
  try {
    const interactions = await prisma.userInteraction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5000,
      select: {
        id: true,
        userId: true,
        propertyId: true,
        actionType: true,
        createdAt: true,
        property: {
          select: {
            title: true,
            price: true,
            city: true,
            propertyType: true,
            bedrooms: true,
            bathrooms: true,
            sqft: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      total: interactions.length,
      data: { interactions },
    });
  } catch (error) {
    console.error('Error exporting interactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve interaction feed.',
    });
  }
};
