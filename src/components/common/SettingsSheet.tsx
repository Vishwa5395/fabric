import React, { useEffect, useState, useRef } from 'react';
import { X, DownloadSimple, UploadSimple, Warning, CheckCircle, Database } from '@phosphor-icons/react';
import {
  isStoragePersisted,
  getStorageEstimate,
  getAllDiaryEntries,
  getAllRecordings,
  getPreferences,
  savePreferences,
  UserPrefs
} from '../../services/storage';
import { exportBackupZip, importBackupZip } from '../../services/backup';
import { useToast } from './ToastProvider';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  onDataChanged
}) => {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<UserPrefs>(getPreferences());
  const [persisted, setPersisted] = useState<boolean>(false);
  const [storageUsage, setStorageUsage] = useState<string>('0 KB');
  const [diaryCount, setDiaryCount] = useState<number>(0);
  const [recCount, setRecCount] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadStatus = async () => {
    try {
      const isPersist = await isStoragePersisted();
      setPersisted(isPersist);

      const est = await getStorageEstimate();
      if (est.usage) {
        const kb = Math.round(est.usage / 1024);
        if (kb > 1024) {
          setStorageUsage(`${(kb / 1024).toFixed(1)} MB`);
        } else {
          setStorageUsage(`${kb} KB`);
        }
      }

      const { entries } = await getAllDiaryEntries();
      setDiaryCount(entries.length);

      const { recordings } = await getAllRecordings();
      setRecCount(recordings.length);
    } catch (e) {
      console.warn('Status load error:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPrefs(getPreferences());
      loadStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate days since last backup
  let backupStatusText = 'Abhi tak backup nahi liya';
  let isBackupOverdue = false;
  if (prefs.lastBackup) {
    const lastDate = new Date(prefs.lastBackup);
    const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      backupStatusText = 'Last backup: Aaj liya tha';
    } else if (diffDays === 1) {
      backupStatusText = 'Last backup: Kal liya tha';
    } else {
      backupStatusText = `Last backup: ${diffDays} din pehle`;
      if (diffDays >= 14) {
        isBackupOverdue = true;
      }
    }
  } else if (diaryCount > 0 || recCount > 0) {
    isBackupOverdue = true;
  }

  const handleToggleSfx = (e: React.ChangeEvent<HTMLInputElement>) => {
    const soundEffects = e.target.checked;
    savePreferences({ soundEffects });
    setPrefs(prev => ({ ...prev, soundEffects }));
  };

  const handleToggleInternetMemes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const internetMemes = e.target.checked;
    savePreferences({ internetMemes });
    setPrefs(prev => ({ ...prev, internetMemes }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { blob, filename } = await exportBackupZip();

      // Check if Web Share API with files is supported
      const file = new File([blob], filename, { type: 'application/zip' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Unofficial Fun Department Backup',
            files: [file]
          });
          showToast('Backup share ho gaya!', 'success');
          setIsExporting(false);
          loadStatus();
          return;
        } catch {
          // Share was cancelled or failed, fall back to download
        }
      }

      // Normal download fallback (also works on iOS Safari)
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);

      showToast('Backup file download ho gayi!', 'success');
      loadStatus();
    } catch (err) {
      console.error(err);
      showToast('Backup download nahi ho paaya.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const res = await importBackupZip(file);
      if (res.success) {
        showToast(res.message, 'success', 5000);
        await loadStatus();
        if (onDataChanged) {
          onDataChanged();
        }
      } else {
        showToast(res.message, 'error', 5000);
      }
    } catch {
      showToast('Import mein error aaya. Dobara try karein.', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-heading"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(32, 35, 41, 0.75)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          border: 'var(--border-width) solid var(--color-graphite)',
          boxShadow: 'var(--shadow-retro)',
          padding: '24px',
          overflowY: 'auto',
          color: 'var(--color-graphite)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 id="settings-heading" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            Settings &amp; Backup
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border-width) solid var(--color-graphite)',
              backgroundColor: 'var(--color-ivory)',
              display: 'flex'
            }}
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Honest Privacy Notice */}
        <div
          style={{
            backgroundColor: 'var(--color-ivory)',
            border: 'var(--border-width) solid var(--color-graphite)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            lineHeight: 1.4
          }}
        >
          <strong>🔒 100% Private &amp; Offline:</strong> Aapki saari diary entries aur voice notes sirf aapke is phone / browser mein rehte hain. Koi server ya cloud nahi hai. Agar browser data clear ho gaya toh ye delete ho sakta hai, isliye <strong>Backup</strong> lena zaroori hai.
        </div>

        {/* Backup Banner */}
        <div
          style={{
            backgroundColor: isBackupOverdue ? 'var(--color-coral)' : 'var(--color-lime)',
            border: 'var(--border-width) solid var(--color-graphite)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {isBackupOverdue ? <Warning size={24} weight="bold" /> : <CheckCircle size={24} weight="bold" />}
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            {backupStatusText}
            {isBackupOverdue && (
              <div style={{ fontSize: '0.75rem', fontWeight: 500, marginTop: '2px' }}>
                Aapke paas data hai par recent backup nahi hai. Ek baar download kar lijiye.
              </div>
            )}
          </div>
        </div>

        {/* Storage Status */}
        <div className="card" style={{ padding: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Database size={18} weight="bold" color="var(--color-cobalt)" />
            <h3 style={{ fontSize: '0.95rem' }}>Storage Status</h3>
          </div>
          <div style={{ fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>Diary Entries: <strong>{diaryCount}</strong></div>
            <div>Recordings: <strong>{recCount}</strong></div>
            <div>Space Used: <strong>{storageUsage}</strong></div>
            <div>Permanent Mode: <strong>{persisted ? 'Yes (Protected)' : 'Standard'}</strong></div>
          </div>
          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.location.hash = '#/data';
              }}
              className="btn btn-outline"
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '0.82rem',
                padding: '8px',
                color: 'var(--color-cobalt)',
                fontWeight: 700
              }}
            >
              <span>Live Database & Media Inspector Kholo →</span>
            </button>
          </div>
        </div>

        {/* Export / Import Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <DownloadSimple size={20} weight="bold" />
            <span>{isExporting ? 'Export ho raha hai...' : 'Backup Download Karo (.zip)'}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <UploadSimple size={20} weight="bold" />
            <span>{isImporting ? 'Import ho raha hai...' : 'Purana Backup Restore Karo (.zip)'}</span>
          </button>
        </div>

        {/* Toggles */}
        <div style={{ borderTop: 'var(--border-width) solid var(--color-graphite)', paddingTop: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Preferences</h3>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Retro Sound Effects (SFX)</span>
            <input
              type="checkbox"
              checked={prefs.soundEffects}
              onChange={handleToggleSfx}
              style={{ width: '20px', height: '20px', accentColor: 'var(--color-lime)', cursor: 'pointer' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Internet Memes Tab</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Dusre servers ko aapka IP dikhta hai
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.internetMemes}
              onChange={handleToggleInternetMemes}
              style={{ width: '20px', height: '20px', accentColor: 'var(--color-lime)', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

