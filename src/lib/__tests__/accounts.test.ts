import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/prisma', () => ({ prisma: {} }));
vi.mock('@clerk/nextjs/server', () => ({ currentUser: async () => null }));
import { mergeScores } from '../accounts';

describe('mergeScores (guest progress moving to a new account)', () => {
  it('takes the guest row when the account has none', () => {
    expect(mergeScores(null, { score: 120, plays: 3 }, false)).toEqual({ score: 120, plays: 3 });
  });
  it('keeps the higher score and adds plays', () => {
    expect(mergeScores({ score: 90, plays: 2 }, { score: 120, plays: 3 }, false)).toEqual({ score: 120, plays: 5 });
    expect(mergeScores({ score: 200, plays: 2 }, { score: 120, plays: 3 }, false)).toEqual({ score: 200, plays: 5 });
  });
  it('keeps the lower score for lower-is-better games (golf strokes)', () => {
    expect(mergeScores({ score: 31, plays: 1 }, { score: 27, plays: 1 }, true)).toEqual({ score: 27, plays: 2 });
  });
});
