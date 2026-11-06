/**
 * Picks the next item from a pool, guaranteeing it's never the same item twice in a row
 * if the pool has more than 1 item.
 */
export function pickNext<T extends { id: string }>(pool: T[], lastId?: string): T {
  if (pool.length === 0) {
    throw new Error('Pool cannot be empty');
  }
  if (pool.length === 1) {
    return pool[0];
  }
  const filtered = lastId ? pool.filter(item => item.id !== lastId) : pool;
  const candidatePool = filtered.length > 0 ? filtered : pool;
  const index = Math.floor(Math.random() * candidatePool.length);
  return candidatePool[index];
}

/**
 * ShuffleBag guarantees every item in the pool is picked once in random order
 * before any item repeats.
 */
export class ShuffleBag<T extends { id: string }> {
  private pool: T[];
  private remaining: T[];

  constructor(items: T[]) {
    this.pool = [...items];
    this.remaining = [];
  }

  next(): T {
    if (this.remaining.length === 0) {
      this.remaining = [...this.pool];
      // Fisher-Yates shuffle
      for (let i = this.remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.remaining[i], this.remaining[j]] = [this.remaining[j], this.remaining[i]];
      }
    }
    return this.remaining.pop()!;
  }

  reset(): void {
    this.remaining = [];
  }
}

