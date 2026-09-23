import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

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
