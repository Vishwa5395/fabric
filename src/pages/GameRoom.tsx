import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Users
} from '@phosphor-icons/react';

export const GameRoom: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '22px' }}>
        <span className="badge badge-lime" style={{ marginBottom: '6px' }}>OFFICIAL GAME ROOM</span>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
          The Fun Department Arcade
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Khel, masti, sach aur kaand. Apna game chunein:
        </p>
      </div>

      {/* Games List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* GAME 1: TRUTH OR DARE */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/games/truth-or-dare')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/games/truth-or-dare');
            }
          }}
          className="card"
          style={{
            cursor: 'pointer',
            padding: '20px',
            backgroundColor: '#FFFFFF',
            borderLeft: '6px solid var(--color-coral)',
            boxShadow: 'var(--shadow-retro)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="badge badge-coral">FEATURED GAME</span>
            <span className="badge badge-lime" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} weight="bold" />
              SOLO & 2-PLAYER ONLINE
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '6px', color: 'var(--color-graphite)' }}>
            TRUTH OR DARE
          </h2>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.45 }}>
            Classic Truth or Dare reimagined with modern card draws, audio & video evidence challenges, private rooms, and real-time long-distance multiplayer!
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-cobalt)' }}>
              Card-Based • Audio/Video Dares • Live Sync
            </span>
            <span style={{ fontWeight: 800, color: 'var(--color-graphite)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>Khel Kholo</span>
              <ArrowRight size={16} weight="bold" />
            </span>
          </div>
        </div>

        {/* GAME 2: MEME COURT (Preserved existing game) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/court')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/court');
            }
          }}
          className="card"
          style={{
            cursor: 'pointer',
            padding: '20px',
            backgroundColor: '#FFFFFF',
            borderLeft: '6px solid var(--color-cobalt)',
            boxShadow: 'var(--shadow-retro)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="badge badge-cobalt">JUDICIAL SIMULATOR</span>
            <span className="badge badge-lime">7 ROUNDS</span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '6px', color: 'var(--color-graphite)' }}>
            MEME COURT
          </h2>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.45 }}>
            Aapki adaalat, aapka faisla. 7 rounds of absurd allegations, Dora's missing mother hearing, and official judicial verdicts!
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-cobalt)' }}>
              Solo Mode • Absurd Law • Official Titles
            </span>
            <span style={{ fontWeight: 800, color: 'var(--color-graphite)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>Adaalat Kholo</span>
              <ArrowRight size={16} weight="bold" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
