# 🎙️ Announcer voice clips

The site has a game-show announcer. By default it uses your **browser's built-in
voice** (free, works everywhere, but quality depends on your device).

For a **deep, lifelike movie-trailer narrator** instead, generate real neural
voice clips — **100% free, no account, no API key** — using Microsoft's online
voices via `edge-tts`:

```bash
pip install edge-tts
python tools/generate-voice.py
```

That writes `voice/<key>.mp3` for all 36 announcer lines (welcome, every door
reveal + roast, every lock-in, every showdown champion). Commit them and push —
the website **automatically plays the clips when present** and falls back to the
browser voice for anything missing. Regenerate anytime; re-running overwrites.

## Change the voice / vibe
Edit the top of `tools/generate-voice.py`:

| Voice | Vibe |
|-------|------|
| `en-US-ChristopherNeural` | warm, deep, authoritative (**default — narrator**) |
| `en-US-DavisNeural` | calm, deep |
| `en-GB-RyanNeural` | British narrator |
| `en-US-GuyNeural` | brighter, higher-energy host |

`RATE` and `PITCH` control drama (slower + lower = more gravitas).

## Editing the lines
The exact words live in `voice/lines.json` (auto-generated from `js/data.js`).
Tweak any line there, re-run the script, and re-commit.

> Note: these are generic neural voices for a fun, private project — not clones
> of any real person.
