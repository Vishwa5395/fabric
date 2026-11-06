import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass,
  Plus,
  SortAscending,
  SortDescending,
  LockKey,
  CalendarBlank,
  FileText
} from '@phosphor-icons/react';
import {
  getAllDiaryEntries,
  getDiaryDraft,
  DiaryEntry,
  DiaryDraft
} from '../services/storage';

interface NotebookListProps {
  onOpenSettings: () => void;
}

export const NotebookList: React.FC<NotebookListProps> = ({ onOpenSettings }) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [draft, setDraft] = useState<DiaryDraft | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const { entries: all } = await getAllDiaryEntries();
      setEntries(all);

      // Check for unsaved "new" draft
      const newDraft = await getDiaryDraft('new');
      if (newDraft && (newDraft.title.trim() || newDraft.body.trim())) {
        setDraft(newDraft);
      } else {
        setDraft(null);
      }
    } catch (e) {
      console.warn('Failed to load diary entries', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Normalised search (case-insensitive + Unicode-normalised NFC)
  const normalizedQuery = searchQuery.trim().normalize('NFC').toLowerCase();

  const filteredEntries = entries
    .filter(e => {
      if (!normalizedQuery) return true;
      const titleNorm = (e.title || '').normalize('NFC').toLowerCase();
      const bodyNorm = (e.body || '').normalize('NFC').toLowerCase();
      return titleNorm.includes(normalizedQuery) || bodyNorm.includes(normalizedQuery);
    })
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span className="badge badge-cobalt" style={{ marginBottom: '6px' }}>TOP SECRET</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            Jo mann mein aaye, likh daalo.
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/notebook/new')}
          className="btn btn-primary"
          style={{ padding: '8px 14px', flexShrink: 0 }}
        >
          <Plus size={18} weight="bold" />
          <span>Nayi Entry </span>
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <MagnifyingGlass
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diary notes..."
            aria-label="Search diary notes"
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>

        <button
          type="button"
          onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
          className="btn btn-outline"
          aria-label={sortOrder === 'newest' ? 'Sort oldest first' : 'Sort newest first'}
          style={{ padding: '8px 12px', flexShrink: 0 }}
        >
          {sortOrder === 'newest' ? <SortDescending size={20} /> : <SortAscending size={20} />}
          <span style={{ fontSize: '0.8rem' }}>{sortOrder === 'newest' ? 'New one First' : 'Purana pehle'}</span>
        </button>
      </div>

      {/* Pinned Unsaved Draft Card */}
      {draft && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/notebook/new')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/notebook/new');
            }
          }}
          className="card"
          style={{
            marginBottom: '16px',
            backgroundColor: 'var(--color-ivory)',
            border: '2px dashed var(--color-coral)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="badge badge-coral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={14} weight="bold" />
              <span>Adhuri entry (draft)</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resume karne ke liye tap karo</span>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px' }}>
            {draft.title || 'Untitled Draft'}
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {draft.body || '(Khali draft)'}
          </p>
        </div>
      )}

      {/* Empty States */}
      {!loading && entries.length === 0 && !draft && (
        <div className="card" style={{ textAlign: 'center', padding: '36px 16px', marginBottom: '20px' }}>
          <LockKey size={36} color="var(--color-cobalt)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>
            Abhi tak kuch nahi likha.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
            Pehla page aapka hai. Yahan sab 100% private rehta hai.
          </p>
          <button
            type="button"
            onClick={() => navigate('/notebook/new')}
            className="btn btn-primary"
          >
            <Plus size={18} weight="bold" />
            <span>Pehli Entry Likho</span>
          </button>
        </div>
      )}

      {/* No Search Results */}
      {!loading && entries.length > 0 && filteredEntries.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px', marginBottom: '20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '14px' }}>
            Kuch nahi mila. Alag shabd try karein?
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="btn btn-outline"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Entries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        {filteredEntries.map(entry => {
          const updatedDate = new Date(entry.updatedAt).toLocaleDateString('hi-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return (
            <div
              key={entry.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/notebook/${entry.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/notebook/${entry.id}`);
                }
              }}
              className="card"
              style={{
                cursor: 'pointer',
                borderLeft: '5px solid var(--color-cobalt)',
                transition: 'transform 0.1s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  {entry.title || 'Untitled Note'}
                </h2>
                {entry.mood && (
                  <span className="badge badge-lime">{entry.mood}</span>
                )}
              </div>

              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '10px'
                }}
              >
                {entry.body}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <CalendarBlank size={14} />
                <span>{updatedDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          padding: '12px',
          borderTop: '1px solid var(--border-light)'
        }}
      >
        <span>Ye sab sirf aapke phone mein rehta hai. </span>
        <button
          type="button"
          onClick={onOpenSettings}
          style={{
            fontWeight: 700,
            color: 'var(--color-graphite)',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0
          }}
        >
          Backup lena mat bhulna.
        </button>
      </div>
    </div>
  );
};
