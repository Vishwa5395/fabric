import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import songsData from '../src/data/songs.json';

const OUTPUT_DIR = path.resolve('downloads/songs');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      console.error(`Download error for ${destPath}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log(`[Music Downloader] Starting download for ${songsData.length} background songs...`);
  console.log(`[Music Downloader] Target directory: ${OUTPUT_DIR}\n`);

  let count = 0;
  for (let i = 0; i < songsData.length; i++) {
    const song = songsData[i];
    const safeTitle = song.title.replace(/[/\\?%*:|"<>]/g, '_');
    const safeArtist = (song.filmOrArtist || 'Unknown').replace(/[/\\?%*:|"<>]/g, '_');
    const fileName = `${String(i + 1).padStart(2, '0')}_${safeTitle}_${safeArtist}.m4a`;
    const destPath = path.join(OUTPUT_DIR, fileName);

    if (song.previewUrl) {
      process.stdout.write(`Downloading [${i + 1}/${songsData.length}] "${song.title}"... `);
      const success = await downloadFile(song.previewUrl, destPath);
      if (success) {
        count++;
        console.log(`✅ Saved: ${fileName}`);
      } else {
        console.log(`❌ Failed: ${song.previewUrl}`);
      }
    } else {
      console.log(`⚠️ Skipped "${song.title}" (No direct preview audio stream available)`);
    }
  }

  console.log(`\n🎉 Download complete! Successfully downloaded ${count} of ${songsData.length} songs to:`);
  console.log(`📂 ${OUTPUT_DIR}\n`);
}

run().catch(console.error);

