export type GameMode = 'solo' | 'multiplayer';
export type SessionLength = 5 | 7 | 10;
export type CardType = 'truth' | 'dare';
export type EvidenceType = 'none' | 'audio' | 'video';

export interface TruthQuestion {
  id: string;
  prompt: string;
}

export interface DareChallenge {
  id: string;
  prompt: string;
  evidenceType: EvidenceType;
  evidenceRequired: boolean;
  maxDurationSeconds: number | null;
}

export type TurnActionStatus =
  | 'answered'
  | 'declined'
  | 'completed'
  | 'not_performed'
  | 'skipped';

export interface EvidenceItem {
  id: string;
  sessionId: string;
  roomId?: string;
  playerId: string;
  turnId: string;
  dareId: string;
  originalPrompt: string;
  evidenceType: 'audio' | 'video';
  storageObjectKey: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  duration: number;
  uploadStatus: 'pending' | 'uploaded' | 'verified' | 'failed';
  visibilityScope: 'private' | 'room';
  createdAt: string;
  blobUrl?: string; // Client local blob preview
  viewUrl?: string; // Authenticated view/playback URL
}

export interface GameTurnRecord {
  id: string;
  sessionId: string;
  turnNumber: number;
  roundNumber: number;
  playerId: string;
  playerName: string;
  promptId: string;
  promptType: CardType;
  promptText: string;
  evidenceType?: EvidenceType;
  evidenceRequired?: boolean;
  submittedStatus: TurnActionStatus;
  awardedPoints: number;
  evidenceId?: string;
  answerText?: string;
  submittedAt: string;
}

export interface AnswerNode {
  id: string;
  promptId: string;
  promptType: CardType;
  promptText: string;
  parentId: string | null;
  sessionId: string;
  playerId: string;
  playerName: string;
  answerText: string;
  branchLevel: number;
  createdAt: string;
  children?: AnswerNode[];
}

export interface PlayerState {
  id: string;
  displayName: string;
  role: 'host' | 'guest' | 'solo';
  score: number;
  readyStatus: boolean;
  connectionStatus: 'connected' | 'disconnected';
  sessionToken?: string;
}

export interface GameRoomState {
  sessionId: string;
  roomId: string;
  roomCode: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  totalRounds: number;
  currentRound: number;
  hostPlayerId: string;
  players: PlayerState[];
  activePlayerIndex: number; // 0 (Player 1) or 1 (Player 2)
  currentCardType?: CardType;
  currentPrompt?: TruthQuestion | DareChallenge;
  currentTurnStep:
    | 'select_card'
    | 'card_revealed'
    | 'recording'
    | 'preview'
    | 'uploading'
    | 'turn_result';
  turns: GameTurnRecord[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface PlayerReportSummary {
  id: string;
  displayName: string;
  score: number;
  truthAnsweredCount: number;
  truthDeclinedCount: number;
  truthSkippedCount: number;
  dareCompletedCount: number;
  dareNotPerformedCount: number;
  dareSkippedCount: number;
  evidenceUploadCount: number;
}

export interface GameSessionReport {
  sessionId: string;
  mode: GameMode;
  roomCode?: string;
  totalRounds: number;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  players: PlayerReportSummary[];
  turns: GameTurnRecord[];
  winnerPlayerId?: string | 'tie';
}

