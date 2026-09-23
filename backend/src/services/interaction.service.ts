import { InteractionType } from '@prisma/client';
import prisma from '../lib/prisma';

export const logInteraction = async (
  propertyId: string,
  actionType: InteractionType,
  userId?: string
): Promise<void> => {
  // Fire-and-forget non-blocking logging
  setImmediate(async () => {
    try {
      await prisma.userInteraction.create({
        data: {
          propertyId,
          actionType,
          userId: userId || null,
        },
      });
    } catch (error) {
      console.error(`[InteractionService] Failed to log ${actionType} interaction for property ${propertyId}:`, error);
    }
  });
};
