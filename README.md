# The Unofficial Fun Department

A private, client-side-only web gift application built specifically for **Mausami Ji** for mobile phone use (Android Chrome & iPhone Safari).

Built with React, Vite, TypeScript, IndexedDB (`idb`), HashRouter, CSS variables, and `@phosphor-icons/react`.

---

## 🔒 Privacy & Architecture Principles

1. **100% Client-Side Privacy**: All diary entries and voice memos live **only** on her device in IndexedDB (`ufd`). There is no remote backend, no telemetry, no tracking, and no third-party data transmission.
2. **Zero Leaks**: Network requests are strictly allowlisted. No diary text or audio recordings ever enter logs, URLs, or network calls.
3. **Data Ownership**: Data belongs exclusively to the browser session. A complete **Backup & Restore (.zip)** engine allows exporting and restoring data across devices.
4. **Offline PWA**: Full progressive web app with service worker caching of all application shell files and fonts.

---

## 🎨 Visual Identity & Frontend Lock

- **Exact Palette**:
  - Graphite: `#202329`
  - Warm Ivory: `#F3F0E9`
  - Cobalt: `#5478E8`
  - Lime: `#C5E66A`
  - Muted Coral: `#F28C62`
- **Typography**: Self-hosted Manrope and Inter with Noto Sans Devanagari fallback (via `@fontsource/*`).
- **Icons**: `@phosphor-icons/react` exclusively.
- **Accessibility & Motion**: `prefers-reduced-motion` honored everywhere, contrast-compliant text (Graphite text on Lime/Coral, large bold Cobalt, no small Cobalt text on Ivory), minimum 44px touch targets.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ (tested on Node v22.14.0)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Running Automated Tests
```bash
npm test
```
Runs 24 automated unit and component tests with Vitest + JSDOM + Fake-IndexedDB.

### 5. Production Build
```bash
npm run build
```
Generates production PWA assets in `dist/`.

---

## 🗄️ Storage & Backup Mechanics

### IndexedDB Database: `ufd`
- **`diaryEntries`**: `{ id, title, body, mood?, createdAt, updatedAt }`
- **`diaryDrafts`**: `{ key, title, body, mood?, savedAt }` (debounced ~800ms autosave)
- **`recordings`**: `{ id, title, description?, tags[], createdAt, durationMs, mimeType, sizeBytes, favourite, blob }`
- **`recordingDrafts`**: `{ sessionId, mimeType, chunks[], startedAt }` (crash recovery)
- **`kv`**: key-value store for achievements, Kaand meter records, meme/song favourites.

### Backup & Restore (.zip)
- **Export**: Packs `manifest.json`, `diary.json`, `recordings.json`, `audio/{id}.{ext}`, and `progress.json` into a single zip using `fflate`. Offers Web Share API on mobile with automatic file download fallback.
- **Import**: Validates zip contents using `zod`, merges entries by id (keeping newer `updatedAt`), skips corrupt records with a friendly summary count.

---

## 🎧 Audio Manager Architecture

- Single global sound manager mounted above the router.
- **Ambient Dhun**: Off by default; plays only when explicitly tapped; volume controlled via Web Audio GainNode.
- **Strict Single-Playback Rule**: Starting a voice memo recording or playing a saved memo immediately pauses ambient audio. Ambient never resumes automatically.
- **Retro SFX**: Web Audio API oscillator synthesis (zero external audio file dependencies).

---

## 📋 Department Directory

1. **Welcome Desk (`/`)**: Personalized welcome, ambient toggle, and entry gate.
2. **Headquarters (`/hq`)**: Dynamic time-of-day greeting, department cards, and special transmission card.
3. **Classified Notebook (`/notebook`)**: 100% private notes, prompt strip, draft recovery, unicode search, and mood tags.
4. **Meme Department (`/memes`)**: Taaza Internet feed featuring fresh Indian internet memes, inline shuffle, favourite bookmarks, and sharing.
5. **Audio Diary (`/audio`)**: In-browser recorder with live canvas waveform, crash draft recovery, tag filtering, playback, and WAV trimmer (~22.05 kHz).
6. **Background Music (`/music`)**: Curated tracks (Darkhaast, Raabta by Arijit Singh, Nirmohi by Amit Trivedi, and Love Me Not by Ravyn Lenae) with 1-tap instant audio preview and official Spotify embeds.
7. **Meme Court (`/court`)**: 7-round courtroom trial with trait scoring (CHAOS, OVERTHINK, DETECTIVE) and 5 official titles.
8. **Inside Joke Museum (`/museum`)**: The classified case files including Case 001: "DORA KI MUMMY KAHAN HAI?".
9. **Achievement Wall (`/achievements`)**: Badge system tracking milestones without pressure or public leaderboards.
10. **Final Transmission (`/final`)**: Sincere closing note in an interactive openable envelope.

---

## 📦 Assets & Confirmations Needed From Owner

The following items should be supplied or reviewed by the owner before final gifting:
1. **Ambient Track**: Provide `public/audio/ambient.m4a` (+ optional `.ogg` fallback) with the desired looping background music. If omitted, the UI gracefully displays *"Music file abhi nahi mili"*.
2. **App Icons**: Provide final 192x192 and 512x512 PNG icons in `public/icons/icon-192.png` and `public/icons/icon-512.png`. Placeholder assets are currently generated.
3. **Song Verification**: Verify preferred versions for *Raabta* and *Dooron Dooron* in `src/data/songs.json` and set `verified: true` with Spotify track IDs.
4. **Case Files**: Review the 4 case files in `src/data/caseFiles.ts` marked with `ownerReview: true`.

---

## 🌐 Deployment Instructions

Since this app uses **HashRouter** (`/#/`), all routes work seamlessly on any static web host without complex rewrite rules. **HTTPS is required** for mic recording and PWA functionality.

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add header `X-Frame-Options: SAMEORIGIN` and `Referrer-Policy: no-referrer`.

### Vercel
1. Framework Preset: `Vite`
2. Build command: `npm run build`
3. Output Directory: `dist`

### GitHub Pages / Cloudflare Pages
1. Build output: `dist`
2. Ensure custom domain has SSL enabled.

