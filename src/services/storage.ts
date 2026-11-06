import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { z } from 'zod';

export type StorageErrorCode = 'UNAVAILABLE' | 'QUOTA' | 'CORRUPT' | 'NOT_FOUND';

export class StorageError extends Error {
  code: StorageErrorCode;
  hinglishMessage: string;
  declare cause?: unknown;

  constructor(code: StorageErrorCode, hinglishMessage: string, originalError?: unknown) {
    super(hinglishMessage);
    this.name = 'StorageError';
    this.code = code;
    this.hinglishMessage = hinglishMessage;
    if (originalError) {
      this.cause = originalError;
    }
  }
}

export interface DiaryEntry {
  id: string;
  title: string;
  body: string;
  mood?: string;
  createdAt: string; // ISO UTC
  updatedAt: string; // ISO UTC
}

export interface DiaryDraft {
  key: string; // "new" or entry id
  title: string;
  body: string;
  mood?: string;
  savedAt: string; // ISO UTC
}

export interface RecordingEntry {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string; // ISO UTC
  durationMs: number;
  mimeType: string;
  sizeBytes: number;
  favourite: boolean;
  blob: Blob;
}

export interface RecordingDraft {
  sessionId: string;
  mimeType: string;
  chunks: Blob[];
  startedAt: string;
}

export interface KVEntry {
  key: string;
  value: unknown;
}

export interface UserPrefs {
  ambientVolume: number;
  ambientToggleLabel: boolean;
  soundEffects: boolean;
  internetMemes: boolean;
  lastBackup: string | null;
}

export const DEFAULT_PREFS: UserPrefs = {
  ambientVolume: 0.7,
  ambientToggleLabel: false,
  soundEffects: false,
  internetMemes: false,
  lastBackup: null
};

export const PREFS_KEY = 'ufd:prefs:v1';

export function getPreferences(): UserPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePreferences(prefs: Partial<UserPrefs>): void {
  try {
    const current = getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save preferences to localStorage', err);
  }
}

// Zod schemas for validation
export const DiaryEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  body: z.string(),
  mood: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const DiaryDraftSchema = z.object({
  key: z.string().min(1),
  title: z.string(),
  body: z.string(),
  mood: z.string().optional(),
  savedAt: z.string()
});

export const RecordingEntryMetaSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  durationMs: z.number().nonnegative(),
  mimeType: z.string(),
  sizeBytes: z.number().nonnegative(),
  favourite: z.boolean()
});

interface UFDDatabase extends DBSchema {
  diaryEntries: {
    key: string;
    value: DiaryEntry;
    indexes: { 'by-updated': string };
  };
  diaryDrafts: {
    key: string;
    value: DiaryDraft;
  };
  recordings: {
    key: string;
    value: RecordingEntry;
    indexes: { 'by-created': string };
  };
  recordingDrafts: {
    key: string;
    value: RecordingDraft;
  };
  kv: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'ufd';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<UFDDatabase>> | null = null;

export function getDB(): Promise<IDBPDatabase<UFDDatabase>> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(
      new StorageError('UNAVAILABLE', 'Is browser mein local storage band hai, isliye save nahi ho payega. Normal (non-private) window try karein.')
    );
  }

  if (!dbPromise) {
    dbPromise = openDB<UFDDatabase>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('diaryEntries')) {
          const diaryStore = db.createObjectStore('diaryEntries', { keyPath: 'id' });
          diaryStore.createIndex('by-updated', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('diaryDrafts')) {
          db.createObjectStore('diaryDrafts', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('recordings')) {
          const recStore = db.createObjectStore('recordings', { keyPath: 'id' });
          recStore.createIndex('by-created', 'createdAt');
        }
        if (!db.objectStoreNames.contains('recordingDrafts')) {
          db.createObjectStore('recordingDrafts', { keyPath: 'sessionId' });
        }
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv');
        }
      }
    }).catch(err => {
      dbPromise = null;
      throw new StorageError('UNAVAILABLE', 'Local database shuru nahi ho paya. Private window ho toh normal window try karein.', err);
    });
  }

  return dbPromise;
}

// Persist helper
export async function tryPersistStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
  return false;
}

export async function isStoragePersisted(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persisted) {
    try {
      return await navigator.storage.persisted();
    } catch {
      return false;
    }
  }
  return false;
}

export async function getStorageEstimate(): Promise<{ quota?: number; usage?: number; percent?: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const est = await navigator.storage.estimate();
      const quota = est.quota;
      const usage = est.usage;
      const percent = quota && usage ? Math.round((usage / quota) * 100) : 0;
      return { quota, usage, percent };
    } catch {
      return {};
    }
  }
  return {};
}

/* ================= DIARY OPERATIONS ================= */

