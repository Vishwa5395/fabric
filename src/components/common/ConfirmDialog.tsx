import React, { useRef, useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Haan, Delete Karo',
  cancelLabel = 'Rehne Do',
  onConfirm,
  onCancel
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        cancelBtnRef.current?.focus();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      style={{
        margin: 'auto',
        maxWidth: '400px',
        width: '90%',
        padding: '24px',
        backgroundColor: 'var(--bg-card)',
        border: 'var(--border-width) solid var(--color-graphite)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-retro)',
        color: 'var(--color-graphite)'
      }}
    >
      <h3 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>{title}</h3>
      <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{message}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          ref={cancelBtnRef}
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn btn-coral"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
};

