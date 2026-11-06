import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkle, ArrowRight, MusicNotes } from '@phosphor-icons/react';
import { achievementEngine } from '../services/achievements';
import { audioManager } from '../services/audioManager';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Unlock first contact
    achievementEngine.emit('welcome_opened');
  }, []);

  const handleStart = () => {
    if (!audioManager.isAmbientActive()) {
      audioManager.playAmbient().catch(() => {});
    }
    navigate('/hq');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px 20px',
        minHeight: 'calc(100vh - 80px)',
        textAlign: 'center'
      }}
    >
      {/* Badge */}
      <div
        className="badge badge-lime"
        style={{
          marginBottom: '20px',
          padding: '4px 12px',
          fontSize: '0.8rem',
          letterSpacing: '0.05em'
        }}
      >
        <Sparkle size={14} weight="bold" style={{ marginRight: '6px' }} />
        OFFICIAL CLASSIFIED DESK
      </div>

      {/* Main Headlines */}
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          marginBottom: '8px',
          color: 'var(--color-graphite)'
        }}
      >
        Hieeeeeee Cutie Patootieeeee, kaise hai aap?
      </h1>

      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '20px',
          color: 'var(--color-graphite)'
        }}
      >
        Aapke liye kuch banaya hai...
      </h2>

      {/* Hero Card */}
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          margin: '0 auto 28px',
          backgroundColor: '#FFFFFF',
          textAlign: 'left'
        }}
      >
        <p
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: 'var(--color-graphite)',
            marginBottom: '16px'
          }}
        >
          Thoda timepass hai, kuch purane jokes hain, kuch naye memes hain... aur haan, Dora ki mummy ka case abhi bhi pending hai.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            backgroundColor: 'var(--color-ivory)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            fontSize: '0.85rem'
          }}
        >
          <MusicNotes size={20} color="var(--color-cobalt)" weight="bold" />
          <span>
            Neeche bar se ambient sound on/off kar sakti ho agar mood ho.
          </span>
        </div>
      </div>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={handleStart}
        className="btn btn-cobalt"
        style={{
          padding: '14px 28px',
          minWidth: '240px',
          marginBottom: '20px',
          gap: '10px'
        }}
      >
        <span>CHALO, DEKHTE HAIN!</span>
        <ArrowRight size={22} weight="bold" />
      </button>

      {/* Footer Line */}
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          fontWeight: 500
        }}
      >
        Waise entry free hai. Nakhre optional hain. :P
      </p>
    </div>
  );
};
