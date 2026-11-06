import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve('server/data/truth_or_dare.db');
const UPLOADS_DIR = path.resolve('server/uploads/private');

if (!fs.existsSync(DB_PATH)) {
  console.log(`Database file not found at: ${DB_PATH}`);
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

console.log('\n===============================================================');
console.log('       TRUTH OR DARE - BACKEND SQLITE DATABASE VIEWER');
console.log('===============================================================');
console.log(`DB File:  ${DB_PATH}`);
console.log(`Uploads:  ${UPLOADS_DIR}`);

// 1. Text Answers
console.log('\n---------------------------------------------------------------');
console.log('1. SAVED ANSWERS (Truth & Dare Questions)');
console.log('---------------------------------------------------------------');
try {
  const answers = db.prepare(`
    SELECT id, prompt_id, prompt_type, question, answer, player_name, created_at 
    FROM answers 
    ORDER BY created_at DESC 
    LIMIT 30
  `).all();

  if (answers.length === 0) {
    console.log('No answers saved yet. Play Truth or Dare and click "Jawab Save Karo"!');
  } else {
    answers.forEach((ans, idx) => {
      console.log(`\n[#${idx + 1}] [${ans.prompt_type.toUpperCase()}] ${ans.prompt_id}`);
      console.log(`     Question: "${ans.question}"`);
      console.log(`     Answer:   "${ans.answer}"`);
      console.log(`     By:       ${ans.player_name || 'Mausami Ji'} | Time: ${ans.created_at}`);
    });
  }
} catch (e) {
  console.log('Error reading answers:', e.message);
}

// 2. Uploaded Media Evidence
console.log('\n---------------------------------------------------------------');
console.log('2. UPLOADED EVIDENCE (Audio & Video Recordings)');
console.log('---------------------------------------------------------------');
try {
  const evidences = db.prepare(`
    SELECT id, dare_id, challenge, evidence_type, player_name, storage_object_key, file_size, duration, created_at 
    FROM evidence 
    ORDER BY created_at DESC 
    LIMIT 30
  `).all();

  if (evidences.length === 0) {
    console.log('No uploaded media recordings yet.');
  } else {
    evidences.forEach((ev, idx) => {
      const fullDiskPath = path.join(UPLOADS_DIR, ev.storage_object_key);
      const existsOnDisk = fs.existsSync(fullDiskPath) ? 'EXISTS ON DISK' : 'FILE MISSING';
      const sizeKB = (ev.file_size / 1024).toFixed(1);
      console.log(`\n[#${idx + 1}] ID: ${ev.id}`);
      console.log(`     Dare:     "${ev.challenge}"`);
      console.log(`     Type:     ${ev.evidence_type.toUpperCase()} | Duration: ${ev.duration}s | Size: ${sizeKB} KB`);
      console.log(`     By:       ${ev.player_name} | File: ${ev.storage_object_key} [${existsOnDisk}]`);
      console.log(`     Uploaded: ${ev.created_at}`);
    });
  }
} catch (e) {
  console.log('Error reading evidence:', e.message);
}

// 3. Summary of Tables
console.log('\n---------------------------------------------------------------');
console.log('3. SUMMARY OF TABLES');
console.log('---------------------------------------------------------------');
const tables = ['answers', 'evidence', 'game_sessions', 'players', 'rooms', 'game_turns'];
for (const tbl of tables) {
  try {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${tbl}`).get();
    console.log(`  - ${tbl.padEnd(16)}: ${row.count} rows`);
  } catch {
    // ignore
  }
}

console.log('\n===============================================================');
console.log('TIP: You can view this directly in your browser anytime at:');
console.log('     👉 http://localhost:5173/secret-vault');
console.log('     👉 http://localhost:3001/secret-vault');
console.log('===============================================================\n');
