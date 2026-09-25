import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentReview extends Document {
  agentId: string;
  userId: string;
  userName: string;
  rating: number;
  reviewText: string;
  sentimentScore: number;
  sentimentLabel: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  createdAt: Date;
}

const AgentReviewSchema = new Schema<IAgentReview>(
  {
    agentId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    sentimentScore: {
      type: Number,
      required: true,
      min: -1,
      max: 1,
    },
    sentimentLabel: {
      type: String,
      enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'agent_reviews',
  }
);

// Compound index: fetch an agent's reviews sorted by newest first
AgentReviewSchema.index({ agentId: 1, createdAt: -1 });

export const AgentReview =
  mongoose.models.AgentReview ||
  mongoose.model<IAgentReview>('AgentReview', AgentReviewSchema);

export default AgentReview;
