import { describe, it, expect, beforeEach } from 'vitest';
import { achievementEngine } from '../../services/achievements';
import { getDB } from '../../services/storage';

describe('Achievements Engine', () => {
  beforeEach(async () => {
    const db = await getDB();
    await db.clear('kv');
  });

  it('unlocks achievement on matching event', async () => {
    let unlockedId = '';
    const unsubscribe = achievementEngine.onUnlock((ach) => {
      unlockedId = ach.id;
    });

    await achievementEngine.emit('welcome_opened');
    expect(unlockedId).toBe('first_contact');

    const isUnlocked = await achievementEngine.isUnlocked('first_contact');
    expect(isUnlocked).toBe(true);

    unsubscribe();
  });

  it('is idempotent: does not re-trigger unlock toast if already unlocked', async () => {
    let callCount = 0;
    const unsubscribe = achievementEngine.onUnlock(() => {
      callCount++;
    });

    await achievementEngine.emit('welcome_opened');
    expect(callCount).toBe(1);

    // Second emit of same event
    await achievementEngine.emit('welcome_opened');
    expect(callCount).toBe(1); // Still 1

    unsubscribe();
  });

  it('unlocks meme enthusiast and music explorer achievements', async () => {
    let unlockedId = '';
    const unsubscribe = achievementEngine.onUnlock((ach) => {
      unlockedId = ach.id;
    });

    await achievementEngine.emit('meme_favourited');
    expect(unlockedId).toBe('meme_explorer');

    await achievementEngine.emit('music_played');
    expect(unlockedId).toBe('music_connoisseur');

    unsubscribe();
  });
});
