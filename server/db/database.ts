import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve('server/data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'truth_or_dare.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for reliable concurrency
db.exec('PRAGMA foreign_keys = OFF;');

export function initDatabase(): void {
  db.exec(`
    -- 1. Simple, clean text answers for Truth & Dare
    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      prompt_id TEXT NOT NULL,
      prompt_type TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      player_name TEXT NOT NULL DEFAULT 'Mausami Ji',
      created_at TEXT NOT NULL
    );

    -- 2. Simple uploaded evidence recordings (audio & video)
    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      dare_id TEXT NOT NULL,
      challenge TEXT NOT NULL,
      evidence_type TEXT NOT NULL,
      player_name TEXT NOT NULL DEFAULT 'Mausami Ji',
      file_url TEXT NOT NULL,
      storage_object_key TEXT NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      duration REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- 3. Game sessions (solo & multiplayer)
    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      mode TEXT NOT NULL DEFAULT 'solo',
      status TEXT NOT NULL DEFAULT 'in_progress',
      total_rounds INTEGER NOT NULL DEFAULT 7,
      current_round INTEGER NOT NULL DEFAULT 1,
      current_player_id TEXT,
      created_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT
    );

    -- 4. Players
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'player',
      score INTEGER NOT NULL DEFAULT 0,
      connection_status TEXT NOT NULL DEFAULT 'connected',
      ready_status INTEGER NOT NULL DEFAULT 0,
      session_token TEXT NOT NULL,
      joined_at TEXT NOT NULL
    );

    -- 5. Multiplayer Rooms
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      room_code TEXT NOT NULL UNIQUE,
      session_id TEXT NOT NULL,
      host_player_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting',
      expires_at TEXT NOT NULL
    );

    -- 6. Game turns
    CREATE TABLE IF NOT EXISTS game_turns (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      round_number INTEGER NOT NULL,
      prompt_id TEXT NOT NULL,
      prompt_type TEXT NOT NULL,
      submitted_status TEXT NOT NULL,
      awarded_points INTEGER NOT NULL DEFAULT 0,
      evidence_id TEXT,
      submitted_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
    CREATE INDEX IF NOT EXISTS idx_answers_prompt ON answers(prompt_id);
    CREATE INDEX IF NOT EXISTS idx_evidence_dare ON evidence(dare_id);
  `);
}

/**
 * Resets and cleans the database completely
 */
export function resetDatabase(): void {
  db.exec(`
    DROP TABLE IF EXISTS answers;
    DROP TABLE IF EXISTS evidence;
    DROP TABLE IF EXISTS answer_nodes;
    DROP TABLE IF EXISTS game_turns;
    DROP TABLE IF EXISTS rooms;
    DROP TABLE IF EXISTS players;
    DROP TABLE IF EXISTS game_sessions;
    VACUUM;
  `);
  initDatabase();
}

// Initialise schema immediately on load
initDatabase();
