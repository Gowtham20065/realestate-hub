import dotenv from 'dotenv';
dotenv.config();

import prisma from '../lib/prisma';
import { connectMongo, disconnectMongo } from '../lib/mongo';
import AgentReview from '../models/AgentReview';
import { analyzeSentiment } from '../services/sentiment.service';

async function seedReviews() {
  console.log('🍃 Connecting to MongoDB and PostgreSQL...');
  await connectMongo();

  // Find Agents
  const sarah = await prisma.user.findUnique({
    where: { email: 'sarah.agent@realestatehub.com' },
  });

  const david = await prisma.user.findUnique({
    where: { email: 'david.agent@realestatehub.com' },
  });

  const buyerAlex = await prisma.user.findUnique({
    where: { email: 'alex.buyer@realestatehub.com' },
  });

  const buyerEmily = await prisma.user.findUnique({
    where: { email: 'emily.buyer@realestatehub.com' },
  });

  if (!sarah || !david || !buyerAlex || !buyerEmily) {
    console.error('Users not found. Make sure PostgreSQL is seeded first.');
    process.exit(1);
  }

  // Clear existing reviews
  await AgentReview.deleteMany({});
  console.log('🧹 Cleaned existing agent reviews in MongoDB.');

  const sampleReviews = [
    {
      agentId: sarah.id,
      userId: buyerAlex.id,
      userName: buyerAlex.name,
      rating: 5,
      reviewText:
        'Sarah was absolutely exceptional! She helped us secure our Austin dream home and negotiated $30,000 off asking price. Super communicative, trustworthy, and knowledgeable.',
    },
    {
      agentId: sarah.id,
      userId: buyerEmily.id,
      userName: buyerEmily.name,
      rating: 5,
      reviewText:
        'Incredible experience working with Sarah. She arranged 6 private home viewings in a single weekend and gave honest advice about foundation and school districts.',
    },
    {
      agentId: sarah.id,
      userId: buyerAlex.id,
      userName: buyerAlex.name,
      rating: 4,
      reviewText:
        'Smooth closing process overall. Communication was a bit delayed over the holiday weekend, but otherwise very solid guidance throughout.',
    },
    {
      agentId: david.id,
      userId: buyerEmily.id,
      userName: buyerEmily.name,
      rating: 5,
      reviewText:
        'David is a true professional in the Seattle luxury market. His market valuation was spot-on and he made paperwork painless.',
    },
    {
      agentId: david.id,
      userId: buyerAlex.id,
      userName: buyerAlex.name,
      rating: 2,
      reviewText:
        'Felt rushed during our open house tour and had difficulty getting follow-up disclosure documents on time.',
    },
  ];

  for (const item of sampleReviews) {
    const sentiment = analyzeSentiment(item.reviewText);
    await AgentReview.create({
      ...item,
      sentimentScore: sentiment.score,
      sentimentLabel: sentiment.label,
    });
  }

  console.log(`✅ Seeded ${sampleReviews.length} agent reviews with NLP sentiment scoring in MongoDB.`);
  await disconnectMongo();
  await prisma.$disconnect();
}

seedReviews().catch((err) => {
  console.error('Seed reviews error:', err);
  process.exit(1);
});
