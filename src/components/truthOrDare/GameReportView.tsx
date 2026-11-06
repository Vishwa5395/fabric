import React from 'react';
import {
  Trophy,
  CheckCircle,
  XCircle,
  SkipForward,
  UploadSimple,
  ArrowsClockwise,
  House
} from '@phosphor-icons/react';
import { GameSessionReport } from '../../types/truthOrDare';

interface GameReportViewProps {
  report: GameSessionReport;
  onPlayAgain: () => void;
  onBackToGameRoom: () => void;
}

export const GameReportView: React.FC<GameReportViewProps> = ({
  report,
  onPlayAgain,
  onBackToGameRoom
}) => {
  const isMultiplayer = report.mode === 'multiplayer';
  const minutes = Math.floor(report.durationSeconds / 60);
  const seconds = report.durationSeconds % 60;

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '24px 16px',
          backgroundColor: '#FFFFFF',
          borderTop: '8px solid var(--color-lime)',
          boxShadow: 'var(--shadow-retro)',
          marginBottom: '18px'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-lime)',
            color: 'var(--color-graphite)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            border: 'var(--border-width) solid var(--color-graphite)'
          }}
        >
          <Trophy size={32} weight="fill" />
        </div>

        <span className="badge badge-coral" style={{ marginBottom: '8px' }}>
          {isMultiplayer ? `ONLINE MULTIPLAYER REPORT (${report.roomCode || 'ROOM'})` : 'SOLO SESSION REPORT'}
        </span>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
          Game Khatam! Aaj Ka Hisaab-Kitaab
        </h1>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Total Rounds: {report.totalRounds} • Duration: {minutes}m {seconds}s
        </p>

        {isMultiplayer && (
          <div style={{ marginTop: '12px' }}>
            {report.winnerPlayerId === 'tie' ? (
              <span className="badge badge-lime" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                🤝 Kya Match Tha! Dono Barabar (Tie)!
              </span>
            ) : (
              <span className="badge badge-lime" style={{ fontSize: '0.95rem', padding: '6px 14px' }}>
                🏆 Winner: {report.players.find(p => p.id === report.winnerPlayerId)?.displayName || 'Player'}!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Players Performance Breakdown Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        {report.players.map(player => (
          <div
            key={player.id}
            className="card"
            style={{
              padding: '16px',
              backgroundColor: '#FFFFFF',
              borderLeft: '6px solid var(--color-cobalt)',
              boxShadow: 'var(--shadow-retro)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{player.displayName}</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Player Performance Summary</span>
              </div>
              <span className="badge badge-lime" style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                {player.score} Pts
              </span>
            </div>

            {/* Stat Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                fontSize: '0.82rem'
              }}
            >
              <div
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--color-ivory)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle size={16} weight="fill" color="var(--color-cobalt)" />
                <span>Truth Answered: <strong>{player.truthAnsweredCount}</strong></span>
              </div>

              <div
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--color-ivory)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <XCircle size={16} weight="fill" color="var(--color-coral)" />
                <span>Truth Declined: <strong>{player.truthDeclinedCount}</strong></span>
              </div>

              <div
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--color-ivory)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle size={16} weight="fill" color="green" />
                <span>Dares Done: <strong>{player.dareCompletedCount}</strong></span>
              </div>

              <div
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--color-ivory)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <XCircle size={16} weight="fill" color="var(--color-coral)" />
                <span>Dares Missed: <strong>{player.dareNotPerformedCount}</strong></span>
              </div>

              <div
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--color-ivory)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <SkipForward size={16} weight="bold" color="var(--text-muted)" />
                <span>Skipped Cards: <strong>{player.truthSkippedCount + player.dareSkippedCount}</strong></span>
              </div>

              <div
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--color-ivory)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UploadSimple size={16} weight="bold" color="var(--color-cobalt)" />
                <span>Evidence Uploads: <strong>{player.evidenceUploadCount}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          type="button"
          onClick={onPlayAgain}
          className="btn btn-primary"
          style={{
            padding: '12px',
            justifyContent: 'center',
            backgroundColor: 'var(--color-lime)',
            color: 'var(--color-graphite)',
            fontWeight: 800
          }}
        >
          <ArrowsClockwise size={18} weight="bold" />
          <span>Dubara Khelo</span>
        </button>

        <button
          type="button"
          onClick={onBackToGameRoom}
          className="btn btn-outline"
          style={{
            padding: '12px',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            fontWeight: 800
          }}
        >
          <House size={18} weight="bold" />
          <span>Game Room Wapas</span>
        </button>
      </div>
    </div>
  );
};
