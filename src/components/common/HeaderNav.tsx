import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Gear, ShieldCheck } from '@phosphor-icons/react';

interface HeaderNavProps {
  title?: string;
  onOpenSettings: () => void;
  showBack?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  title,
  onOpenSettings,
  showBack = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHQ = location.pathname === '/hq' || location.pathname === '/';

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: 'var(--border-width) solid var(--color-graphite)',
        position: 'sticky',
        top: 0,
        zIndex: 500
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {showBack && !isHQ && (
          <button
            type="button"
            onClick={() => navigate('/hq')}
            aria-label="Wapas HQ jao"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              backgroundColor: 'var(--color-ivory)',
              border: 'var(--border-width) solid var(--color-graphite)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-retro-sm)',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--color-graphite)'
            }}
          >
            <ArrowLeft size={16} weight="bold" />
            <span>HQ</span>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={20} weight="fill" color="var(--color-cobalt)" />
          <h1
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--color-graphite)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title || 'The Unofficial Fun Dept'}
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings aur Backup kholo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            backgroundColor: 'var(--color-ivory)',
            border: 'var(--border-width) solid var(--color-graphite)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-retro-sm)',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: 'var(--color-graphite)'
          }}
        >
          <Gear size={16} weight="bold" />
          <span>Backup</span>
        </button>
      </div>
    </header>
  );
};

