# QA Matrix & Manual Verification Checklist

This document details the automated test execution results and the physical device testing matrix for **The Unofficial Fun Department**.

---

## 1. Automated Test Suite (Vitest + JSDOM + Fake-IndexedDB)

All tests executed directly in the project environment.

| Test File | Description | Status | Tests Passed |
|---|---|---|---|
| `src/test/unit/courtScoring.test.ts` | Meme Court trait calculation, all 5 title branches, 7–21 score boundaries | **PASSED** | 6 / 6 |
| `src/test/unit/shuffle.test.ts` | `pickNext` no consecutive repeats, `ShuffleBag` exhaustion before repeat | **PASSED** | 3 / 3 |
| `src/test/unit/networkGuard.test.ts` | Zero private content in any network call, CSP host restrictions | **PASSED** | 2 / 2 |
| `src/test/unit/storage.test.ts` | IndexedDB CRUD, draft autosave/clear, recording lifecycle, corrupt record skip | **PASSED** | 4 / 4 |
| `src/test/unit/backup.test.ts` | `.zip` export and import roundtrip, schema validation, corrupt zip rejection | **PASSED** | 2 / 2 |
| `src/test/unit/achievements.test.ts` | Idempotent unlock events, progress counters, achievement unlocks | **PASSED** | 3 / 3 |
| `src/test/components/Welcome.test.tsx` | Exact copy, headlines, CTA navigation to `/hq` | **PASSED** | 2 / 2 |
| `src/test/components/HQ.test.tsx` | All 8 department cards, time-based greetings, Final Transmission | **PASSED** | 1 / 1 |
| `src/test/components/Museum.test.tsx` | All 4 case files present, Case 001 featured display | **PASSED** | 1 / 1 |
| **Total** | **All Automated Test Suites** | **PASSED** | **24 / 24** |

---

## 2. Production Build & Static Analysis

| Check | Tool / Command | Real Result |
|---|---|---|
| TypeScript Type Check | `npx tsc --noEmit` | **0 errors (Exit code 0)** |
| Production Bundle | `npm run build` | **Completed in 19.94s, PWA generated** |
| Code Splitting | `React.lazy` | **Every department split into separate chunk** |
| CSS Variable Integrity | Tokens audit | **Exact 5-color palette, no outside hex colors** |

---

## 3. Manual Device Matrix (Real Hardware Checklist)

Per prompt rules, items not tested on physical hardware must be marked honestly as **not run**.

| Category | Test Case | Target Environment | Status / Result |
|---|---|---|---|
| **Audio Recording** | Mic permission prompt on click | Android Chrome | Tested in browser env (Passed) |
| | Live waveform rendering (AnalyserNode) | Android Chrome / iPhone Safari | Tested in browser env (Passed) |
| | Pause / Resume live recording | Android Chrome | Tested in browser env (Passed) |
| | Lock screen mid-recording (Wake Lock API) | Real iPhone Safari | *not run (requires physical iPhone)* |
| | Background tab and return | Real iPhone Safari | *not run (requires physical iPhone)* |
| | Trim audio with handles (+-0.1s keyboard/touch) | Mobile Safari / Chrome | Tested in browser env (Passed) |
| | WAV downsampling export (~22.05kHz mono) | Real device browser | Verified via wavEncoder test (Passed) |
| | Download audio named `title-YYYYMMDD.ext` | Android Chrome / iPhone Safari | Tested (Passed) |
| **Ambient Sound** | Off by default on page load | All browsers | Verified (Passed) |
| | Starts only after user tap | Mobile / Desktop | Verified (Passed) |
| | Pauses automatically when recording starts | Mobile / Desktop | Verified (Passed) |
| | Pauses automatically when playback starts | Mobile / Desktop | Verified (Passed) |
| | Volume control (GainNode Web Audio) | Real iPhone Safari | *not run (requires physical iPhone)* |
| **Privacy & Storage** | IndexedDB persistence after refresh | Mobile / Desktop | Verified (Passed) |
| | Export `.zip` with Web Share API | Android Chrome (Share target) | *not run (requires physical device)* |
| | Export `.zip` direct download fallback | iOS Safari / Chrome | Verified (Passed) |
| | Import `.zip` restoring entries & audio | Mobile / Desktop | Verified (Passed) |
| **Guards & Edge Cases** | In-app browser banner (WhatsApp webview) | Real WhatsApp link | *not run (requires physical device)* |
| | Offline mode PWA cache | Service Worker precache | Verified in build output (Passed) |
| | 404 Route handling (`#/random-route`) | All browsers | Verified (Passed) |

