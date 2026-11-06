import { describe, it, expect } from 'vitest';
import { calculateCourtTitle } from '../../utils/courtScoring';
import { ScenarioOption } from '../../data/gameScenarios';

describe('Meme Court Scoring Engine', () => {
  it('awards Certified Meme Lawyer when each trait is picked >= 2 times', () => {
    // 7 choices: 2 CHAOS, 2 OVERTHINK, 3 DETECTIVE
    const options: ScenarioOption[] = [
      { id: '1', label: 'opt1', trait: 'CHAOS', intensity: 2, verdict: '' },
      { id: '2', label: 'opt2', trait: 'CHAOS', intensity: 3, verdict: '' },
      { id: '3', label: 'opt3', trait: 'OVERTHINK', intensity: 1, verdict: '' },
      { id: '4', label: 'opt4', trait: 'OVERTHINK', intensity: 2, verdict: '' },
      { id: '5', label: 'opt5', trait: 'DETECTIVE', intensity: 2, verdict: '' },
      { id: '6', label: 'opt6', trait: 'DETECTIVE', intensity: 3, verdict: '' },
      { id: '7', label: 'opt7', trait: 'DETECTIVE', intensity: 1, verdict: '' }
    ];

    const result = calculateCourtTitle(options);
    expect(result.title).toBe('Certified Meme Lawyer');
    expect(result.score).toBe(2 + 3 + 1 + 2 + 2 + 3 + 1); // 14
  });

  it('awards Supreme Court of OMFoooooo when CHAOS is picked >= 4 times', () => {
    const options: ScenarioOption[] = [
      { id: '1', label: 'opt1', trait: 'CHAOS', intensity: 3, verdict: '' },
      { id: '2', label: 'opt2', trait: 'CHAOS', intensity: 3, verdict: '' },
      { id: '3', label: 'opt3', trait: 'CHAOS', intensity: 3, verdict: '' },
      { id: '4', label: 'opt4', trait: 'CHAOS', intensity: 3, verdict: '' },
      { id: '5', label: 'opt5', trait: 'OVERTHINK', intensity: 1, verdict: '' },
      { id: '6', label: 'opt6', trait: 'DETECTIVE', intensity: 1, verdict: '' },
      { id: '7', label: 'opt7', trait: 'OVERTHINK', intensity: 1, verdict: '' }
    ];

    const result = calculateCourtTitle(options);
    expect(result.title).toBe('Supreme Court of OMFoooooo');
  });

  it('awards Professional Overthinker when OVERTHINK is picked >= 4 times', () => {
    const options: ScenarioOption[] = [
      { id: '1', label: 'opt1', trait: 'OVERTHINK', intensity: 2, verdict: '' },
      { id: '2', label: 'opt2', trait: 'OVERTHINK', intensity: 2, verdict: '' },
      { id: '3', label: 'opt3', trait: 'OVERTHINK', intensity: 2, verdict: '' },
      { id: '4', label: 'opt4', trait: 'OVERTHINK', intensity: 2, verdict: '' },
      { id: '5', label: 'opt5', trait: 'CHAOS', intensity: 1, verdict: '' },
      { id: '6', label: 'opt6', trait: 'CHAOS', intensity: 1, verdict: '' },
      { id: '7', label: 'opt7', trait: 'DETECTIVE', intensity: 1, verdict: '' }
    ];

    const result = calculateCourtTitle(options);
    expect(result.title).toBe('Professional Overthinker');
  });

  it('awards Chief Investigator: Dora\'s Mother when DETECTIVE is picked >= 4 times', () => {
    const options: ScenarioOption[] = [
      { id: '1', label: 'opt1', trait: 'DETECTIVE', intensity: 3, verdict: '' },
      { id: '2', label: 'opt2', trait: 'DETECTIVE', intensity: 3, verdict: '' },
      { id: '3', label: 'opt3', trait: 'DETECTIVE', intensity: 3, verdict: '' },
      { id: '4', label: 'opt4', trait: 'DETECTIVE', intensity: 3, verdict: '' },
      { id: '5', label: 'opt5', trait: 'CHAOS', intensity: 1, verdict: '' },
      { id: '6', label: 'opt6', trait: 'OVERTHINK', intensity: 1, verdict: '' },
      { id: '7', label: 'opt7', trait: 'CHAOS', intensity: 1, verdict: '' }
    ];

    const result = calculateCourtTitle(options);
    expect(result.title).toBe('Chief Investigator: Dora\'s Mother');
  });

  it('awards Honourable Member of the Nonsense Department as fallback', () => {
    // 3 CHAOS, 3 OVERTHINK, 1 DETECTIVE (no trait >= 4, DETECTIVE is 1 so not all >= 2)
    const options: ScenarioOption[] = [
      { id: '1', label: 'opt1', trait: 'CHAOS', intensity: 1, verdict: '' },
      { id: '2', label: 'opt2', trait: 'CHAOS', intensity: 1, verdict: '' },
      { id: '3', label: 'opt3', trait: 'CHAOS', intensity: 1, verdict: '' },
      { id: '4', label: 'opt4', trait: 'OVERTHINK', intensity: 1, verdict: '' },
      { id: '5', label: 'opt5', trait: 'OVERTHINK', intensity: 1, verdict: '' },
      { id: '6', label: 'opt6', trait: 'OVERTHINK', intensity: 1, verdict: '' },
      { id: '7', label: 'opt7', trait: 'DETECTIVE', intensity: 1, verdict: '' }
    ];

    const result = calculateCourtTitle(options);
    expect(result.title).toBe('Honourable Member of the Nonsense Department');
    expect(result.score).toBe(7); // minimum possible score
  });

  it('calculates maximum possible score 21 correctly', () => {
    const options: ScenarioOption[] = Array.from({ length: 7 }, (_, i) => ({
      id: String(i),
      label: `opt${i}`,
      trait: 'CHAOS' as const,
      intensity: 3 as const,
      verdict: ''
    }));

    const result = calculateCourtTitle(options);
    expect(result.score).toBe(21);
    expect(result.title).toBe('Supreme Court of OMFoooooo');
  });
});

