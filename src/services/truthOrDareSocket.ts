import { io, Socket } from 'socket.io-client';
import { CardType, TurnActionStatus } from '../types/truthOrDare';

export class TruthOrDareSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private lastSessionToken: string | null = null;

  constructor() {
    this.lastSessionToken = localStorage.getItem('tod:sessionToken');
  }

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    this.socket = io(socketUrl, {
      auth: {
        token: this.lastSessionToken || undefined
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      this.emitInternal('connect', {});
      if (this.lastSessionToken) {
        this.resumeSession(this.lastSessionToken);
      }
    });

    this.socket.on('disconnect', () => {
      this.emitInternal('disconnect', {});
    });

    // Wire server events
    const serverEvents = [
      'room:created',
      'room:joined',
      'room:state',
      'player:joined',
      'player:ready',
      'player:disconnected',
      'player:reconnected',
      'game:started',
      'card:revealed',
      'action:submitted',
      'turn:updated',
      'score:updated',
      'game:completed',
      'error:notification'
    ];

    serverEvents.forEach(evt => {
      this.socket!.on(evt, (data: any) => {
        if (evt === 'room:created' || evt === 'room:joined') {
          if (data.sessionToken) {
            this.lastSessionToken = data.sessionToken;
            localStorage.setItem('tod:sessionToken', data.sessionToken);
          }
        }
        this.emitInternal(evt, data);
      });
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emitInternal(event: string, data: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(fn => fn(data));
    }
  }

  public createRoom(hostName: string, totalRounds: number = 7): void {
    this.connect().emit('room:create', { hostName, totalRounds });
  }

  public joinRoom(roomCode: string, playerName: string): void {
    this.connect().emit('room:join', { roomCode, playerName });
  }

  public setReady(isReady: boolean): void {
    this.connect().emit('room:ready', { isReady });
  }

  public startGame(): void {
    this.connect().emit('game:start');
  }

  public chooseCard(cardType: CardType): void {
    this.connect().emit('turn:choose', { cardType });
  }

  public submitTruth(action: TurnActionStatus, answerText?: string, parentId?: string | null): void {
    this.connect().emit('truth:submit', { action, answerText, parentId });
  }

  public submitDare(action: TurnActionStatus, evidenceId?: string, answerText?: string, parentId?: string | null): void {
    this.connect().emit('dare:submit', { action, evidenceId, answerText, parentId });
  }

  public resumeSession(sessionToken: string): void {
    this.connect().emit('session:resume', { sessionToken });
  }

  public clearSession(): void {
    this.lastSessionToken = null;
    localStorage.removeItem('tod:sessionToken');
  }

  public isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }
}

export const truthOrDareSocket = new TruthOrDareSocketClient();
