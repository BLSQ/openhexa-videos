"""Score and mix for the OpenHEXA getting-started video (EN + FR, 100 BPM, song form follows the scene cuts).

Arrangement and mix only; DSP, instruments, sound effects and mastering come from
tools/audio/synth.py. Run through the CLI: npm run v -- <video> score --lang <code>
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "audio"))
import synth  # noqa: E402

synth.init()
from synth import *  # noqa: E402,F401,F403

ORIGIN = TL["gridOrigin"]  # time (s, <= 0) of beat 0; puts a downbeat exactly on the end-card hit


def b2s(beat):
    return ORIGIN + beat * BEAT


# ---------------------------------------------------------------------------
# Song form: bars follow the scene cuts. One chord per bar, C major, warm and light.
# ---------------------------------------------------------------------------
SC = TL["scenes"]

BAR = 4


def bar_at(t):
    return int(round((t - ORIGIN) / BEAT / BAR))


B_CONCEPT, B_CREATE, B_TOUR, B_DOCS = (bar_at(SC[k]) for k in ("concept", "create", "tour", "docs"))

B_HIT = bar_at(TL["outroHit"])

B_END = int(np.ceil((DUR - ORIGIN) / BEAT / BAR)) + 1

FIRST_BEAT = int(np.ceil(-ORIGIN / BEAT))  # first beat at or after t = 0

LOOP = [  # (bass midi, pad voicing)
    (36, [55, 60, 64, 67, 71]),  # Cmaj7
    (35, [55, 59, 62, 67]),  # G/B
    (33, [55, 57, 60, 64]),  # Am7
    (41, [57, 60, 64, 65, 69]),  # Fmaj7
]

INTRO = [(41, [57, 60, 64, 69]), (36, [55, 60, 64, 67])]  # Fmaj7 -> C, floating

CADENCE = [(41, [57, 60, 65, 69]), (43, [55, 59, 62, 67, 74])]  # F -> G into the final C

FINAL = (36, [48, 55, 60, 64, 67, 71, 76])

CHORDS = []  # (start_beat, end_beat, bass, voicing)

for b in range(B_END):
    if b >= B_HIT:
        CHORDS.append((b * BAR, B_END * BAR, *FINAL))
        break
    if b >= B_HIT - 2:
        c = CADENCE[b - (B_HIT - 2)]
    elif b < B_CREATE:
        c = INTRO[(b // 2) % 2]
    else:
        c = LOOP[(b - B_CREATE) % 4]
    CHORDS.append((b * BAR, (b + 1) * BAR, *c))


def chord_at(beat):
    for c in CHORDS:
        if c[0] <= beat < c[1]:
            return c
    return CHORDS[-1]


def section(beat):
    b = beat / BAR
    if b < B_CONCEPT:
        return "intro"
    if b < B_CREATE:
        return "concept"
    if b < B_TOUR:
        return "create"
    if b < B_DOCS:
        return "tour"
    if b < B_HIT:
        return "docs"
    return "outro"


# ---------------------------------------------------------------------------
# Instruments
# ---------------------------------------------------------------------------
def supersaw(f, n, voices=5, detune=0.1):
    out = np.zeros(n)
    for i in range(voices):
        cents = (i - (voices - 1) / 2) / ((voices - 1) / 2) * detune * 100
        out += saw(f * 2 ** (cents / 1200), n, phase0=rng.random())
    return out / voices


def pad_note(m, dur, attack=0.6, release=1.2):
    n = int((dur + release) * SR)
    f = mtof(m)
    x = supersaw(f, n) * 0.55 + np.sin(2 * np.pi * f * np.arange(n) / SR) * 0.45
    return x * env_adsr(n, attack, 0.8, 0.85, release, hold=dur)


def render_pad():
    bus = Bus()
    for b0, b1, _, voicing in CHORDS:
        t0, d = b2s(b0), b2s(b1 - b0)
        for i, m in enumerate(voicing):
            pan = (i / max(1, len(voicing) - 1)) * 1.2 - 0.6
            bus.add(pad_note(m, d, attack=0.5, release=1.4), t0, pan, 0.14)
    out = lowpass(bus.x, 2600, 2)
    vol = automation(
        [
            (0, 0.0),
            (1.0, 0.85),
            (SC["create"], 0.8),
            (SC["tour"], 0.62),
            (SC["docs"], 0.95),
            (TL["outroHit"], 1.0),
            (DUR - 0.6, 0.9),
            (DUR + 0.3, 0.0),
            (DUR + 0.5, 0.0),
        ]
    )
    return highpass(out * vol, 140, 2)


def render_arp():
    bus = Bus()
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    for step in range(int(B_CONCEPT * BAR * 4), int(B_HIT * BAR * 4)):
        beat = step / 4
        sec = section(beat)
        # Concept + docs: eighths only. Create: eighths. Tour: full sixteenths.
        if sec in ("concept", "create", "docs") and step % 2:
            continue
        _, _, _, voicing = chord_at(beat)
        tones = sorted(set(voicing))[-4:]
        m = tones[pattern[step % 8] % len(tones)] + 12
        accent = 1.0 if step % 4 == 0 else 0.7
        g = {"concept": 0.07, "create": 0.09, "tour": 0.085, "docs": 0.07}[sec]
        bus.add(pluck(mtof(m), int(0.5 * SR), bright=0.7, decay=1.6), b2s(beat), pan=0.35 if step % 2 else -0.35, gain=g * accent)
    bus.x += pingpong(bus.x, BEAT * 0.75, fb=0.33, repeats=5)
    return highpass(bus.x, 260, 2)


MOTIF = [(0, 76, 1), (1, 79, 0.5), (1.5, 76, 1), (2.5, 74, 1.5), (4, 72, 1), (5, 74, 0.5), (5.5, 76, 2)]


def render_bells():
    bus = Bus()
    # Opening motif under the logo, and once more as the docs section starts.
    for start, g in ((FIRST_BEAT + 0.5, 0.075), (B_DOCS * BAR, 0.05)):
        for o, m, d in MOTIF:
            bus.add(fm_bell(mtof(m + 12), int(1.8 * SR)), b2s(start + o), pan=0.15, gain=g)
    for i, m in enumerate([72, 76, 79, 84]):
        bus.add(fm_bell(mtof(m + 12), int(4.0 * SR), decay=1.0), b2s(B_HIT * BAR) + i * 0.04, pan=(i - 1.5) * 0.3, gain=0.06)
    bus.x += pingpong(bus.x, BEAT * 0.75, fb=0.4, repeats=6)
    return highpass(bus.x, 400)


def kick(level=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t / 0.026)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.26)
    click = highpass(noise(n), 3000) * np.exp(-t / 0.004) * 0.2
    return np.tanh((body + click) * 1.4) * level


def render_drums():
    kb, cb, hb = Bus(), Bus(), Bus()
    kick_times = []
    for beat in range(B_CREATE * BAR, B_HIT * BAR):
        sec = section(beat)
        if sec == "docs":
            continue
        t = b2s(beat)
        full = sec == "tour"
        if full or beat % 2 == 0:
            kb.add(kick(), t, 0, 0.42 if full else 0.3)
            kick_times.append(t)
        if full and beat % 2 == 1:
            cb.add(clap(), t, 0.05, 0.13)
        for s in range(4):
            if not full and s % 2:
                continue
            acc = [0.5, 0.25, 1.0, 0.3][s]
            hb.add(hat(open_=(s == 2 and full and beat % 4 == 3)), t + s * BEAT / 4, pan=0.25 if s % 2 else -0.15, gain=0.035 * acc)
    # Short fill into the tour and into the final hit.
    for b_end in (B_TOUR * BAR, B_HIT * BAR):
        for i in range(8):
            cb.add(clap(), b2s(b_end - 2) + i * BEAT / 4, 0, 0.03 + 0.07 * i / 8)
    kb.add(kick(1.1), b2s(B_HIT * BAR), 0, 0.5)
    cb.x += reverb(cb.x, IR_ROOM, 0.35)
    return kb.x + cb.x + hb.x, kick_times


def render_bass():
    bus = Bus()
    for b0, b1, root, _ in CHORDS:
        sec = section(b0)
        if sec in ("intro", "concept", "docs"):
            continue
        if sec == "outro":
            n = int(5 * SR)
            t = np.arange(n) / SR
            bus.add(np.sin(2 * np.pi * mtof(root) * t) * np.exp(-t / 2.2) * np.minimum(1, t / 0.01), b2s(b0), 0, 0.28)
            continue
        step = 1.0 if sec == "create" else 0.5
        for i in range(int((b1 - b0) / step)):
            beat = b0 + i * step
            dur = BEAT * step * 0.85
            n = int((dur + 0.08) * SR)
            f = mtof(root)
            t = np.arange(n) / SR
            x = np.sin(2 * np.pi * f * t) + 0.3 * lowpass(saw(f, n), 700, 2)
            x = np.tanh(x * 1.2) * env_adsr(n, 0.004, 0.12, 0.6, 0.06, hold=dur)
            bus.add(x, b2s(beat), 0, 0.16)
    return bus.x


def main():
    print(LANG, "music...")
    pad = render_pad()
    arp = render_arp()
    bells = render_bells()
    drums, kick_times = render_drums()
    bass = render_bass()
    sc = sidechain(kick_times, depth=0.45)
    music = (pad + arp * 0.9 + bass) * sc + bells + drums
    music = music + reverb(pad * 0.5 + arp * 0.6 + bells * 0.6, IR_HALL, 0.4)
    music *= automation([(0, 0.0), (0.3, 1.0), (DUR - 1.2, 1.0), (DUR + 0.4, 0.0), (DUR + 0.5, 0.0)])
    music = lowpass(music, 16000, 1)

    print("sfx...")
    sfx = render_sfx()
    print("vo...")
    vo = render_vo(room_wet=0.04)

    def rms_db(x, t0, t1):
        seg = x[:, int(t0 * SR) : int(t1 * SR)]
        return 20 * np.log10(np.sqrt(np.mean(seg**2)) + 1e-12)

    active = np.abs(vo).max(axis=0) > 0.01
    vo = vo * db(-18 - 20 * np.log10(np.sqrt(np.mean(vo[:, active] ** 2))))
    # Calmer bed than a promo: music sits ~6 dB further under the narration.
    music = music * db(-25 - rms_db(music, SC["tour"], SC["docs"]))
    sfx = sfx * db(-12 - 20 * np.log10(np.max(np.abs(sfx)) + 1e-9)) * 1.8

    duck = vo_duck(vo, depth_db=-7.0)
    mix = music * duck + sfx * (0.6 + 0.4 * duck) + vo
    peak = np.max(np.abs(mix))
    for _ in range(3):
        mix = limiter(mix * db(-14 - lufs(mix)))
    print("master loudness", round(lufs(mix), 2), "LUFS, peak", round(20 * np.log10(np.abs(mix).max()), 2), "dBFS")
    trim = int(DUR * SR)
    for name, x in (("music", music), ("sfx", sfx), ("vo", vo), ("mix", mix)):
        x = x[:, :trim]
        pk = np.max(np.abs(x))
        if name != "mix" and pk > 0.98:
            x = x / pk * 0.98
        sf.write(os.path.join(OUT, f"{name}.wav"), x.T, SR, subtype="PCM_24")
    print("done; pre-limit peak dBFS", round(float(20 * np.log10(peak)), 2))


if __name__ == "__main__":
    main()
