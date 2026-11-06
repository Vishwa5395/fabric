import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvelopeSimple, EnvelopeOpen, ArrowLeft, Heart } from '@phosphor-icons/react';
import { FINAL_MESSAGE } from '../data/finalMessage';

export const Final: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div
      style={{
        padding: '24px 16px',
        maxWidth: '560px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '24px' }}>
        <span className="badge badge-coral" style={{ marginBottom: '8px' }}>FINAL TRANSMISSION</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-graphite)' }}>
          {FINAL_MESSAGE.heading}
        </h1>
      </div>

      {!isOpen ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          className="card"
          style={{
            maxWidth: '420px',
            width: '100%',
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#FFFDF9',
            border: '3px solid var(--color-graphite)',
            boxShadow: 'var(--shadow-retro)',
            transition: 'transform 0.15s ease'
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-coral)',
              border: 'var(--border-width) solid var(--color-graphite)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: 'var(--color-graphite)'
            }}
          >
            <EnvelopeSimple size={40} weight="bold" />
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
            Ek band lifaafa hai...
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Tap ya Enter karke kholein.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '10px 24px' }}
          >
            Lifaafa Kholo
          </button>
        </div>
      ) : (
        <div
          className="card"
          style={{
            maxWidth: '460px',
            width: '100%',
            padding: '28px 24px',
            backgroundColor: '#FFFFFF',
            borderTop: '6px solid var(--color-coral)',
            animation: 'fadeIn 0.4s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <EnvelopeOpen size={24} weight="bold" color="var(--color-coral)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {FINAL_MESSAGE.subheading}
            </span>
          </div>

          {FINAL_MESSAGE.body.map((para, idx) => (
            <p
              key={idx}
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.6,
                color: 'var(--color-graphite)',
                marginBottom: '16px'
              }}
            >
              {para}
            </p>
          ))}

          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-graphite)' }}>
              {FINAL_MESSAGE.signature}
            </span>
            <Heart size={20} weight="fill" color="var(--color-coral)" />
          </div>
        </div>
      )}

      {/* Back to HQ Button */}
      <button
        type="button"
        onClick={() => navigate('/hq')}
        className="btn btn-outline"
        style={{ marginTop: '28px', padding: '10px 20px' }}
      >
        <ArrowLeft size={18} weight="bold" />
        <span>HQ Par Wapas</span>
      </button>
    </div>
  );
};

