import { describe, it, expect } from 'vitest';
import { DeckManager } from '../../utils/truthOrDareDeck';
import { calculateTurnPoints } from '../../utils/truthOrDareScoring';

describe('DeckManager and Scoring Logic', () => {
  it('draws non-repeating cards within a session length', () => {
    const deck = new DeckManager();
    const drawnIds = new Set<string>();

    for (let i = 0; i < 20; i++) {
      const card = deck.drawTruth();
      expect(drawnIds.has(card.id)).toBe(false);
      drawnIds.add(card.id);
    }

    const drawnDares = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const dare = deck.drawDare();
      expect(drawnDares.has(dare.id)).toBe(false);
      drawnDares.add(dare.id);
    }
  });

  it('calculates points correctly according to strict game rules', () => {
    // Truth
    expect(calculateTurnPoints('truth', 'answered')).toBe(10);
    expect(calculateTurnPoints('truth', 'declined')).toBe(0);
    expect(calculateTurnPoints('truth', 'skipped')).toBe(0);

    // Dare without required evidence
    expect(calculateTurnPoints('dare', 'completed', { evidenceRequired: false, hasUploadedEvidence: false })).toBe(15);
    expect(calculateTurnPoints('dare', 'not_performed', { evidenceRequired: false, hasUploadedEvidence: false })).toBe(0);
    expect(calculateTurnPoints('dare', 'skipped', { evidenceRequired: false, hasUploadedEvidence: false })).toBe(0);

    // Dare with required evidence
    expect(calculateTurnPoints('dare', 'completed', { evidenceRequired: true, hasUploadedEvidence: true })).toBe(15);
    expect(calculateTurnPoints('dare', 'completed', { evidenceRequired: true, hasUploadedEvidence: false })).toBe(0);
    expect(calculateTurnPoints('dare', 'not_performed', { evidenceRequired: true, hasUploadedEvidence: true })).toBe(0);
  });
});

