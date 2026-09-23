import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import {
  propertyQuerySchema,
  createPropertySchema,
  updatePropertySchema,
} from '../validations/property.validation';
import { ZodError } from 'zod';

export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = propertyQuerySchema.parse(req.query);

    const where: Prisma.PropertyWhereInput = {};

    // 1. City / State filters (case-insensitive)
    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }
    if (query.state) {
      where.state = { equals: query.state, mode: 'insensitive' };
    }

    // 2. Property & Listing types
    if (query.propertyType) {
      where.propertyType = { equals: query.propertyType, mode: 'insensitive' };
    }
    if (query.listingType) {
      where.listingType = query.listingType;
    }
    if (query.status) {
      where.status = query.status;
    }

    // 3. Price range
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    // 4. Bedroom & Bathroom minimums
    if (query.bedrooms !== undefined) {
      where.bedrooms = { gte: query.bedrooms };
    }
    if (query.bathrooms !== undefined) {
      where.bathrooms = { gte: query.bathrooms };
    }

    // 5. Keyword search in title, description, address, city
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // 6. Sorting
    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (query.sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (query.sortBy === 'sqft_desc') {
      orderBy = { sqft: 'desc' };
    }

    // 7. Pagination calculations
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    // Execute count and query concurrently
    const [total, properties] = await prisma.$transaction([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    res.status(200).json({
      success: true,
      data: {
        properties,
        pagination: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages,
          hasNextPage: query.page < totalPages,
          hasPrevPage: query.page > 1,
        },
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.errors.map((e) => ({
          param: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve property listings.',
    });
  }
};

export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property listing not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { property },
    });
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve property details.',
    });
  }
};

export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const validatedData = createPropertySchema.parse(req.body);

    const property = await prisma.property.create({
      data: {
        ...validatedData,
        agentId: req.user.id,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      data: { property },
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

    console.error('Error creating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property listing.',
    });
  }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
      return;
    }

    // Authorization: Ownership check
    if (existingProperty.agentId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to modify this listing.',
      });
      return;
    }

    const validatedData = updatePropertySchema.parse(req.body);

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: validatedData,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully.',
      data: { property: updatedProperty },
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

    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property listing.',
    });
  }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
      return;
    }

    // Authorization: Ownership check
    if (existingProperty.agentId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this listing.',
      });
      return;
    }

    await prisma.property.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property listing.',
    });
  }
};

export const getAgentProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const properties = await prisma.property.findMany({
      where: { agentId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { properties },
    });
  } catch (error) {
    console.error('Error fetching agent properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agent property listings.',
    });
  }
};