export async function saveDiaryEntry(entry: DiaryEntry): Promise<void> {
  try {
    DiaryEntrySchema.parse(entry);
    const db = await getDB();
    await db.put('diaryEntries', entry);
    // Persist storage on first save
    tryPersistStorage().catch(() => {});
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      throw new StorageError('CORRUPT', 'Entry ka format theek nahi tha.', err);
    }
    const msg = String(err);
    if (msg.includes('QuotaExceeded') || msg.includes('quota')) {
      throw new StorageError('QUOTA', 'Storage bhar gaya hai. Pehle backup lekar kuch purane items delete karein.', err);
    }
    throw new StorageError('UNAVAILABLE', 'Diary save nahi ho paayi. Dobara try karein.', err);
  }
}

export async function getDiaryEntry(id: string): Promise<DiaryEntry | null> {
  try {
    const db = await getDB();
    const entry = await db.get('diaryEntries', id);
    if (!entry) return null;
    const validated = DiaryEntrySchema.safeParse(entry);
    if (!validated.success) {
      console.warn(`Corrupt diary entry found: ${id}`);
      return null;
    }
    return validated.data;
  } catch (err) {
    throw new StorageError('UNAVAILABLE', 'Entry load nahi ho paayi.', err);
  }
}

export async function getAllDiaryEntries(): Promise<{ entries: DiaryEntry[]; corruptCount: number }> {
  try {
    const db = await getDB();
    const all = await db.getAll('diaryEntries');
    const valid: DiaryEntry[] = [];
    let corruptCount = 0;
    for (const item of all) {
      const parsed = DiaryEntrySchema.safeParse(item);
      if (parsed.success) {
        valid.push(parsed.data);
      } else {
        corruptCount++;
      }
    }
    return { entries: valid, corruptCount };
  } catch (err) {
    throw new StorageError('UNAVAILABLE', 'Diary entries load nahi ho paayi.', err);
  }
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('diaryEntries', id);
    // Also remove any draft associated with this entry
    await db.delete('diaryDrafts', id);
  } catch (err) {
    throw new StorageError('UNAVAILABLE', 'Entry delete nahi ho paayi.', err);
  }
}

export async function saveDiaryDraft(draft: DiaryDraft): Promise<void> {
  try {
    DiaryDraftSchema.parse(draft);
    const db = await getDB();
    await db.put('diaryDrafts', draft);
  } catch {
    // Draft autosaves silently fail if storage is full
  }
}

export async function getDiaryDraft(key: string): Promise<DiaryDraft | null> {
  try {
    const db = await getDB();
    const draft = await db.get('diaryDrafts', key);
    if (!draft) return null;
    const parsed = DiaryDraftSchema.safeParse(draft);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function clearDiaryDraft(key: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('diaryDrafts', key);
  } catch {
    // ignore
  }
}

/* ================= RECORDING OPERATIONS ================= */

export async function saveRecording(entry: RecordingEntry): Promise<void> {
  try {
    const db = await getDB();
    await db.put('recordings', entry);
    tryPersistStorage().catch(() => {});
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('QuotaExceeded') || msg.includes('quota')) {
      throw new StorageError('QUOTA', 'Storage bhar gaya hai. Pehle backup lekar kuch purane items delete karein.', err);
    }
    throw new StorageError('UNAVAILABLE', 'Recording save nahi ho paayi.', err);
  }
}

export async function getRecording(id: string): Promise<RecordingEntry | null> {
  try {
    const db = await getDB();
    const item = await db.get('recordings', id);
    return item || null;
  } catch (err) {
    throw new StorageError('UNAVAILABLE', 'Recording load nahi ho paayi.', err);
  }
}

export async function getAllRecordings(): Promise<{ recordings: RecordingEntry[]; corruptCount: number }> {
  try {
    const db = await getDB();
    const all = await db.getAll('recordings');
    const valid: RecordingEntry[] = [];
    let corruptCount = 0;
    for (const item of all) {
      if (item && item.id && item.blob) {
        valid.push(item);
      } else {
        corruptCount++;
      }
    }
    return { recordings: valid, corruptCount };
  } catch (err) {
    throw new StorageError('UNAVAILABLE', 'Recordings load nahi ho paayi.', err);
  }
}

export async function deleteRecording(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('recordings', id);
  } catch (err) {
    throw new StorageError('UNAVAILABLE', 'Recording delete nahi ho paayi.', err);
  }
}

/* ================= RECORDING DRAFTS (CRASH RECOVERY) ================= */

export async function saveRecordingDraft(draft: RecordingDraft): Promise<void> {
  try {
    const db = await getDB();
    await db.put('recordingDrafts', draft);
  } catch {
    // ignore crash draft errors
  }
}

export async function getAnyRecordingDraft(): Promise<RecordingDraft | null> {
  try {
    const db = await getDB();
    const all = await db.getAll('recordingDrafts');
    if (all && all.length > 0) {
      return all[0];
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearRecordingDraft(sessionId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('recordingDrafts', sessionId);
  } catch {
    // ignore
  }
}

/* ================= KV STORE ================= */

export async function getKV<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDB();
    const val = await db.get('kv', key);
    return val !== undefined ? (val as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setKV<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    await db.put('kv', value, key);
  } catch (err) {
    console.error(`Failed to set KV for ${key}`, err);
  }
}
