import Sentiment from 'sentiment';

export type SentimentLabel = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface SentimentAnalysisResult {
  score: number; // Normalized -1.0 to 1.0
  label: SentimentLabel;
  comparative: number;
  positiveWords: string[];
  negativeWords: string[];
}

const sentiment = new Sentiment();

export const analyzeSentiment = (text: string): SentimentAnalysisResult => {
  const result = sentiment.analyze(text);

  // Normalize comparative score (-5 to 5 raw) into clean -1.0 to 1.0 range
  let normalizedScore = result.comparative * 2.5;
  normalizedScore = Math.max(-1, Math.min(1, normalizedScore));
  const roundedScore = parseFloat(normalizedScore.toFixed(2));

  let label: SentimentLabel = 'NEUTRAL';
  if (roundedScore >= 0.15) {
    label = 'POSITIVE';
  } else if (roundedScore <= -0.15) {
    label = 'NEGATIVE';
  }

  return {
    score: roundedScore,
    label,
    comparative: parseFloat(result.comparative.toFixed(2)),
    positiveWords: result.positive,
    negativeWords: result.negative,
  };
};
