import crypto from 'node:crypto';
import { db } from '../db/database';
import { DeckManager } from '../../src/utils/truthOrDareDeck';
import { calculateTurnPoints } from '../../src/utils/truthOrDareScoring';
import {
  GameRoomState,
  PlayerState,
  CardType,
  TruthQuestion,
  DareChallenge,
  TurnActionStatus,
  GameTurnRecord,
  GameSessionReport
} from '../../src/types/truthOrDare';

// Character pool excluding confusing characters: 0, O, 1, I
const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomCode(): string {
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return code;
}

export class RoomManager {
  private activeRooms: Map<string, { state: GameRoomState; deck: DeckManager }> = new Map();
  private rateLimits: Map<string, { count: number; resetAt: number }> = new Map();

  constructor() {
    this.loadActiveRoomsFromDb();
  }

  public checkRateLimit(ip: string, maxAttempts: number = 20, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimits.get(ip);
    if (!record || now > record.resetAt) {
      this.rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (record.count >= maxAttempts) {
      return false;
    }
    record.count++;
    return true;
  }

  private loadActiveRoomsFromDb(): void {
    try {
      const activeRooms = db
        .prepare("SELECT * FROM rooms WHERE status IN ('waiting', 'in_progress')")
        .all() as any[];

      for (const r of activeRooms) {
        const session = db
          .prepare('SELECT * FROM game_sessions WHERE id = ?')
          .get(r.session_id) as any;

        if (!session) continue;

        const players = db
          .prepare('SELECT * FROM players WHERE session_id = ?')
          .all(r.session_id) as any[];

        const turns = db
          .prepare('SELECT * FROM game_turns WHERE session_id = ? ORDER BY round_number ASC, submitted_at ASC')
          .all(r.session_id) as any[];

        const roomState: GameRoomState = {
          sessionId: session.id,
          roomId: r.id,
          roomCode: r.room_code,
          status: r.status,
          totalRounds: session.total_rounds,
          currentRound: session.current_round,
          hostPlayerId: r.host_player_id,
          players: players.map(p => ({
            id: p.id,
            displayName: p.display_name,
            role: p.role,
            score: p.score,
            readyStatus: Boolean(p.ready_status),
            connectionStatus: 'disconnected', // Initially disconnected until sockets reconnect
            sessionToken: p.session_token
          })),
          activePlayerIndex: 0,
          currentTurnStep: 'select_card',
          turns: turns.map(t => ({
            id: t.id,
            sessionId: t.session_id,
            turnNumber: 1,
            roundNumber: t.round_number,
            playerId: t.player_id,
            playerName: players.find(p => p.id === t.player_id)?.display_name || 'Player',
            promptId: t.prompt_id,
            promptType: t.prompt_type,
            promptText: '',
            submittedStatus: t.submitted_status,
            awardedPoints: t.awarded_points,
            evidenceId: t.evidence_id,
            submittedAt: t.submitted_at
          })),
          createdAt: session.created_at,
          startedAt: session.started_at,
          completedAt: session.completed_at
        };

        this.activeRooms.set(r.room_code, {
          state: roomState,
          deck: new DeckManager()
        });
      }
    } catch (e) {
      console.warn('Could not restore past rooms from DB:', e);
    }
  }

  public createRoom(
    hostName: string,
    totalRounds: number = 7
  ): { roomCode: string; playerId: string; sessionToken: string; state: GameRoomState } {
    let roomCode = generateRoomCode();
    while (this.activeRooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const sessionId = crypto.randomUUID();
    const roomId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    const sessionToken = crypto.randomUUID();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    const hostPlayer: PlayerState = {
      id: playerId,
      displayName: hostName.trim() || 'Player 1',
      role: 'host',
      score: 0,
      readyStatus: true,
      connectionStatus: 'connected',
      sessionToken
    };

    const roomState: GameRoomState = {
      sessionId,
      roomId,
      roomCode,
      status: 'waiting',
      totalRounds,
      currentRound: 1,
      hostPlayerId: playerId,
      players: [hostPlayer],
      activePlayerIndex: 0,
      currentTurnStep: 'select_card',
      turns: [],
      createdAt: now
    };

    // Persist to database
    db.prepare(`
      INSERT INTO game_sessions (id, mode, status, total_rounds, current_round, current_player_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, 'multiplayer', 'waiting', totalRounds, 1, playerId, now);

    db.prepare(`
      INSERT INTO players (id, session_id, display_name, role, score, connection_status, ready_status, session_token, joined_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(playerId, sessionId, hostPlayer.displayName, 'host', 0, 'connected', 1, sessionToken, now);

    db.prepare(`
      INSERT INTO rooms (id, room_code, session_id, host_player_id, status, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(roomId, roomCode, sessionId, playerId, 'waiting', expiresAt);

    this.activeRooms.set(roomCode, {
      state: roomState,
      deck: new DeckManager()
    });

    return { roomCode, playerId, sessionToken, state: roomState };
  }

  public joinRoom(
    roomCode: string,
    playerName: string
  ): { success: boolean; error?: string; playerId?: string; sessionToken?: string; state?: GameRoomState } {
    const formattedCode = roomCode.toUpperCase().trim();
    const entry = this.activeRooms.get(formattedCode);

    if (!entry) {
      return { success: false, error: 'Ye Room Code nahi mila. Check karein aur dubara daalein.' };
    }

    const { state } = entry;

    if (state.status === 'completed') {
      return { success: false, error: 'Ye game pehle hi khatam ho chuka hai.' };
    }

    if (state.players.length >= 2) {
      return { success: false, error: 'Room pehle se full hai! (Maximum 2 players allowed)' };
    }

    const playerId = crypto.randomUUID();
    const sessionToken = crypto.randomUUID();
    const now = new Date().toISOString();

    const guestPlayer: PlayerState = {
      id: playerId,
      displayName: playerName.trim() || 'Player 2',
      role: 'guest',
      score: 0,
      readyStatus: true,
      connectionStatus: 'connected',
      sessionToken
    };

    state.players.push(guestPlayer);

    // Persist player to DB
    db.prepare(`
      INSERT INTO players (id, session_id, display_name, role, score, connection_status, ready_status, session_token, joined_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(playerId, state.sessionId, guestPlayer.displayName, 'guest', 0, 'connected', 1, sessionToken, now);

    return {
      success: true,
      playerId,
      sessionToken,
      state
    };
  }

  public getRoomByCode(roomCode: string): GameRoomState | null {
    return this.activeRooms.get(roomCode.toUpperCase().trim())?.state || null;
  }

  public getRoomBySessionToken(token: string): { state: GameRoomState; player: PlayerState } | null {
    for (const [, entry] of this.activeRooms.entries()) {
      const player = entry.state.players.find(p => p.sessionToken === token);
      if (player) {
        return { state: entry.state, player };
      }
    }
    return null;
  }

  public setPlayerReady(roomCode: string, playerId: string, isReady: boolean): GameRoomState | null {
    const entry = this.activeRooms.get(roomCode);
    if (!entry) return null;

    const player = entry.state.players.find(p => p.id === playerId);
    if (player) {
      player.readyStatus = isReady;
      db.prepare('UPDATE players SET ready_status = ? WHERE id = ?').run(isReady ? 1 : 0, playerId);
    }
    return entry.state;
  }

  public startGame(roomCode: string, hostPlayerId: string): { success: boolean; error?: string; state?: GameRoomState } {
    const entry = this.activeRooms.get(roomCode);
    if (!entry) return { success: false, error: 'Room not found' };

    const { state } = entry;
    if (state.hostPlayerId !== hostPlayerId) {
      return { success: false, error: 'Sirf Host hi game shuru kar sakta hai.' };
    }

    if (state.players.length < 2) {
      return { success: false, error: 'Doosre player ka join hone ka intezaar karein.' };
    }

    const allReady = state.players.every(p => p.readyStatus);
    if (!allReady) {
      return { success: false, error: 'Dono players ka Ready hona zaroori hai.' };
    }

    state.status = 'in_progress';
    state.startedAt = new Date().toISOString();
    state.activePlayerIndex = 0;
    state.currentRound = 1;
    state.currentTurnStep = 'select_card';
    state.currentCardType = undefined;
    state.currentPrompt = undefined;

    db.prepare("UPDATE game_sessions SET status = 'in_progress', started_at = ? WHERE id = ?").run(
      state.startedAt,
      state.sessionId
    );
    db.prepare("UPDATE rooms SET status = 'in_progress' WHERE id = ?").run(state.roomId);

    return { success: true, state };
  }

  public chooseCard(
    roomCode: string,
    playerId: string,
    cardType: CardType
  ): { success: boolean; error?: string; state?: GameRoomState } {
    const entry = this.activeRooms.get(roomCode);
    if (!entry) return { success: false, error: 'Room not found' };

    const { state, deck } = entry;
    if (state.status !== 'in_progress') {
      return { success: false, error: 'Game chalu nahi hai.' };
    }

    const activePlayer = state.players[state.activePlayerIndex];
    if (activePlayer.id !== playerId) {
      return { success: false, error: 'Abhi aapki baari nahi hai!' };
    }

    if (state.currentTurnStep !== 'select_card') {
      return { success: false, error: 'Card pehle hi draw ho chuka hai.' };
    }

    const prompt = deck.drawCard(cardType);
    state.currentCardType = cardType;
    state.currentPrompt = prompt;
    state.currentTurnStep = 'card_revealed';

    return { success: true, state };
  }

  public submitAction(
    roomCode: string,
    playerId: string,
    action: TurnActionStatus,
    evidenceId?: string
  ): { success: boolean; error?: string; state?: GameRoomState } {
    const entry = this.activeRooms.get(roomCode);
    if (!entry) return { success: false, error: 'Room not found' };

    const { state } = entry;
    const activePlayer = state.players[state.activePlayerIndex];

    if (activePlayer.id !== playerId) {
      return { success: false, error: 'Abhi doosre player ki baari hai.' };
    }

    if (!state.currentCardType || !state.currentPrompt) {
      return { success: false, error: 'No active prompt drawn.' };
    }

    const prompt = state.currentPrompt;
    const cardType = state.currentCardType;

    let hasUploadedEvidence = false;
    let evidenceRecord: any = null;

    if (cardType === 'dare') {
      const dare = prompt as DareChallenge;
      if (dare.evidenceRequired) {
        if (evidenceId) {
          evidenceRecord = db.prepare('SELECT * FROM evidence WHERE id = ?').get(evidenceId);
          if (evidenceRecord && evidenceRecord.upload_status === 'uploaded') {
            hasUploadedEvidence = true;
          }
        }
      }
    }

    const points = calculateTurnPoints(
      cardType,
      action,
      cardType === 'dare'
        ? {
            evidenceRequired: (prompt as DareChallenge).evidenceRequired,
            hasUploadedEvidence
          }
        : undefined
    );

    activePlayer.score += points;

    const turnId = crypto.randomUUID();
    const now = new Date().toISOString();

    const turnRecord: GameTurnRecord = {
      id: turnId,
      sessionId: state.sessionId,
      turnNumber: state.turns.length + 1,
      roundNumber: state.currentRound,
      playerId: activePlayer.id,
      playerName: activePlayer.displayName,
      promptId: prompt.id,
      promptType: cardType,
      promptText: prompt.prompt,
      evidenceType: cardType === 'dare' ? (prompt as DareChallenge).evidenceType : undefined,
      evidenceRequired: cardType === 'dare' ? (prompt as DareChallenge).evidenceRequired : undefined,
      submittedStatus: action,
      awardedPoints: points,
      evidenceId,
      submittedAt: now
    };

    state.turns.push(turnRecord);

    // Save turn and score to database in transaction
    db.exec('BEGIN TRANSACTION;');
    try {
      db.prepare(`
        INSERT INTO game_turns (id, session_id, player_id, round_number, prompt_id, prompt_type, submitted_status, awarded_points, evidence_id, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        turnId,
        state.sessionId,
        activePlayer.id,
        state.currentRound,
        prompt.id,
        cardType,
        action,
        points,
        evidenceId || null,
        now
      );

      db.prepare('UPDATE players SET score = ? WHERE id = ?').run(activePlayer.score, activePlayer.id);

      if (evidenceId) {
        db.prepare('UPDATE evidence SET turn_id = ? WHERE id = ?').run(turnId, evidenceId);
      }
      db.exec('COMMIT;');
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }

    // Advance turn and round
    // If active player was player 0, switch to player 1
    // If active player was player 1, round is finished, advance round
    if (state.activePlayerIndex === 0) {
      state.activePlayerIndex = 1;
      state.currentTurnStep = 'select_card';
      state.currentCardType = undefined;
      state.currentPrompt = undefined;
    } else {
      // Both players completed this round
      if (state.currentRound >= state.totalRounds) {
        // Game complete!
        state.status = 'completed';
        state.completedAt = new Date().toISOString();
        state.currentTurnStep = 'turn_result';

        db.prepare("UPDATE game_sessions SET status = 'completed', completed_at = ? WHERE id = ?").run(
          state.completedAt,
          state.sessionId
        );
        db.prepare("UPDATE rooms SET status = 'completed' WHERE id = ?").run(state.roomId);
      } else {
        state.currentRound += 1;
        state.activePlayerIndex = 0;
        state.currentTurnStep = 'select_card';
        state.currentCardType = undefined;
        state.currentPrompt = undefined;

        db.prepare('UPDATE game_sessions SET current_round = ? WHERE id = ?').run(
          state.currentRound,
          state.sessionId
        );
      }
    }

    return { success: true, state };
  }

  public handleDisconnect(playerId: string): GameRoomState | null {
    for (const [, entry] of this.activeRooms.entries()) {
      const player = entry.state.players.find(p => p.id === playerId);
      if (player) {
        player.connectionStatus = 'disconnected';
        db.prepare("UPDATE players SET connection_status = 'disconnected' WHERE id = ?").run(playerId);
        return entry.state;
      }
    }
    return null;
  }

  public handleReconnect(playerId: string): GameRoomState | null {
    for (const [, entry] of this.activeRooms.entries()) {
      const player = entry.state.players.find(p => p.id === playerId);
      if (player) {
        player.connectionStatus = 'connected';
        db.prepare("UPDATE players SET connection_status = 'connected' WHERE id = ?").run(playerId);
        return entry.state;
      }
    }
    return null;
  }

  public generateReport(sessionId: string): GameSessionReport | null {
    const session = db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(sessionId) as any;
    if (!session) return null;

    const players = db.prepare('SELECT * FROM players WHERE session_id = ?').all(sessionId) as any[];
    const turns = db
      .prepare('SELECT * FROM game_turns WHERE session_id = ? ORDER BY round_number ASC, submitted_at ASC')
      .all(sessionId) as any[];

    const room = db.prepare('SELECT * FROM rooms WHERE session_id = ?').get(sessionId) as any;

    const startedTime = new Date(session.started_at || session.created_at).getTime();
    const completedTime = session.completed_at ? new Date(session.completed_at).getTime() : Date.now();
    const durationSeconds = Math.max(0, Math.round((completedTime - startedTime) / 1000));

    const playerSummaries = players.map(p => {
      const pTurns = turns.filter(t => t.player_id === p.id);
      return {
        id: p.id,
        displayName: p.display_name,
        score: p.score,
        truthAnsweredCount: pTurns.filter(t => t.prompt_type === 'truth' && t.submitted_status === 'answered').length,
        truthDeclinedCount: pTurns.filter(t => t.prompt_type === 'truth' && t.submitted_status === 'declined').length,
        truthSkippedCount: pTurns.filter(t => t.prompt_type === 'truth' && t.submitted_status === 'skipped').length,
        dareCompletedCount: pTurns.filter(t => t.prompt_type === 'dare' && t.submitted_status === 'completed').length,
        dareNotPerformedCount: pTurns.filter(t => t.prompt_type === 'dare' && t.submitted_status === 'not_performed').length,
        dareSkippedCount: pTurns.filter(t => t.prompt_type === 'dare' && t.submitted_status === 'skipped').length,
        evidenceUploadCount: pTurns.filter(t => Boolean(t.evidence_id)).length
      };
    });

    let winnerId: string | 'tie' | undefined;
    if (players.length >= 2) {
      if (players[0].score > players[1].score) {
        winnerId = players[0].id;
      } else if (players[1].score > players[0].score) {
        winnerId = players[1].id;
      } else {
        winnerId = 'tie';
      }
    }

    return {
      sessionId: session.id,
      mode: session.mode as any,
      roomCode: room?.room_code,
      totalRounds: session.total_rounds,
      startedAt: session.started_at || session.created_at,
      completedAt: session.completed_at || new Date().toISOString(),
      durationSeconds,
      players: playerSummaries,
      turns: turns.map(t => ({
        id: t.id,
        sessionId: t.session_id,
        turnNumber: 1,
        roundNumber: t.round_number,
        playerId: t.player_id,
        playerName: players.find(p => p.id === t.player_id)?.display_name || 'Player',
        promptId: t.prompt_id,
        promptType: t.prompt_type,
        promptText: '',
        submittedStatus: t.submitted_status,
        awardedPoints: t.awarded_points,
        evidenceId: t.evidence_id,
        submittedAt: t.submitted_at
      })),
      winnerPlayerId: winnerId
    };
  }
}

export const roomManager = new RoomManager();

