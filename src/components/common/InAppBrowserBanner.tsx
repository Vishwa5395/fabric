import React, { useState } from 'react';
import { Warning, X } from '@phosphor-icons/react';
import { detectEnvironment } from '../../services/envGuards';

export const InAppBrowserBanner: React.FC = () => {
  const env = detectEnvironment();
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed || !env.isInAppBrowser) {
    return null;
  }

  return (
    <div
      role="alert"
      style={{
        backgroundColor: 'var(--color-coral)',
        color: 'var(--color-graphite)',
        borderBottom: 'var(--border-width) solid var(--color-graphite)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '0.85rem',
        fontWeight: 600
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Warning size={20} weight="bold" />
        <span>
          Behtar experience ke liye Chrome ya Safari mein kholo. Yahan recording aur saved data theek se kaam nahi karte.
        </span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        style={{
          border: 'none',
          background: 'none',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex'
        }}
      >
        <X size={18} weight="bold" />
      </button>
    </div>
  );
};

