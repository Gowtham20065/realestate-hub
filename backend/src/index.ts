import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import savedPropertyRoutes from './routes/savedProperty.routes';
import inquiryRoutes from './routes/inquiry.routes';
import interactionRoutes from './routes/interaction.routes';
import reviewRoutes from './routes/review.routes';
import recommendationRoutes from './routes/recommendation.routes';
import { connectMongo } from './lib/mongo';

dotenv.config();

// Establish MongoDB connection
connectMongo();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/saved-properties', savedPropertyRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    const propertyCount = await prisma.property.count();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats: {
        users: userCount,
        properties: propertyCount,
      },
    });
  } catch (error) {
    console.error('Health check database query error:', error);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 RealEstateHub Backend API running on port ${PORT}`);
    console.log(`📡 Healthcheck available at http://localhost:${PORT}/api/health`);
  });
}

export default app;
