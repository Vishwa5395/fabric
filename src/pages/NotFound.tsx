import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WarningCircle, ArrowLeft } from '@phosphor-icons/react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: '40px 16px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}
    >
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '32px 20px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-coral)',
            border: 'var(--border-width) solid var(--color-graphite)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--color-graphite)'
          }}
        >
          <WarningCircle size={32} weight="bold" />
        </div>

        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '10px' }}>
          Ye kamra department mein nahi hai.
        </h1>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Lagta hai rasta bhatak gaye hain. Tension mat lijiye, HQ ka rasta khula hai.
        </p>

        <button
          type="button"
          onClick={() => navigate('/hq')}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <ArrowLeft size={18} weight="bold" />
          <span>HQ Par Wapas Jao</span>
        </button>
      </div>
    </div>
  );
};

