import { ACHIEVEMENTS, AchievementDef } from '../data/achievements';
import { getKV, setKV } from './storage';
import { audioManager } from './audioManager';

export interface AchievementState {
  unlocked: boolean;
  unlockedAt?: string;
  currentCount?: number;
}

export type UnlockListener = (achievement: AchievementDef) => void;

class AchievementEngine {
  private listeners: Set<UnlockListener> = new Set();

  public onUnlock(listener: UnlockListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getAchievementStates(): Promise<Record<string, AchievementState>> {
    const states: Record<string, AchievementState> = {};
    for (const def of ACHIEVEMENTS) {
      const state = await getKV<AchievementState>(`ach:${def.id}`, { unlocked: false });
      if (def.isCounter) {
        const count = await getKV<number>(`cnt:${def.event}`, 0);
        state.currentCount = count;
      }
      states[def.id] = state;
    }
    return states;
  }

  public async emit(eventName: string): Promise<void> {
    // 1. If this event has counters, increment them
    const counterKey = `cnt:${eventName}`;
    const prevCount = await getKV<number>(counterKey, 0);
    const newCount = prevCount + 1;
    await setKV<number>(counterKey, newCount);

    // 2. Check all achievements matching this event
    const matching = ACHIEVEMENTS.filter(a => a.event === eventName);
    for (const def of matching) {
      const stateKey = `ach:${def.id}`;
      const state = await getKV<AchievementState>(stateKey, { unlocked: false });

      if (state.unlocked) {
        // Idempotent: already unlocked, do nothing
        continue;
      }

      let shouldUnlock = false;
      if (def.isCounter && def.targetCount) {
        if (newCount >= def.targetCount) {
          shouldUnlock = true;
        }
      } else {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        const newState: AchievementState = {
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          currentCount: newCount
        };
        await setKV<AchievementState>(stateKey, newState);

        // Sound effect
        audioManager.playAchievementSound();

        // Notify listeners
        for (const l of this.listeners) {
          l(def);
        }
      }
    }
  }

  public async isUnlocked(id: string): Promise<boolean> {
    const state = await getKV<AchievementState>(`ach:${id}`, { unlocked: false });
    return state.unlocked;
  }
}

export const achievementEngine = new AchievementEngine();

