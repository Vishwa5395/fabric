import React, { Suspense, lazy, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/common/ToastProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HeaderNav } from './components/common/HeaderNav';
import { GlobalAudioBar } from './components/common/GlobalAudioBar';
import { SettingsSheet } from './components/common/SettingsSheet';
import { InAppBrowserBanner } from './components/common/InAppBrowserBanner';
import { BackgroundHearts } from './components/common/BackgroundHearts';
import { audioManager } from './services/audioManager';

// Lazy load department pages for light mobile data consumption
const Welcome = lazy(() => import('./pages/Welcome').then(m => ({ default: m.Welcome })));
const HQ = lazy(() => import('./pages/HQ').then(m => ({ default: m.HQ })));
const NotebookList = lazy(() => import('./pages/NotebookList').then(m => ({ default: m.NotebookList })));
const NotebookEditor = lazy(() => import('./pages/NotebookEditor').then(m => ({ default: m.NotebookEditor })));
const Memes = lazy(() => import('./pages/Memes').then(m => ({ default: m.Memes })));
const AudioDiary = lazy(() => import('./pages/AudioDiary').then(m => ({ default: m.AudioDiary })));
const AudioEditor = lazy(() => import('./pages/AudioEditor').then(m => ({ default: m.AudioEditor })));
const Music = lazy(() => import('./pages/Music').then(m => ({ default: m.Music })));
const Court = lazy(() => import('./pages/Court').then(m => ({ default: m.Court })));
const GameRoom = lazy(() => import('./pages/GameRoom').then(m => ({ default: m.GameRoom })));
const TruthOrDare = lazy(() => import('./pages/TruthOrDare').then(m => ({ default: m.TruthOrDare })));
const Museum = lazy(() => import('./pages/Museum').then(m => ({ default: m.Museum })));
const CaseDetails = lazy(() => import('./pages/CaseDetails').then(m => ({ default: m.CaseDetails })));
const Achievements = lazy(() => import('./pages/Achievements').then(m => ({ default: m.Achievements })));
const Final = lazy(() => import('./pages/Final').then(m => ({ default: m.Final })));
const DataInspector = lazy(() => import('./pages/DataInspector').then(m => ({ default: m.DataInspector })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

const LoadingFallback: React.FC = () => (
  <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
    <div className="badge badge-lime">Loading...</div>
  </div>
);

const AppContent: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    // Start Sukoon Dhun by default on opening the website
    audioManager.playAmbient().catch(() => {});

    // Browser autoplay policy handler: starts once on first user interaction if not paused
    const startAudioOnInteraction = (e: Event) => {
      // Remove all interaction listeners immediately so it never fires again
      window.removeEventListener('pointerdown', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
      window.removeEventListener('click', startAudioOnInteraction);

      // If user tapped a button, control, or link (e.g. Pause, Stop, Volume), don't trigger ambient autoplay
      const target = e.target as HTMLElement | null;
      if (target?.closest('button') || target?.closest('input') || target?.closest('a')) {
        return;
      }

      if (!audioManager.isUserPausedAmbient() && !audioManager.isAmbientActive()) {
        audioManager.playAmbient().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', startAudioOnInteraction);
    window.addEventListener('touchstart', startAudioOnInteraction);
    window.addEventListener('click', startAudioOnInteraction);

    return () => {
      window.removeEventListener('pointerdown', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
      window.removeEventListener('click', startAudioOnInteraction);
    };
  }, []);

  // Determine page title based on path
  const getHeaderTitle = (): string => {
    const p = location.pathname;
    if (p === '/') return 'The Welcome Desk';
    if (p === '/hq') return 'Headquarters';
    if (p.startsWith('/notebook')) return 'Classified Notebook';
    if (p.startsWith('/memes')) return 'Meme Department';
    if (p.startsWith('/audio')) return 'Audio Diary';
    if (p.startsWith('/music')) return 'Background Music';
    if (p.startsWith('/court')) return 'Meme Court';
    if (p.startsWith('/games/truth-or-dare') || p.startsWith('/truth-or-dare')) return 'Truth or Dare';
    if (p.startsWith('/games')) return 'Game Room';
    if (p.startsWith('/museum')) return 'Inside Joke Museum';
    if (p.startsWith('/achievements')) return 'Task & To-Do Wall';
    if (p.startsWith('/data') || p.startsWith('/inspector')) return 'Data Inspector';
    if (p.startsWith('/final')) return 'Final Transmission';
    return 'The Unofficial Fun Dept';
  };

  return (
    <div className="app-container">
      {/* Little subtle statically moving background hearts */}
      <BackgroundHearts />

      {/* In-app Browser Warning */}
      <InAppBrowserBanner />

      {/* Persistent Header with HQ return & Settings */}
      {location.pathname !== '/' && (
        <HeaderNav
          title={getHeaderTitle()}
          onOpenSettings={() => setIsSettingsOpen(true)}
          showBack={location.pathname !== '/hq'}
        />
      )}

      {/* Main Routes wrapped in ErrorBoundary & Suspense */}
      <main style={{ flex: 1 }}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary departmentName="Welcome Desk">
                  <Welcome />
                </ErrorBoundary>
              }
            />
            <Route
              path="/hq"
              element={
                <ErrorBoundary departmentName="Headquarters">
                  <HQ />
                </ErrorBoundary>
              }
            />
            <Route
              path="/notebook"
              element={
                <ErrorBoundary departmentName="Classified Notebook">
                  <NotebookList onOpenSettings={() => setIsSettingsOpen(true)} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/notebook/new"
              element={
                <ErrorBoundary departmentName="Notebook Editor">
                  <NotebookEditor />
                </ErrorBoundary>
              }
            />
            <Route
              path="/notebook/:id"
              element={
                <ErrorBoundary departmentName="Notebook Editor">
                  <NotebookEditor />
                </ErrorBoundary>
              }
            />
            <Route
              path="/memes"
              element={
                <ErrorBoundary departmentName="Meme Department">
                  <Memes />
                </ErrorBoundary>
              }
            />
            <Route
              path="/audio"
              element={
                <ErrorBoundary departmentName="Audio Diary">
                  <AudioDiary />
                </ErrorBoundary>
              }
            />
            <Route
              path="/audio/edit/:id"
              element={
                <ErrorBoundary departmentName="Audio Editor">
                  <AudioEditor />
                </ErrorBoundary>
              }
            />
            <Route
              path="/music"
              element={
                <ErrorBoundary departmentName="Background Music">
                  <Music />
                </ErrorBoundary>
              }
            />
            <Route
              path="/court"
              element={
                <ErrorBoundary departmentName="Meme Court">
                  <Court />
                </ErrorBoundary>
              }
            />
            <Route
              path="/games"
              element={
                <ErrorBoundary departmentName="Game Room">
                  <GameRoom />
                </ErrorBoundary>
              }
            />
            <Route
              path="/games/truth-or-dare"
              element={
                <ErrorBoundary departmentName="Truth or Dare">
                  <TruthOrDare />
                </ErrorBoundary>
              }
            />
            <Route
              path="/truth-or-dare"
              element={
                <ErrorBoundary departmentName="Truth or Dare">
                  <TruthOrDare />
                </ErrorBoundary>
              }
            />
            <Route
              path="/museum"
              element={
                <ErrorBoundary departmentName="Inside Joke Museum">
                  <Museum />
                </ErrorBoundary>
              }
            />
            <Route
              path="/museum/:caseId"
              element={
                <ErrorBoundary departmentName="Case Details">
                  <CaseDetails />
                </ErrorBoundary>
              }
            />
            <Route
              path="/achievements"
              element={
                <ErrorBoundary departmentName="Achievement Wall">
                  <Achievements />
                </ErrorBoundary>
              }
            />
            <Route
              path="/final"
              element={
                <ErrorBoundary departmentName="Final Transmission">
                  <Final />
                </ErrorBoundary>
              }
            />
            <Route
              path="/data"
              element={
                <ErrorBoundary departmentName="Data Inspector">
                  <DataInspector />
                </ErrorBoundary>
              }
            />
            <Route
              path="/inspector"
              element={
                <ErrorBoundary departmentName="Data Inspector">
                  <DataInspector />
                </ErrorBoundary>
              }
            />
            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
        </Suspense>
      </main>

      {/* Global Ambient Audio Bar */}
      <GlobalAudioBar />

      {/* Settings & Backup Sheet */}
      <SettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ToastProvider>
  );
};

