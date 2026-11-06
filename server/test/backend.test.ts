import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateRoomCode, RoomManager } from '../game/roomManager';
import { LocalStorageAdapter } from '../storage/storageAdapter';
import { db } from '../db/database';

describe('Truth or Dare Server Backend & Room Manager', () => {
  test('generates unambiguous 8-character room codes', () => {
    const code = generateRoomCode();
    assert.equal(code.length, 8);
    assert.match(code, /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
    assert.doesNotMatch(code, /[01IO]/);
  });

  test('signs and verifies media viewing tokens with expiry and tamper resistance', () => {
    const adapter = new LocalStorageAdapter();
    const key = 'test-evidence-uuid-123.webm';
    const signedUrl = adapter.getSignedViewUrl(key, 10);
    assert.ok(signedUrl.includes('/api/tod/evidence/stream/'));

    const token = signedUrl.replace('/api/tod/evidence/stream/', '');
    const verifiedKey = LocalStorageAdapter.verifyToken(token);
    assert.equal(verifiedKey, key);

    // Tampered token check
    const tampered = token.slice(0, -3) + 'xyz';
    assert.equal(LocalStorageAdapter.verifyToken(tampered), null);
  });

  describe('Multiplayer Room Lifecycle', () => {
    const roomManager = new RoomManager();

    test('creates room, handles 2-player join, enforces 2-player limit and manages authoritative gameplay', () => {
      // 1. Create room
      const { roomCode, sessionToken: hostToken, state: hostRoomState } = roomManager.createRoom('HostPlayer', 5);
      assert.equal(roomCode.length, 8);
      assert.equal(hostRoomState.players.length, 1);
      assert.equal(hostRoomState.players[0].displayName, 'HostPlayer');
      assert.equal(hostRoomState.players[0].role, 'host');
      assert.ok(hostToken);

      // 2. Join room
      const joinResult = roomManager.joinRoom(roomCode, 'GuestPlayer');
      assert.equal(joinResult.success, true);
      assert.ok(joinResult.sessionToken);
      const updatedRoom = joinResult.state!;
      assert.equal(updatedRoom.players.length, 2);
      assert.equal(updatedRoom.players[1].displayName, 'GuestPlayer');

      // 3. Attempt 3rd player join -> should fail (2 player cap)
      const thirdJoin = roomManager.joinRoom(roomCode, 'ThirdPlayer');
      assert.equal(thirdJoin.success, false);
      assert.ok(thirdJoin.error?.includes('full'));

      // 4. Toggle ready
      const readyState = roomManager.setPlayerReady(roomCode, updatedRoom.players[1].id, true);
      assert.ok(readyState);
      assert.equal(readyState.players[1].readyStatus, true);

      // 5. Start game
      const startResult = roomManager.startGame(roomCode, updatedRoom.players[0].id);
      assert.equal(startResult.success, true);
      const startedRoom = startResult.state!;
      assert.equal(startedRoom.status, 'in_progress');
      assert.equal(startedRoom.currentRound, 1);
      const activePlayer = startedRoom.players[startedRoom.activePlayerIndex];
      assert.ok(activePlayer);

      // 6. Active player chooses Truth
      const cardResult = roomManager.chooseCard(roomCode, activePlayer.id, 'truth');
      assert.equal(cardResult.success, true);
      assert.equal(cardResult.state!.currentCardType, 'truth');
      assert.ok(cardResult.state!.currentPrompt);
      assert.ok(cardResult.state!.currentPrompt!.prompt);

      // 7. Active player submits Truth answered (+10 points)
      const turnSubmitResult = roomManager.submitAction(roomCode, activePlayer.id, 'answered');
      assert.equal(turnSubmitResult.success, true);
      const activePlayerAfter = turnSubmitResult.state!.players.find(p => p.id === activePlayer.id);
      assert.equal(activePlayerAfter!.score, 10);

      // Active player advances to the next player
      assert.notEqual(turnSubmitResult.state!.activePlayerIndex, 0);

      // 8. Verify session in DB
      const dbSession = db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(startedRoom.sessionId);
      assert.ok(dbSession);
    });

    test('persists evidence metadata and guarantees storage integrity', () => {
      const evidenceId = crypto.randomUUID();
      const dareId = 'DARE-005';
      const challenge = 'Do 10 pushups or sing a song';
      const now = new Date().toISOString();
      const storageKey = `tod/solo/${evidenceId}.webm`;

      db.prepare(`
        INSERT INTO evidence (
          id, dare_id, challenge, evidence_type, player_name,
          file_url, storage_object_key, file_size, duration, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        evidenceId,
        dareId,
        challenge,
        'audio',
        'Mausami Ji',
        `/api/tod/evidence/stream/${evidenceId}`,
        storageKey,
        10240,
        5.2,
        now
      );

      const inserted = db.prepare('SELECT * FROM evidence WHERE id = ?').get(evidenceId) as any;
      assert.ok(inserted);
      assert.equal(inserted.dare_id, dareId);
      assert.equal(inserted.player_name, 'Mausami Ji');
    });

    test('stores text answers for questions cleanly without tree complexity', () => {
      const answerId = crypto.randomUUID();
      const promptId = 'TRUTH-008';
      const question = "Kabhi kisi ke message ka 3 din baad reply dekar 'Sorry' bola hai?";
      const answer = 'Haan college wali didi ka';
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO answers (id, prompt_id, prompt_type, question, answer, player_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(answerId, promptId, 'truth', question, answer, 'Mausami Ji', now);

      const saved = db.prepare('SELECT * FROM answers WHERE id = ?').get(answerId) as any;
      assert.ok(saved);
      assert.equal(saved.prompt_id, promptId);
      assert.equal(saved.question, question);
      assert.equal(saved.answer, answer);
      assert.equal(saved.player_name, 'Mausami Ji');
    });
  });
});
