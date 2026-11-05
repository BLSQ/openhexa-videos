#!/usr/bin/env bash
# Bootstrap the OpenHEXA video kit wherever this skill runs: a checkout of BLSQ/openhexa-videos
# (local or Claude Code in the cloud), or a claude.ai sandbox where only the skill is available.
#
#   bash <skill>/scripts/setup.sh [--work DIR] [--no-whisper]
#
# 1. Finds the kit: the current repo, else a clone of BLSQ/openhexa-videos (when GitHub access
#    works), else the copy bundled with the skill (kit.tar.gz), unpacked into DIR (default ./openhexa-videos).
# 2. Installs what is missing: npm packages, a Python venv (numpy scipy soundfile, plus
#    faster-whisper unless --no-whisper), an ffmpeg fallback (imageio-ffmpeg), Chromium (Playwright).
# 3. Prints a capability report and, last, KIT=<path> for the commands that follow.
# Safe to run again: every step is skipped when already done.
set -u
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$PWD/openhexa-videos"
WHISPER=1
while [ $# -gt 0 ]; do
  case "$1" in
    --work) WORK="$2"; shift 2 ;;
    --no-whisper) WHISPER=0; shift ;;
    *) echo "unknown option $1"; exit 2 ;;
  esac
done
say() { printf '%s\n' "$*"; }
is_kit() { [ -f "$1/tools/cli.mjs" ] && [ -d "$1/videos/_template" ]; }

# ---------- 1. locate the kit ----------
KIT=""
for c in "$PWD" "$(git rev-parse --show-toplevel 2>/dev/null)" "$SKILL_DIR/../../.." "$WORK"; do
  if [ -n "$c" ] && is_kit "$c"; then KIT="$(cd "$c" && pwd)"; break; fi
done
SOURCE="existing checkout"
if [ -z "$KIT" ] && git ls-remote https://github.com/BLSQ/openhexa-videos HEAD >/dev/null 2>&1; then
  say "cloning BLSQ/openhexa-videos into $WORK"
  git clone -q https://github.com/BLSQ/openhexa-videos "$WORK" && KIT="$WORK" && SOURCE="fresh clone (git push works if you have access)"
fi
if [ -z "$KIT" ] && [ -f "$SKILL_DIR/kit.tar.gz" ]; then
  say "unpacking the kit bundled with the skill into $WORK"
  mkdir -p "$WORK" && tar -xzf "$SKILL_DIR/kit.tar.gz" -C "$WORK" && KIT="$WORK" && SOURCE="bundled kit $(cat "$WORK/KIT_VERSION" 2>/dev/null)"
fi
if [ -z "$KIT" ]; then say "ERROR: no kit found (no repo checkout, no GitHub access, no kit.tar.gz)"; exit 1; fi
cd "$KIT"

# ---------- 2. dependencies ----------
if ! command -v node >/dev/null; then say "ERROR: node is not installed (need Node 18+)"; exit 1; fi
if [ ! -d node_modules/puppeteer-core ]; then
  say "npm install..."
  npm install --no-audit --no-fund --loglevel=error >/tmp/ohv-npm.log 2>&1 || say "  npm install reported errors (see /tmp/ohv-npm.log); optional packages may be missing"
fi

PY=python3
if [ ! -x .venv/bin/python ]; then python3 -m venv .venv >/dev/null 2>&1 || true; fi
[ -x .venv/bin/python ] && PY=.venv/bin/python
# Without a venv, install for the user; newer distros also need --break-system-packages.
pipi() {
  if [ "$PY" != python3 ]; then $PY -m pip install -q --disable-pip-version-check "$@"
  else $PY -m pip install -q --disable-pip-version-check --user "$@" || $PY -m pip install -q --disable-pip-version-check --user --break-system-packages "$@"; fi
}
if ! $PY -c "import numpy, scipy, soundfile" 2>/dev/null; then say "pip install numpy scipy soundfile..."; pipi numpy scipy soundfile >/tmp/ohv-pip.log 2>&1; fi
if [ "$WHISPER" = 1 ] && ! $PY -c "import faster_whisper" 2>/dev/null; then
  say "pip install faster-whisper (optional; word timings fall back to Eden AI without it)..."
  pipi faster-whisper >>/tmp/ohv-pip.log 2>&1 || true
fi

FF=$(node -e "import('./tools/lib.mjs').then(m => console.log(m.FFMPEG))" 2>/dev/null)
if ! "$FF" -version >/dev/null 2>&1; then
  say "no working ffmpeg: installing imageio-ffmpeg..."
  pipi imageio-ffmpeg >>/tmp/ohv-pip.log 2>&1 || true
  FF=$(node -e "import('./tools/lib.mjs').then(m => console.log(m.FFMPEG))" 2>/dev/null)
fi

CHROME=$(node -e "import('./tools/lib.mjs').then(m => console.log(m.findChrome() || ''))" 2>/dev/null)
if [ -z "$CHROME" ]; then
  say "no Chrome/Chromium: trying 'npx playwright install chromium'..."
  npx -y playwright@1 install chromium >/tmp/ohv-playwright.log 2>&1 || true
  CHROME=$(node -e "import('./tools/lib.mjs').then(m => console.log(m.findChrome() || ''))" 2>/dev/null)
fi

# ---------- 3. report ----------
ok() { [ -n "$1" ] && printf 'yes' || printf 'NO'; }
NET=""; curl -s -m 6 -o /dev/null -w '%{http_code}' https://api.edenai.run/v3/audio/speech/models 2>/dev/null | grep -q '^[2-4]' && NET=1
KEY=""; { [ -n "${EDEN_AI_API_KEY:-}" ] || grep -qs '^EDEN_AI_API_KEY=.\+' .env; } && KEY=1
WH=""; $PY -c "import faster_whisper" 2>/dev/null && WH=1
NP=""; $PY -c "import numpy, scipy, soundfile" 2>/dev/null && NP=1
FFOK=""; "$FF" -version >/dev/null 2>&1 && FFOK=1
OUTS=""; [ -d /mnt/user-data/outputs ] && OUTS=/mnt/user-data/outputs
cat <<EOF

OpenHEXA video kit: $SOURCE
  node $(node -v), python $($PY -c 'import sys; print(sys.version.split()[0])' 2>/dev/null), cpus $(node -e 'console.log(require("os").cpus().length)')
  audio libs (numpy/scipy/soundfile) : $(ok "$NP")   needed for score
  ffmpeg                             : $(ok "$FFOK") ${FF}
  chrome/chromium                    : $(ok "$CHROME") ${CHROME}   needed for snap/preview/render
  local whisper (free word timings)  : $(ok "$WH")   else Eden AI transcription, else estimates
  network to api.edenai.run          : $(ok "$NET")   needed for tts
  EDEN_AI_API_KEY (env or .env)      : $(ok "$KEY")   needed for tts
  outputs folder                     : ${OUTS:-none (deliver to out/<lang>/deliver)}
KIT=$KIT
EOF
