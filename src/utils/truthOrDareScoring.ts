import { CardType, TurnActionStatus } from '../types/truthOrDare';

export function calculateTurnPoints(
  cardType: CardType,
  status: TurnActionStatus,
  dareConfig?: { evidenceRequired: boolean; hasUploadedEvidence: boolean }
): number {
  if (cardType === 'truth') {
    if (status === 'answered') return 10;
    return 0; // declined or skipped
  }

  // Dare
  if (status === 'completed') {
    if (dareConfig?.evidenceRequired && !dareConfig.hasUploadedEvidence) {
      return 0; // Evidence was required but not provided/verified
    }
    return 15;
  }

  return 0; // not_performed or skipped
}
