#!/usr/bin/env python3
"""
Generate the announcer voice clips for PJ's Bachelor Blowout — FREE, no API key.

Uses edge-tts (Microsoft's online neural voices, the same engine behind Azure TTS).
It produces a deep, smooth "movie-trailer narrator" delivery — gravitas without
impersonating any real person.

USAGE (run once on your own machine — needs internet):
    pip install edge-tts
    python tools/generate-voice.py

It reads voice/lines.json and writes voice/<key>.mp3 for each line.
The website automatically plays voice/<key>.mp3 when present and falls back to the
browser's built-in voice when a clip is missing — so you can regenerate anytime.

Pick a different vibe by changing VOICE below. Good free options:
    en-US-ChristopherNeural  -> warm, deep, authoritative  (default — narrator)
    en-US-DavisNeural        -> calm, deep
    en-GB-RyanNeural         -> British narrator
    en-US-GuyNeural          -> brighter, higher-energy host
Tune RATE / PITCH for more or less drama.
"""

import asyncio, json, os, sys

VOICE = "en-US-ChristopherNeural"   # deep narrator
RATE  = "-8%"                        # a touch slower = more gravitas
PITCH = "-3Hz"                       # a touch lower = deeper

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
VOICE_DIR = os.path.join(ROOT, "voice")
LINES = os.path.join(VOICE_DIR, "lines.json")


async def main():
    try:
        import edge_tts
    except ImportError:
        sys.exit("edge-tts not installed. Run:  pip install edge-tts")

    with open(LINES, encoding="utf-8") as f:
        lines = json.load(f)

    os.makedirs(VOICE_DIR, exist_ok=True)
    total = len(lines)
    print(f"Generating {total} clips with {VOICE} (rate {RATE}, pitch {PITCH})...\n")

    for i, (key, text) in enumerate(lines.items(), 1):
        out = os.path.join(VOICE_DIR, f"{key}.mp3")
        try:
            tts = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
            await tts.save(out)
            print(f"  [{i:>2}/{total}] {key}.mp3")
        except Exception as e:
            print(f"  [{i:>2}/{total}] FAILED {key}: {e}")

    print("\nDone! Commit the voice/*.mp3 files and push — the site will use them automatically.")


if __name__ == "__main__":
    asyncio.run(main())
