"""Word-level timings for every trimmed narration clip of one language (faster-whisper, local, free).

Usage: python tools/audio/words.py --video videos/<id> --lang en
Writes vo/<lang>/words/<id>.json as [{"w": word, "t": start, "end": end}, ...].
"""

import argparse
import json
import os

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel
from scipy.signal import resample_poly

p = argparse.ArgumentParser()
p.add_argument("--video", required=True)
p.add_argument("--lang", default="en")
a = p.parse_args()
script = json.load(open(os.path.join(a.video, "script.json")))[a.lang]
model = WhisperModel("small", device="cpu", compute_type="int8")

for line in script["lines"]:
    wav = os.path.join(a.video, "vo", a.lang, "trim", f"{line['id']}.wav")
    # Decode ourselves (16 kHz float32): faster-whisper's PyAV path breaks on recent av releases.
    audio, sr = sf.read(wav, dtype="float32")
    audio = resample_poly(audio, 1, sr // 16000).astype(np.float32)
    # The script text as prompt keeps proper nouns (OpenHEXA, DHIS2...) spelled consistently.
    segments, _ = model.transcribe(audio, language=a.lang, word_timestamps=True, initial_prompt=line["text"], beam_size=5)
    words = [{"w": w.word.strip(), "t": w.start, "end": w.end} for s in segments for w in s.words]
    if not words or words[0]["t"] > 0.4:
        # The prompt can make Whisper skip an opening phrase that matches it; retry without it.
        segments, _ = model.transcribe(audio, language=a.lang, word_timestamps=True, beam_size=5)
        words = [{"w": w.word.strip(), "t": w.start, "end": w.end} for s in segments for w in s.words]
    json.dump(words, open(os.path.join(a.video, "vo", a.lang, "words", f"{line['id']}.json"), "w"), ensure_ascii=False, indent=0)
    print(a.lang, line["id"], len(words), "words")
