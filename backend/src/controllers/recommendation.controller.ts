import { Request, Response } from 'express';
import prisma from '../lib/prisma';

const RECOMMENDER_URL =
  process.env.RECOMMENDER_SERVICE_URL ||
  process.env.RECOMMENDER_URL ||
  'http://localhost:8000';

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 20);

  const endpoint = userId
    ? `${RECOMMENDER_URL}/recommendations/user/${userId}?limit=${limit}`
    : `${RECOMMENDER_URL}/recommendations/trending?limit=${limit}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const pyResponse = await fetch(endpoint, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (pyResponse.ok) {
      const data = await pyResponse.json();
      res.status(200).json({
        success: true,
        data,
      });
      return;
    }
  } catch (error) {
    console.warn(
      `Recommendation service unavailable at ${endpoint} (${error instanceof Error ? error.message : 'timeout'}). Falling back to database.`
    );
  }

  // Graceful degradation fallback: Fetch top available properties from database
  try {
    const fallbackProperties = await prisma.property.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        agent: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const recommendations = fallbackProperties.map((p) => ({
      property_id: p.id,
      score: 0.85,
      match_percentage: 85,
      reason: `Featured property in ${p.city}`,
      property: {
        id: p.id,
        title: p.title,
        price: Number(p.price),
        city: p.city,
        state: p.state,
        propertyType: p.propertyType,
        listingType: p.listingType,
        bedrooms: p.bedrooms,
        bathrooms: Number(p.bathrooms),
        sqft: p.sqft,
        images: p.imageUrls || [],
        status: p.status,
      },
    }));

    res.status(200).json({
      success: true,
      data: {
        user_id: userId || null,
        strategy: 'cold_start_fallback',
        total: recommendations.length,
        recommendations,
      },
    });
  } catch (dbError) {
    console.error('Error fetching fallback recommendations:', dbError);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recommendations.',
    });
  }
};

export const getSimilarProperties = async (req: Request, res: Response): Promise<void> => {
  const { propertyId } = req.params;
  const limit = Math.min(Math.max(Number(req.query.limit) || 4, 1), 12);

  const endpoint = `${RECOMMENDER_URL}/recommendations/property/${propertyId}?limit=${limit}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const pyResponse = await fetch(endpoint, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (pyResponse.ok) {
      const data = await pyResponse.json();
      res.status(200).json({
        success: true,
        data,
      });
      return;
    }
  } catch (error) {
    console.warn(
      `Recommendation service unavailable for similar properties (${error instanceof Error ? error.message : 'timeout'}). Falling back to database.`
    );
  }

  // Graceful degradation fallback: Find properties in same city or property type
  try {
    const target = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!target) {
      res.status(404).json({
        success: false,
        message: 'Property not found',
      });
      return;
    }

    const similar = await prisma.property.findMany({
      where: {
        id: { not: propertyId },
        status: 'AVAILABLE',
        OR: [
          { city: { equals: target.city, mode: 'insensitive' } },
          { propertyType: target.propertyType },
        ],
      },
      take: limit,
      include: {
        agent: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const fallbackRecommendations = similar.map((p) => ({
      property_id: p.id,
      score: 0.8,
      match_percentage: 80,
      reason: `Similar style in ${p.city}`,
      property: {
        id: p.id,
        title: p.title,
        price: Number(p.price),
        city: p.city,
        state: p.state,
        propertyType: p.propertyType,
        listingType: p.listingType,
        bedrooms: p.bedrooms,
        bathrooms: Number(p.bathrooms),
        sqft: p.sqft,
        images: p.imageUrls || [],
        status: p.status,
      },
    }));

    res.status(200).json({
      success: true,
      data: fallbackRecommendations,
    });
  } catch (dbError) {
    console.error('Error fetching fallback similar properties:', dbError);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve similar properties.',
    });
  }
};

export const recalculateRecommendations = async (_req: Request, res: Response): Promise<void> => {
  const endpoint = `${RECOMMENDER_URL}/recalculate`;

  try {
    const pyResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (pyResponse.ok) {
      const data = await pyResponse.json();
      res.status(200).json({
        success: true,
        data,
      });
      return;
    }

    res.status(pyResponse.status).json({
      success: false,
      message: 'Failed to trigger recommendation recalculation.',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Recommendation microservice is currently unreachable.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
