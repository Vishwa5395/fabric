import { describe, it, expect } from 'vitest';
import truthQuestions from '../../data/truth-questions.json';
import dareChallenges from '../../data/dare-challenges.json';

describe('Truth or Dare JSON Datasets', () => {
  it('loads at least 40 truth questions with unique IDs and no categories', () => {
    expect(Array.isArray(truthQuestions)).toBe(true);
    expect(truthQuestions.length).toBeGreaterThanOrEqual(40);

    const ids = new Set<string>();
    truthQuestions.forEach((q: any) => {
      expect(q.id).toBeDefined();
      expect(typeof q.id).toBe('string');
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);

      expect(typeof q.prompt).toBe('string');
      expect(q.prompt.trim().length).toBeGreaterThan(5);

      // Verify no categories exist
      expect(q.category).toBeUndefined();
      expect(q.categories).toBeUndefined();
      expect(q.topic).toBeUndefined();
    });
  });

  it('loads at least 40 dare challenges with unique IDs, valid evidenceType, and no categories', () => {
    expect(Array.isArray(dareChallenges)).toBe(true);
    expect(dareChallenges.length).toBeGreaterThanOrEqual(40);

    const ids = new Set<string>();
    const allowedEvidence = ['none', 'audio', 'video'];

    dareChallenges.forEach((d: any) => {
      expect(d.id).toBeDefined();
      expect(typeof d.id).toBe('string');
      expect(ids.has(d.id)).toBe(false);
      ids.add(d.id);

      expect(typeof d.prompt).toBe('string');
      expect(d.prompt.trim().length).toBeGreaterThan(5);

      expect(allowedEvidence).toContain(d.evidenceType);
      expect(typeof d.evidenceRequired).toBe('boolean');

      if (d.evidenceType === 'none') {
        expect(d.evidenceRequired).toBe(false);
        expect(d.maxDurationSeconds).toBeNull();
      } else {
        expect(typeof d.maxDurationSeconds).toBe('number');
        expect(d.maxDurationSeconds).toBeGreaterThan(0);
      }

      // Verify no categories exist
      expect(d.category).toBeUndefined();
      expect(d.categories).toBeUndefined();
      expect(d.topic).toBeUndefined();
    });
  });
});

