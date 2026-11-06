import React, { useState, useEffect } from 'react';
import {
  BookmarkSimple,
  ShareNetwork,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  Globe,
  Star,
  WarningCircle
} from '@phosphor-icons/react';
import { getKV, setKV } from '../services/storage';
import { achievementEngine } from '../services/achievements';
import { useToast } from '../components/common/ToastProvider';

interface InternetMemeItem {
  id: string;
  title: string;
  url: string;
  postLink: string;
  subreddit: string;
}

export const Memes: React.FC = () => {
  const { showToast } = useToast();
  const [memes, setMemes] = useState<InternetMemeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [favouriteMemes, setFavouriteMemes] = useState<InternetMemeItem[]>([]);
  const [viewMode, setViewMode] = useState<'feed' | 'favourites'>('feed');

  // Load favourites from KV
  useEffect(() => {
    getKV<InternetMemeItem[]>('ufd:internet_meme_favs', []).then(favs => {
      setFavouriteMemes(favs);
    });
    fetchInternetMemes();
  }, []);

  const fetchInternetMemes = async () => {
    setLoading(true);
    setError(false);
    const subreddits = ['IndianDankMemes', 'indiameme', 'IndianMeyMeys'];
    const sub = subreddits[Math.floor(Math.random() * subreddits.length)];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`https://meme-api.com/gimme/${sub}/12`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json() as { memes?: Array<{ title: string; url: string; postLink: string; subreddit: string; nsfw: boolean; spoiler: boolean }> };
      if (!data.memes || data.memes.length === 0) throw new Error('No memes returned');

      const safeMemes: InternetMemeItem[] = data.memes
        .filter(m => !m.nsfw && !m.spoiler && (m.url.endsWith('.jpg') || m.url.endsWith('.png') || m.url.endsWith('.webp') || m.url.includes('redd.it')))
        .map((m, idx) => ({
          id: `net-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: m.title,
          url: m.url,
          postLink: m.postLink,
          subreddit: m.subreddit
        }));

      if (safeMemes.length === 0) throw new Error('No safe memes');
      setMemes(safeMemes);
      setCurrentIndex(0);
      setViewMode('feed');
    } catch (e) {
      console.warn('Internet meme fetch failed:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const activeList = viewMode === 'favourites' ? favouriteMemes : memes;
  const currentMeme = activeList[currentIndex];

  const isCurrentFav = currentMeme
    ? favouriteMemes.some(f => f.url === currentMeme.url || f.id === currentMeme.id)
    : false;

  const toggleBookmark = async () => {
    if (!currentMeme) return;

    let nextFavs: InternetMemeItem[];
    if (isCurrentFav) {
      nextFavs = favouriteMemes.filter(f => f.url !== currentMeme.url && f.id !== currentMeme.id);
      showToast('Favourite se hata diya', 'info');
    } else {
      nextFavs = [...favouriteMemes, currentMeme];
      showToast('Favourite mein save ho gaya!', 'success');
      achievementEngine.emit('meme_favourited');
    }
    setFavouriteMemes(nextFavs);
    await setKV('ufd:internet_meme_favs', nextFavs);
  };

  const handlePrev = () => {
    if (activeList.length === 0) return;
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : activeList.length - 1));
  };

  const handleNext = () => {
    if (activeList.length === 0) return;
    setCurrentIndex(prev => (prev < activeList.length - 1 ? prev + 1 : 0));
  };

  const handleShare = async () => {
    if (!currentMeme) return;
    const shareData = {
      title: currentMeme.title,
      text: `${currentMeme.title}\n${currentMeme.url}\n\n— The Unofficial Fun Department`,
      url: currentMeme.postLink
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Meme share ho gaya!', 'success');
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(`${currentMeme.title}\n${currentMeme.url}`);
      showToast('Meme link copy ho gayi!', 'success');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeList.length, currentIndex]);

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="badge badge-coral" style={{ marginBottom: '6px' }}>TAAZA FEED</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            Taaza Internet Memes
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Seedha Indian internet aur comedy circles se. (Btw Source is Reddit)
          </p>
        </div>

        {/* Favourites Toggle Button */}
        <button
          type="button"
          onClick={() => {
            if (viewMode === 'feed') {
              setViewMode('favourites');
              setCurrentIndex(0);
            } else {
              setViewMode('feed');
              setCurrentIndex(0);
            }
          }}
          className={`btn ${viewMode === 'favourites' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '6px 12px', fontSize: '0.8rem', flexShrink: 0 }}
        >
          <Star size={16} weight={viewMode === 'favourites' ? 'fill' : 'bold'} />
          <span>Favs ({favouriteMemes.length})</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 16px' }}>
          <Globe size={32} color="var(--color-cobalt)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>
            Taaza memes aa rahe hain...
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Internet se fresh content filter ho raha hai.
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="card" style={{ textAlign: 'center', padding: '36px 16px' }}>
          <WarningCircle size={36} color="var(--color-coral)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>
            Internet se memes load nahi ho sake.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Network connection check karein ya dobara koshish karein.
          </p>
          <button
            type="button"
            onClick={fetchInternetMemes}
            className="btn btn-primary"
          >
            Dobara Try Karein
          </button>
        </div>
      )}

      {/* Empty Favourites State */}
      {!loading && !error && viewMode === 'favourites' && favouriteMemes.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '36px 16px' }}>
          <Star size={36} color="var(--color-coral)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>
            Abhi koi favourite meme nahi hai.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Feed mein kisi bhi meme par bookmark button dabakar save kar sakti hain!
          </p>
          <button
            type="button"
            onClick={() => setViewMode('feed')}
            className="btn btn-primary"
          >
            Feed Par Wapas Jao
          </button>
        </div>
      )}

      {/* Active Meme Card Display */}
      {!loading && !error && currentMeme && (
        <div>
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              marginBottom: '16px',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-retro)'
            }}
          >
            {/* Meme Image */}
            <div
              style={{
                width: '100%',
                maxHeight: '440px',
                minHeight: '220px',
                backgroundColor: 'var(--color-graphite)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              <img
                src={currentMeme.url}
                alt={currentMeme.title}
                style={{
                  width: '100%',
                  maxHeight: '440px',
                  objectFit: 'contain'
                }}
                onError={() => {
                  // If image fails, advance to next
                  handleNext();
                }}
              />
            </div>

            {/* Info & Caption */}
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-coral">
                  r/{currentMeme.subreddit}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {currentIndex + 1} / {activeList.length}
                </span>
              </div>

              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', lineHeight: 1.4 }}>
                {currentMeme.title}
              </h2>

              {/* Actions: Bookmark & Share */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '12px'
                }}
              >
                <button
                  type="button"
                  onClick={toggleBookmark}
                  className="btn btn-outline"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <BookmarkSimple
                    size={18}
                    weight={isCurrentFav ? 'fill' : 'bold'}
                    color={isCurrentFav ? 'var(--color-coral)' : 'currentColor'}
                  />
                  <span>{isCurrentFav ? 'Saved' : 'Bookmark'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="btn btn-outline"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <ShareNetwork size={18} weight="bold" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={handlePrev}
              className="btn btn-outline"
              aria-label="Previous meme"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <ArrowLeft size={18} weight="bold" />
              <span>Peeche</span>
            </button>

            <button
              type="button"
              onClick={fetchInternetMemes}
              className="btn btn-primary"
              aria-label="Fetch fresh memes"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Shuffle size={18} weight="bold" />
              <span>Naye Lao</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="btn btn-outline"
              aria-label="Next meme"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <span>Aage</span>
              <ArrowRight size={18} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
