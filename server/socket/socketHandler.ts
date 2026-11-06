import { Server, Socket } from 'socket.io';
import { roomManager } from '../game/roomManager';
import { CardType, TurnActionStatus } from '../../src/types/truthOrDare';

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    let currentRoomCode: string | null = null;
    let currentPlayerId: string | null = null;

    // Check handshake auth for session token restoration
    const token = socket.handshake.auth?.token as string | undefined;
    if (token) {
      const existing = roomManager.getRoomBySessionToken(token);
      if (existing) {
        currentRoomCode = existing.state.roomCode;
        currentPlayerId = existing.player.id;
        socket.join(currentRoomCode);
        const state = roomManager.handleReconnect(currentPlayerId);
        if (state) {
          io.to(currentRoomCode).emit('player:reconnected', {
            playerId: currentPlayerId,
            state
          });
          socket.emit('room:state', state);
        }
      }
    }

    // 1. Create Room
    socket.on('room:create', (payload: { hostName: string; totalRounds?: number }) => {
      const clientIp = socket.handshake.address || 'unknown';
      if (!roomManager.checkRateLimit(clientIp)) {
        return socket.emit('error:notification', { message: 'Too many requests. Please wait a moment.' });
      }

      try {
        const { roomCode, playerId, sessionToken, state } = roomManager.createRoom(
          payload.hostName,
          payload.totalRounds || 7
        );
        currentRoomCode = roomCode;
        currentPlayerId = playerId;
        socket.join(roomCode);

        socket.emit('room:created', { roomCode, playerId, sessionToken, state });
        socket.emit('room:state', state);
      } catch (err: any) {
        socket.emit('error:notification', { message: err.message || 'Room create karne mein dikkat aayi.' });
      }
    });

    // 2. Join Room
    socket.on('room:join', (payload: { roomCode: string; playerName: string }) => {
      const clientIp = socket.handshake.address || 'unknown';
      if (!roomManager.checkRateLimit(clientIp)) {
        return socket.emit('error:notification', { message: 'Too many requests. Please wait a moment.' });
      }

      const result = roomManager.joinRoom(payload.roomCode, payload.playerName);
      if (!result.success || !result.state) {
        return socket.emit('error:notification', { message: result.error || 'Room join nahi ho paya.' });
      }

      currentRoomCode = result.state.roomCode;
      currentPlayerId = result.playerId!;
      socket.join(currentRoomCode);

      socket.emit('room:joined', {
        roomCode: currentRoomCode,
        playerId: result.playerId,
        sessionToken: result.sessionToken,
        state: result.state
      });

      // Broadcast to room that second player joined
      io.to(currentRoomCode).emit('player:joined', {
        state: result.state
      });
      io.to(currentRoomCode).emit('room:state', result.state);
    });

    // 3. Player Ready
    socket.on('room:ready', (payload: { isReady: boolean }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const updatedState = roomManager.setPlayerReady(currentRoomCode, currentPlayerId, payload.isReady);
      if (updatedState) {
        io.to(currentRoomCode).emit('player:ready', { state: updatedState });
        io.to(currentRoomCode).emit('room:state', updatedState);
      }
    });

    // 4. Start Game
    socket.on('game:start', () => {
      if (!currentRoomCode || !currentPlayerId) return;
      const result = roomManager.startGame(currentRoomCode, currentPlayerId);
      if (!result.success || !result.state) {
        return socket.emit('error:notification', { message: result.error || 'Game shuru nahi ho saka.' });
      }

      io.to(currentRoomCode).emit('game:started', { state: result.state });
      io.to(currentRoomCode).emit('room:state', result.state);
    });

    // 5. Choose Card (Truth or Dare)
    socket.on('turn:choose', (payload: { cardType: CardType }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const result = roomManager.chooseCard(currentRoomCode, currentPlayerId, payload.cardType);
      if (!result.success || !result.state) {
        return socket.emit('error:notification', { message: result.error || 'Card choose nahi ho saka.' });
      }

      io.to(currentRoomCode).emit('card:revealed', { state: result.state });
      io.to(currentRoomCode).emit('room:state', result.state);
    });

    // 6. Submit Truth Response
    socket.on('truth:submit', (payload: { action: TurnActionStatus; answerText?: string; parentId?: string }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoomByCode(currentRoomCode);

      // Save answer if provided and not already saved
      if (room && payload.answerText && payload.answerText.trim() && room.currentPrompt) {
        try {
          const player = room.players.find(p => p.id === currentPlayerId);
          const playerName = player?.displayName || 'Player';
          const answer = payload.answerText.trim();
          const existing = db.prepare(`
            SELECT id FROM answers WHERE prompt_id = ? AND player_name = ? AND answer = ?
          `).get(room.currentPrompt.id, playerName, answer) as any;

          if (!existing) {
            const now = new Date().toISOString();
            db.prepare(`
              INSERT INTO answers (id, prompt_id, prompt_type, question, answer, player_name, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
              crypto.randomUUID(),
              room.currentPrompt.id,
              'truth',
              room.currentPrompt.prompt,
              answer,
              playerName,
              now
            );
          }
        } catch (e) {
          console.error('Error saving answer in socket:', e);
        }
      }

      const result = roomManager.submitAction(currentRoomCode, currentPlayerId, payload.action);
      if (!result.success || !result.state) {
        return socket.emit('error:notification', { message: result.error || 'Submission fail ho gaya.' });
      }

      io.to(currentRoomCode).emit('action:submitted', { state: result.state });
      io.to(currentRoomCode).emit('turn:updated', { state: result.state });
      io.to(currentRoomCode).emit('score:updated', { state: result.state });

      if (result.state.status === 'completed') {
        const report = roomManager.generateReport(result.state.sessionId);
        io.to(currentRoomCode).emit('game:completed', { state: result.state, report });
      } else {
        io.to(currentRoomCode).emit('room:state', result.state);
      }
    });

    // 7. Submit Dare Response
    socket.on('dare:submit', (payload: { action: TurnActionStatus; evidenceId?: string; answerText?: string; parentId?: string }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoomByCode(currentRoomCode);

      // Save answer if provided and not already saved
      if (room && payload.answerText && payload.answerText.trim() && room.currentPrompt) {
        try {
          const player = room.players.find(p => p.id === currentPlayerId);
          const playerName = player?.displayName || 'Player';
          const answer = payload.answerText.trim();
          const existing = db.prepare(`
            SELECT id FROM answers WHERE prompt_id = ? AND player_name = ? AND answer = ?
          `).get(room.currentPrompt.id, playerName, answer) as any;

          if (!existing) {
            const now = new Date().toISOString();
            db.prepare(`
              INSERT INTO answers (id, prompt_id, prompt_type, question, answer, player_name, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
              crypto.randomUUID(),
              room.currentPrompt.id,
              'dare',
              room.currentPrompt.prompt,
              answer,
              playerName,
              now
            );
          }
        } catch (e) {
          console.error('Error saving answer in socket:', e);
        }
      }

      const result = roomManager.submitAction(
        currentRoomCode,
        currentPlayerId,
        payload.action,
        payload.evidenceId
      );
      if (!result.success || !result.state) {
        return socket.emit('error:notification', { message: result.error || 'Dare submission fail ho gaya.' });
      }

      io.to(currentRoomCode).emit('action:submitted', { state: result.state });
      io.to(currentRoomCode).emit('turn:updated', { state: result.state });
      io.to(currentRoomCode).emit('score:updated', { state: result.state });

      if (result.state.status === 'completed') {
        const report = roomManager.generateReport(result.state.sessionId);
        io.to(currentRoomCode).emit('game:completed', { state: result.state, report });
      } else {
        io.to(currentRoomCode).emit('room:state', result.state);
      }
    });

    // 8. Session Resume
    socket.on('session:resume', (payload: { sessionToken: string }) => {
      const match = roomManager.getRoomBySessionToken(payload.sessionToken);
      if (!match) {
        return socket.emit('error:notification', { message: 'Session restore nahi ho paya.' });
      }
      currentRoomCode = match.state.roomCode;
      currentPlayerId = match.player.id;
      socket.join(currentRoomCode);

      const state = roomManager.handleReconnect(currentPlayerId);
      socket.emit('room:state', state || match.state);
      io.to(currentRoomCode).emit('player:reconnected', { playerId: currentPlayerId, state: state || match.state });
    });

    // 9. Disconnect
    socket.on('disconnect', () => {
      if (currentPlayerId && currentRoomCode) {
        const state = roomManager.handleDisconnect(currentPlayerId);
        if (state) {
          io.to(currentRoomCode).emit('player:disconnected', {
            playerId: currentPlayerId,
            state
          });
        }
      }
    });
  });
}

