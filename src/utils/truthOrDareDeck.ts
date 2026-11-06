import truthQuestions from '../data/truth-questions.json';
import dareChallenges from '../data/dare-challenges.json';
import { TruthQuestion, DareChallenge, CardType } from '../types/truthOrDare';

export class DeckManager {
  private availableTruths: TruthQuestion[] = [];
  private availableDares: DareChallenge[] = [];
  private usedTruthIds: Set<string> = new Set();
  private usedDareIds: Set<string> = new Set();

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.usedTruthIds.clear();
    this.usedDareIds.clear();
    this.availableTruths = this.shuffle([...(truthQuestions as TruthQuestion[])]);
    this.availableDares = this.shuffle([...(dareChallenges as DareChallenge[])]);
  }

  private shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  public drawTruth(): TruthQuestion {
    if (this.availableTruths.length === 0) {
      // Re-seed from master without recently drawn ones if possible
      this.availableTruths = this.shuffle(
        (truthQuestions as TruthQuestion[]).filter(q => !this.usedTruthIds.has(q.id))
      );
      if (this.availableTruths.length === 0) {
        this.usedTruthIds.clear();
        this.availableTruths = this.shuffle([...(truthQuestions as TruthQuestion[])]);
      }
    }

    const drawn = this.availableTruths.pop()!;
    this.usedTruthIds.add(drawn.id);
    return drawn;
  }

  public drawDare(): DareChallenge {
    if (this.availableDares.length === 0) {
      this.availableDares = this.shuffle(
        (dareChallenges as DareChallenge[]).filter(d => !this.usedDareIds.has(d.id))
      );
      if (this.availableDares.length === 0) {
        this.usedDareIds.clear();
        this.availableDares = this.shuffle([...(dareChallenges as DareChallenge[])]);
      }
    }

    const drawn = this.availableDares.pop()!;
    this.usedDareIds.add(drawn.id);
    return drawn;
  }

  public drawCard(type: CardType): TruthQuestion | DareChallenge {
    return type === 'truth' ? this.drawTruth() : this.drawDare();
  }
}

