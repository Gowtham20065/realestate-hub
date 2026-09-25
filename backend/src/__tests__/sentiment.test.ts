import { analyzeSentiment } from '../services/sentiment.service';

describe('Lexical Sentiment Analysis Engine', () => {
  it('correctly classifies a highly positive review', () => {
    const text = 'Gowtham was an exceptional agent! Very responsive, professional, and knowledgeable.';
    const result = analyzeSentiment(text);

    expect(result.score).toBeGreaterThan(0.2);
    expect(result.label).toBe('POSITIVE');
  });

  it('correctly classifies a negative review', () => {
    const text = 'Terrible communication, unpunctual, and extremely rude during the home tour.';
    const result = analyzeSentiment(text);

    expect(result.score).toBeLessThan(-0.2);
    expect(result.label).toBe('NEGATIVE');
  });

  it('correctly classifies a neutral statement', () => {
    const text = 'We toured the home at 3pm on Tuesday afternoon.';
    const result = analyzeSentiment(text);

    expect(result.score).toBeGreaterThanOrEqual(-0.1);
    expect(result.score).toBeLessThanOrEqual(0.1);
    expect(result.label).toBe('NEUTRAL');
  });

  it('handles negation correctly', () => {
    const negativeNegation = 'The agent was not helpful and not responsive.';
    const result = analyzeSentiment(negativeNegation);

    expect(result.score).toBeLessThan(0);
    expect(result.label).toBe('NEGATIVE');
  });

  it('handles empty or blank input gracefully without throwing errors', () => {
    const result = analyzeSentiment('   ');
    expect(result.score).toBe(0);
    expect(result.label).toBe('NEUTRAL');
  });
});
