import { Request, Response } from 'express';
import { InteractionType } from '@prisma/client';
import prisma from '../lib/prisma';
import { logInteraction } from '../services/interaction.service';

export const toggleSavedProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { propertyId } = req.params;

    // 1. Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
      return;
    }

    // 2. Check if already saved using compound unique constraint
    const existingSaved = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId,
        },
      },
    });

    if (existingSaved) {
      // Remove from saved listings
      await prisma.savedProperty.delete({
        where: { id: existingSaved.id },
      });

      res.status(200).json({
        success: true,
        isSaved: false,
        message: 'Property removed from saved listings.',
      });
      return;
    }

    // 3. Save property
    const newSaved = await prisma.savedProperty.create({
      data: {
        userId: req.user.id,
        propertyId,
      },
      include: {
        property: true,
      },
    });

    // 4. Record high-intent SAVE interaction for recommender
    logInteraction(propertyId, InteractionType.SAVE, req.user.id);

    res.status(201).json({
      success: true,
      isSaved: true,
      message: 'Property saved successfully.',
      data: { savedProperty: newSaved },
    });
  } catch (error) {
    console.error('Error toggling saved property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle saved property.',
    });
  }
};

export const getSavedProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const savedProperties = await prisma.savedProperty.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        savedProperties,
      },
    });
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved properties.',
    });
  }
};

export const checkIsSaved = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { propertyId } = req.params;

    const existing = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId,
        },
      },
    });

    res.status(200).json({
      success: true,
      isSaved: Boolean(existing),
    });
  } catch (error) {
    console.error('Error checking saved property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check saved status.',
    });
  }
};
