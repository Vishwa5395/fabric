import json
import os
import subprocess
import sys

SONGS_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "songs.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "songs")
FFMPEG_PATH = r"C:\ffmpeg\bin"
PYTHON_EXE = r"C:\Python313\python.exe"

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(SONGS_JSON_PATH, "r", encoding="utf-8") as f:
    songs = json.load(f)

print(f"Total songs to download: {len(songs)}")

# Clean up any leftover mp3 files in public/audio/songs
for fname in os.listdir(OUTPUT_DIR):
    if fname.endswith(".mp3"):
        os.remove(os.path.join(OUTPUT_DIR, fname))
        print(f"Removed temporary {fname}")

for idx, song in enumerate(songs, 1):
    song_id = song["id"]
    title = song["title"]
    artist = song.get("filmOrArtist", "")
    yt_query = song.get("youtubeQuery") or f"{title} {artist}"
    target_file = os.path.join(OUTPUT_DIR, f"{song_id}.m4a")

    print(f"\n[{idx}/{len(songs)}] Downloading full version of: {title} ({artist})")
    print(f"Query: {yt_query}")
    print(f"Target: {target_file}")

    # Temporary output template
    temp_template = os.path.join(OUTPUT_DIR, f"temp_{song_id}.%(ext)s")
    
    # Run yt-dlp to download and convert to m4a
    cmd = [
        PYTHON_EXE, "-m", "yt_dlp",
        "--ffmpeg-location", FFMPEG_PATH,
        "-x",
        "--audio-format", "m4a",
        "--audio-quality", "0",
        "--no-playlist",
        "--default-search", "ytsearch1",
        "-o", temp_template,
        yt_query
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error downloading {song_id}:")
        print(result.stderr[-500:] if result.stderr else "Unknown error")
        continue

    temp_m4a = os.path.join(OUTPUT_DIR, f"temp_{song_id}.m4a")
    if os.path.exists(temp_m4a):
        if os.path.exists(target_file):
            os.remove(target_file)
        os.rename(temp_m4a, target_file)
        file_size_mb = os.path.getsize(target_file) / (1024 * 1024)
        print(f"SUCCESS: {target_file} ({file_size_mb:.2f} MB)")
    else:
        print(f"FAILED: Output file {temp_m4a} not found.")

print("\nAll full downloads finished!")

