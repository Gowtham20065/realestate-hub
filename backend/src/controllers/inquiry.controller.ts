import { Request, Response } from 'express';
import { InquiryStatus, InteractionType, Role } from '@prisma/client';
import prisma from '../lib/prisma';
import {
  createInquirySchema,
  updateInquiryStatusSchema,
} from '../validations/inquiry.validation';
import { logInteraction } from '../services/interaction.service';
import { ZodError } from 'zod';

export const createInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const validatedData = createInquirySchema.parse(req.body);

    // 1. Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    });

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property listing not found.',
      });
      return;
    }

    // 2. Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        userId: req.user.id,
        propertyId: validatedData.propertyId,
        message: validatedData.message,
        status: InquiryStatus.PENDING,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
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

    // 3. Log high-intent INQUIRY interaction for recommender
    logInteraction(validatedData.propertyId, InteractionType.INQUIRY, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully.',
      data: { inquiry },
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

    console.error('Error creating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry.',
    });
  }
};

export const getMyInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const inquiries = await prisma.inquiry.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            state: true,
            imageUrls: true,
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
      data: { inquiries },
    });
  } catch (error) {
    console.error('Error fetching my inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inquiries.',
    });
  }
};

export const getAgentInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const inquiries = await prisma.inquiry.findMany({
      where: {
        property: {
          agentId: req.user.id,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            state: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { inquiries },
    });
  } catch (error) {
    console.error('Error fetching agent inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agent inquiries.',
    });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const validatedData = updateInquiryStatusSchema.parse(req.body);

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            agentId: true,
          },
        },
      },
    });

    if (!inquiry) {
      res.status(404).json({
        success: false,
        message: 'Inquiry not found.',
      });
      return;
    }

    // Authorization: Only the agent managing this property can update status
    if (inquiry.property.agentId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not manage this property listing.',
      });
      return;
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        status: validatedData.status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${validatedData.status}.`,
      data: { inquiry: updatedInquiry },
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

    console.error('Error updating inquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status.',
    });
  }
};
