import React, { useState } from 'react';
import {
  Copy,
  Check,
  Users,
  Play,
  ArrowLeft,
  CheckCircle,
  HourglassMedium
} from '@phosphor-icons/react';
import { GameRoomState } from '../../types/truthOrDare';

interface WaitingLobbyViewProps {
  roomState: GameRoomState;
  myPlayerId: string;
  onToggleReady: (isReady: boolean) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const WaitingLobbyView: React.FC<WaitingLobbyViewProps> = ({
  roomState,
  myPlayerId,
  onToggleReady,
  onStartGame,
  onLeaveRoom
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const me = roomState.players.find(p => p.id === myPlayerId);
  const isHost = me?.role === 'host';
  const player2 = roomState.players.find(p => p.id !== roomState.hostPlayerId);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomState.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const allPlayersJoined = roomState.players.length === 2;
  const allPlayersReady = allPlayersJoined && roomState.players.every(p => p.readyStatus);

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Top Bar */}
      <button
        type="button"
        onClick={onLeaveRoom}
        className="btn btn-outline"
        style={{ marginBottom: '14px', padding: '6px 12px', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} weight="bold" />
        <span>Room Se Bahar Jao</span>
      </button>

      {/* Room Code Card */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '20px 16px',
          backgroundColor: '#FFFFFF',
          borderTop: '6px solid var(--color-cobalt)',
          boxShadow: 'var(--shadow-retro)',
          marginBottom: '18px'
        }}
      >
        <span className="badge badge-lime" style={{ marginBottom: '8px' }}>
          ONLINE PRIVATE ROOM ({roomState.totalRounds} ROUNDS)
        </span>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Apne dost ko ye Room Code share karein:
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            backgroundColor: 'var(--color-ivory)',
            border: '2px dashed var(--color-graphite)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '12px'
          }}
        >
          <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '4px', fontFamily: 'monospace' }}>
            {roomState.roomCode}
          </span>

          <button
            type="button"
            onClick={handleCopyCode}
            className="btn btn-outline"
            style={{
              padding: '8px 12px',
              backgroundColor: copied ? 'var(--color-lime)' : '#FFFFFF',
              borderColor: 'var(--color-graphite)',
              fontSize: '0.8rem'
            }}
          >
            {copied ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Doosra player apne phone pe <strong>JOIN PRIVATE ROOM</strong> select karke ye code daalega.
        </p>
      </div>

      {/* Players Lobby Slots */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={20} weight="bold" color="var(--color-cobalt)" />
          <span>Players in Room ({roomState.players.length}/2)</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Player 1 (Host) */}
          {roomState.players[0] && (
            <div
              className="card"
              style={{
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderLeft: '5px solid var(--color-lime)'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.95rem' }}>{roomState.players[0].displayName}</strong>
                <span className="badge badge-cobalt" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>
                  HOST {roomState.players[0].id === myPlayerId ? '(Aap)' : ''}
                </span>
              </div>
              <span className="badge badge-lime" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} weight="fill" />
                READY
              </span>
            </div>
          )}

          {/* Player 2 Slot */}
          {player2 ? (
            <div
              className="card"
              style={{
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderLeft: '5px solid var(--color-coral)'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.95rem' }}>{player2.displayName}</strong>
                <span className="badge badge-coral" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>
                  PLAYER 2 {player2.id === myPlayerId ? '(Aap)' : ''}
                </span>
              </div>
              <span
                className={`badge ${player2.readyStatus ? 'badge-lime' : 'badge-outline'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {player2.readyStatus ? <CheckCircle size={14} weight="fill" /> : <HourglassMedium size={14} />}
                {player2.readyStatus ? 'READY' : 'WAITING...'}
              </span>
            </div>
          ) : (
            <div
              className="card"
              style={{
                padding: '16px',
                textAlign: 'center',
                backgroundColor: 'var(--color-ivory)',
                border: '1px dashed var(--border-light)'
              }}
            >
              <HourglassMedium size={24} weight="bold" color="var(--color-coral)" style={{ margin: '0 auto 6px', display: 'block' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-graphite)' }}>
                Player 2 ke judne ka intezaar hai...
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Apne dost ko room code bhejein aur bole website open karein!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Host / Guest Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Ready toggle button for Guest */}
        {!isHost && player2 && (
          <button
            type="button"
            onClick={() => onToggleReady(!me?.readyStatus)}
            className="btn btn-primary"
            style={{
              padding: '12px',
              justifyContent: 'center',
              backgroundColor: me?.readyStatus ? 'var(--color-coral)' : 'var(--color-lime)',
              color: 'var(--color-graphite)',
              fontWeight: 800
            }}
          >
            <CheckCircle size={20} weight="bold" />
            <span>{me?.readyStatus ? 'Not Ready Mark Karo' : 'Main Ready Hoon! (Mark Ready)'}</span>
          </button>
        )}

        {/* Start Game button for Host */}
        {isHost && (
          <button
            type="button"
            onClick={onStartGame}
            disabled={!allPlayersReady}
            className="btn btn-primary"
            style={{
              padding: '14px',
              justifyContent: 'center',
              backgroundColor: allPlayersReady ? 'var(--color-lime)' : '#CCCCCC',
              color: 'var(--color-graphite)',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: allPlayersReady ? 'pointer' : 'not-allowed'
            }}
          >
            <Play size={20} weight="fill" />
            <span>{allPlayersReady ? 'Khel Shuru Karein! (Start Game)' : 'Dono Players Ka Ready Hona Baaki Hai...'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

