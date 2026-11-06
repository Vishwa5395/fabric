import { Trait, ScenarioOption } from '../data/gameScenarios';

export interface CourtResult {
  score: number;
  title: string;
  summary: string;
  traitCounts: Record<Trait, number>;
}

export function calculateCourtTitle(selectedOptions: ScenarioOption[]): CourtResult {
  let score = 0;
  const traitCounts: Record<Trait, number> = {
    CHAOS: 0,
    OVERTHINK: 0,
    DETECTIVE: 0
  };

  for (const opt of selectedOptions) {
    score += opt.intensity;
    traitCounts[opt.trait] = (traitCounts[opt.trait] || 0) + 1;
  }

  let title = '';
  let summary = '';

  // Rule 1: Each trait picked >= 2 times
  if (traitCounts.CHAOS >= 2 && traitCounts.OVERTHINK >= 2 && traitCounts.DETECTIVE >= 2) {
    title = 'Certified Meme Lawyer';
    summary = 'Aapne chaos, overthinking aur investigation mein perfect balance banaya hai. Kanoon aapke saamne sar jhukata hai!';
  }
  // Rule 2: A trait picked >= 4 times
  else if (traitCounts.CHAOS >= 4) {
    title = 'Supreme Court of OMFoooooo';
    summary = 'Aapki adaalat mein bas dharrate katte hain! Logic gaya tel lene, entertainment number 1 hai.';
  } else if (traitCounts.OVERTHINK >= 4) {
    title = 'Professional Overthinker';
    summary = 'Aapne itna gehra socha ki case solve hone ke baad bhi dimaag mein appeals chal rahi hain.';
  } else if (traitCounts.DETECTIVE >= 4) {
    title = 'Chief Investigator: Dora\'s Mother';
    summary = 'Aapki teekhi nigahein aur shaq karne ki power CBI se 10x aage hai. Papa ji darr rahe hain!';
  }
  // Rule 3: Fallback
  else {
    title = 'Honourable Member of the Nonsense Department';
    summary = 'Aapka faisla anokha tha. Adalat aapko official nonsense medal pradan karti hai.';
  }

  return {
    score,
    title,
    summary,
    traitCounts
  };
}

