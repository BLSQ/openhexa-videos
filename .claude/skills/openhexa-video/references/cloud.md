# Running in each environment

`scripts/setup.sh` adapts to all three. This page covers what changes between them.

## claude.ai (Enterprise) with code execution

- **Kit:** the sandbox usually can't reach the private BLSQ/openhexa-videos repo, so setup unpacks
  the kit bundled with the skill into `./openhexa-videos`. `KIT_VERSION` holds the commit it was
  built from.
- **Network:** org admins must allow these domains in the code execution network settings:
  - `api.edenai.run` for voice and word timings;
  - `registry.npmjs.org` for `npm install`;
  - `pypi.org` and `files.pythonhosted.org` for numpy, scipy, soundfile and imageio-ffmpeg;
  - optionally `huggingface.co` and `cdn-lfs.huggingface.co` for local Whisper;
  - optionally `playwright.azureedge.net` and `cdn.playwright.dev` for Chromium;
  - optionally `github.com` and `objects.githubusercontent.com` for ffmpeg-static and cloning.
  The report says what is missing. Without Chromium nothing renders; without Eden AI only the
  placeholder voice works.
- **Long commands:** a 2-minute video is ~7,000 frames at 60 fps. Small sandboxes render at
  5 to 15 fps, so don't block on it.
  - Run it in the background and poll the log:
    ```sh
    nohup npm run v -- <id> render --lang en > render-en.log 2>&1 &
    tail -c 300 render-en.log     # "N/M frames ... eta Ns"; repeat until "wrote ..."
    ```
  - Make previews and iterations with `preview` (30 fps); keep 60 fps for the final.
  - If time is tight, `--fps 30` is acceptable for the final as well.
- **Outputs:** deliver into `/mnt/user-data/outputs` so the user can download.
  - `npm run v -- <id> deliver --to /mnt/user-data/outputs` writes a 1080p mp4 at ~40 MB per
    minute, a 720p copy and the `.srt`.
  - Don't put the 380 MB master there.
- **Getting the work back:** zip the video folder for the user to commit. Include the voice clips
  so the team doesn't pay for them twice. Include `core/` or `tools/` too if you changed them,
  and say so.
  ```sh
  zip -qr /mnt/user-data/outputs/<id>-source.zip videos/<id> -x 'videos/<id>/out/*' 'videos/<id>/vo/*/trim/*'
  ```
- **The Eden AI key:** the user pastes it in the conversation. Write it to `.env` (see SKILL.md)
  and don't repeat it back.

## Claude Code in the cloud (claude.ai/code, from the BLSQ/openhexa-videos repo)

- The session starts inside the repo and the skill is in `.claude/skills/`, so setup only installs
  dependencies.
- Chromium: these environments usually have Playwright installed globally; if not, setup runs
  `npx playwright install chromium`.
- Keep the key out of git: use an environment secret, or write it to `.env`, which is gitignored.
- Work on a branch `video/<id>`, commit `videos/<id>` (including `vo/` and `gen/`, never `out/`),
  push and open a PR.
- Renders run in the background in the same way. Their outputs stay in `videos/<id>/out/`,
  which is gitignored; deliver them as files, not commits.

## Local (Claude Code or a terminal on a Mac)

- Everything works offline except `tts`.
- Chrome comes from `/Applications`, ffmpeg from the npm `ffmpeg-static` package, the placeholder
  voice from macOS `say`.
- Six render workers is the ceiling; more starves Chrome.
- Live preview with sound: `npm run serve`, then open `/index.html?video=<id>&lang=<xx>`.

## Placeholder voice without macOS

- `tts --placeholder` uses `espeak-ng` if present.
- Otherwise it writes a quiet noise clip sized from the line length (~15 characters per second).
  Timing work still functions, but there are no word timings, so cues fall back to estimates.
- Run the real voice before judging sync.
