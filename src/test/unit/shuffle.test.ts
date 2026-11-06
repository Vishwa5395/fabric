import { describe, it, expect } from 'vitest';
import { pickNext, ShuffleBag } from '../../utils/shuffle';

describe('Shuffle utilities', () => {
  it('pickNext never returns the same item twice in a row when pool > 1', () => {
    const items = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' }
    ];

    let lastId = '1';
    for (let i = 0; i < 50; i++) {
      const next = pickNext(items, lastId);
      expect(next.id).not.toBe(lastId);
      lastId = next.id;
    }
  });

  it('pickNext works when pool has 1 item', () => {
    const items = [{ id: 'solo', name: 'Solo' }];
    const next = pickNext(items, 'solo');
    expect(next.id).toBe('solo');
  });

  it('ShuffleBag returns every item once before repeating', () => {
    const items = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'c', name: 'C' },
      { id: 'd', name: 'D' }
    ];

    const bag = new ShuffleBag(items);
    const firstRound = new Set<string>();
    for (let i = 0; i < 4; i++) {
      firstRound.add(bag.next().id);
    }
    expect(firstRound.size).toBe(4);

    const secondRound = new Set<string>();
    for (let i = 0; i < 4; i++) {
      secondRound.add(bag.next().id);
    }
    expect(secondRound.size).toBe(4);
  });
});

