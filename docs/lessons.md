# Lessons learned

Pitfalls already paid for once. Check here before debugging.

## Voice (Eden AI → ElevenLabs `eleven_multilingual_v2`)

- **House voices:** EN Matilda `XrExE9yKIg1WjnnlVkGX`; FR Caroline `kwhMCf63M8O3rCfnQ3oQ`, a native French voice.
  - Matilda speaking French sounds foreign, so use Caroline for FR.
  - Caroline speaks more slowly, so FR uses `tempo: 1.06` (pitch-preserving `atempo`, inaudible).
- **Cost:** about $0.00018 per character, roughly $0.25 per language for a 2-minute video.
- **Listing voices:** `GET https://api.edenai.run/v3/audio/voices?model=elevenlabs/eleven_multilingual_v2` needs no key.
- **Pronunciation:** spell it in `say`, never in `text` (which goes to captions):
  - "OpenHEXA" → "Open Hexa".
  - "docs.openhexa.com" → "docs dot open hexa dot com", or FR "docs point open hexa point com".
  - "DHIS2" → "D.H.I.S. 2"; "IASO" → "Iaso"; "PostgreSQL" → "Postgres"; "AI" → "A.I." (FR "I.A.").
  - FR "SQL": "S.Q.L." comes out as "esculé"; write the letter names "esse-ku-elle".
  - FR "notebook" is split as "note… book"; write "notbouk" (plural "notboukes"). "notbouks" came out as "notes-books".
- **Garbled takes:** a take can come back garbled (FR line 11 once said "votre cuisine, votre travail…").
  - Transcribe new clips without a prompt and read the text; a nonsense phrase means regenerate that line.
  - Whisper normalizes acronyms, so it can't judge how "SQL" was spoken: listen to those.

## Word timings (local faster-whisper, `small`)

- Passing the script line as `initial_prompt` keeps proper nouns spelled right, but sometimes
  drops the opening phrase. `words.py` retries without the prompt when the first word starts
  after 0.4 s.
- faster-whisper's PyAV decoder breaks on recent `av` releases, so `words.py` decodes the WAV
  itself and resamples to 16 kHz.
- Write cues as word prefixes ("upload", "cliquez"); matching ignores accents and case.
  `check` lists the cues that matched no word.

## Timing

- Real voices differ from the placeholder by 10 to 25%. Re-check every beat that has two
  actions close together:
  - typing then picking a country;
  - a click then a checkbox;
  - a popover just before a scene cut;
  - results that need time on screen.
- Make such beats adaptive, as `nameAt`, `typeDur` and `tickAt` in `videos/getting-started/timeline.js` are.
- **Music vs picture:** snapping the end card to the next music bar left a blank 1–2 s. Shift the
  music grid instead: `gridOrigin` puts a downbeat exactly on `TL.outroHit` (`core/timeline-kit.js`).
- Keep 0.6 to 1.0 s of air between lines inside a scene, and 1.2 to 1.6 s across scene changes.

## Rendering

- Use at most 6 workers on a laptop. With 8, Chrome starves and some segments come out empty
  (0-byte `seg_*.mp4`); the renderer now fails loudly when that happens.
- Never run two renders of the same video and language at once: they share `out/<lang>/segments`.
- Chrome can differ by 1/255 on a few anti-aliased pixels between runs; that is not a regression.
- On macOS, Homebrew may refuse to install ffmpeg until the Xcode license is accepted. The repo
  uses the npm `ffmpeg-static` binary instead, and `$FFMPEG` overrides it.
- In cloud sandboxes without Chrome, the tools fall back to Playwright Chromium (`require('playwright')`).
- The rendered MP4 is about 380 MB for 2 minutes at CRF 14. For chat or phone review, use the
  `preview` 720p copy (under 10 MB).

## Accuracy

- The UI is not translated everywhere. FR keeps "workspace" in many strings, the connection
  type names, "Static"/"Superset", and the English default homepage. Show the real strings.
- A new trial user lands on the organization page, not in a workspace, so the getting-started
  video starts there (`docs/app-facts.md`).
- A local OpenHEXA instance via `docker compose` needs free Docker disk space. If `initdb` fails
  with "No space left on device", build the mock-ups from the frontend source instead of
  screenshots; that is what `core/app-ui.js` is.
