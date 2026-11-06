import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FloppyDisk,
  Trash,
  Sparkle,
  ArrowClockwise,
  Check
} from '@phosphor-icons/react';
import {
  getDiaryEntry,
  saveDiaryEntry,
  deleteDiaryEntry,
  getDiaryDraft,
  saveDiaryDraft,
  clearDiaryDraft,
  DiaryEntry,
  StorageError
} from '../services/storage';
import { achievementEngine } from '../services/achievements';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastProvider';

const PROMPTS = [
  'Aaj kuch aisa hua jo shayad kisi ko nahi bataungi.',
  'Aaj ka sabse dramatic moment.',
  'Ek baat jo kehni thi, par keh nahi paayi.',
  'Aaj agar meri life ek movie hoti, toh uska title kya hota?',
  'Aaj kis baat ne mujhe sach mein khush kiya?'
];

const MOODS = ['Khush', 'Shaant', 'Thaka hua', 'Dramatic', 'Overthinking', 'Gussa'];

export const NotebookEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [mood, setMood] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string>('');

  // Status chip: 'saved' | 'draftSaved' | 'unsaved'
  const [status, setStatus] = useState<'saved' | 'draftSaved' | 'unsaved'>('saved');

  // Prompt strip
  const [promptIndex, setPromptIndex] = useState<number>(0);
  const [showPromptStrip, setShowPromptStrip] = useState<boolean>(true);

  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const entryId = useRef<string>(isNew ? Math.random().toString(36).slice(2, 11) : id);
  const draftKey = isNew ? 'new' : id;

  // Load existing entry or draft
  useEffect(() => {
    async function init() {
      if (!isNew && id) {
        const existing = await getDiaryEntry(id);
        if (existing) {
          setTitle(existing.title);
          setBody(existing.body);
          setMood(existing.mood || '');
          setCreatedAt(existing.createdAt);
        }
      }

      // Check if draft exists
      const draft = await getDiaryDraft(draftKey);
      if (draft) {
        // If it was a draft for new, populate it
        if (isNew) {
          setTitle(draft.title);
          setBody(draft.body);
          setMood(draft.mood || '');
          setStatus('draftSaved');
        }
      }
    }

    init();
  }, [id, isNew, draftKey]);

  // Debounced Autosave to drafts (~800ms)
  const triggerAutosave = useCallback((t: string, b: string, m: string) => {
    setStatus('unsaved');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await saveDiaryDraft({
          key: draftKey,
          title: t,
          body: b,
          mood: m || undefined,
          savedAt: new Date().toISOString()
        });
        setStatus('draftSaved');
      } catch {
        // autosave failed silently
      }
    }, 800);
  }, [draftKey]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    triggerAutosave(val, body, mood);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setBody(val);
    triggerAutosave(title, val, mood);
  };

  const handleMoodSelect = (m: string) => {
    const newMood = mood === m ? '' : m;
    setMood(newMood);
    triggerAutosave(title, body, newMood);
  };

  const handleUsePromptAsTitle = () => {
    const currentPrompt = PROMPTS[promptIndex];
    setTitle(currentPrompt);
    triggerAutosave(currentPrompt, body, mood);
    setShowPromptStrip(false);
  };

  const handleShufflePrompt = () => {
    setPromptIndex(prev => (prev + 1) % PROMPTS.length);
  };

  // Explicit Save
  const handleSave = async () => {
    if (!title.trim() && !body.trim()) {
      showToast('Kripya kuch likhein pehle.', 'warning');
      return;
    }

    setIsSaving(true);
    const now = new Date().toISOString();
    const entryData: DiaryEntry = {
      id: entryId.current,
      title: title.trim() || 'Untitled Note',
      body: body.trim(),
      mood: mood || undefined,
      createdAt: createdAt || now,
      updatedAt: now
    };

    try {
      await saveDiaryEntry(entryData);
      await clearDiaryDraft(draftKey);
      setStatus('saved');
      showToast('Entry save ho gayi!', 'success');
      await achievementEngine.emit('diary_saved');
      navigate('/notebook');
    } catch (err: unknown) {
      if (err instanceof StorageError) {
        showToast(err.hinglishMessage, 'error', 5000);
      } else {
        showToast('Save nahi ho paya. Dobara try karein.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!id || isNew) return;
    try {
      await deleteDiaryEntry(id);
      showToast('Entry delete ho gayi.', 'info');
      navigate('/notebook');
    } catch {
      showToast('Delete nahi ho paaya.', 'error');
    }
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => navigate('/notebook')}
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} weight="bold" />
          <span>Wapas</span>
        </button>

        {/* Status Chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {status === 'saved' && (
            <span className="badge badge-lime" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} weight="bold" />
              <span>Saved</span>
            </span>
          )}
          {status === 'draftSaved' && (
            <span className="badge badge-cobalt" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>Draft save hua</span>
            </span>
          )}
          {status === 'unsaved' && (
            <span className="badge badge-coral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>Save nahi hua</span>
            </span>
          )}

          {!isNew && (
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              aria-label="Delete entry"
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                border: 'var(--border-width) solid var(--color-graphite)',
                backgroundColor: 'var(--color-coral)',
                display: 'flex',
                cursor: 'pointer'
              }}
            >
              <Trash size={16} weight="bold" />
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <FloppyDisk size={18} weight="bold" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Prompt Strip */}
      {showPromptStrip && (
        <div
          className="card"
          style={{
            marginBottom: '16px',
            padding: '12px 14px',
            backgroundColor: 'var(--color-ivory)',
            borderLeft: '4px solid var(--color-lime)',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: 800, color: 'var(--color-graphite)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkle size={16} weight="bold" color="var(--color-cobalt)" />
              <span>Prompt chahiye?</span>
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={handleShufflePrompt}
                style={{ cursor: 'pointer', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 700 }}
              >
                <ArrowClockwise size={14} /> Shuffle
              </button>
              <button
                type="button"
                onClick={() => setShowPromptStrip(false)}
                style={{ cursor: 'pointer', padding: '2px 6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
              >
                Skip
              </button>
            </div>
          </div>

          <p style={{ fontStyle: 'italic', color: 'var(--color-graphite)', marginBottom: '8px' }}>
            "{PROMPTS[promptIndex]}"
          </p>

          <button
            type="button"
            onClick={handleUsePromptAsTitle}
            className="btn btn-outline"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          >
            Use as title
          </button>
        </div>
      )}

      {/* Title Input */}
      <div style={{ marginBottom: '14px' }}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note ka Title..."
          aria-label="Note title"
          style={{
            width: '100%',
            fontSize: '1.25rem',
            fontWeight: 800,
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card)'
          }}
        />
      </div>

      {/* Mood Selector Chips */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
          Mood chuniye (optional):
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MOODS.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => handleMoodSelect(m)}
              className={`badge ${mood === m ? 'badge-cobalt' : 'badge-lime'}`}
              style={{
                cursor: 'pointer',
                padding: '6px 12px',
                fontSize: '0.8rem'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Body Area */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={body}
          onChange={handleBodyChange}
          placeholder="Jo mann mein aaye, likh daalo..."
          aria-label="Note body"
          rows={12}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1rem',
            lineHeight: 1.6,
            minHeight: '260px',
            resize: 'vertical',
            backgroundColor: 'var(--bg-card)'
          }}
        />
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Entry Delete Karein?"
        message="Pakka delete karna hai? Ye wapas nahi aayega."
        confirmLabel="Haan, Delete Karo"
        cancelLabel="Rehne Do"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};
