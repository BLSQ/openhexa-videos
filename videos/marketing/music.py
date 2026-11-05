"""Score and mix for the OpenHEXA marketing video (57 s, 96 BPM).

Arrangement and mix only; DSP, instruments, sound effects and mastering come from
tools/audio/synth.py. Run through the CLI: npm run v -- <video> score --lang <code>
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "audio"))
import synth  # noqa: E402

synth.init()
from synth import *  # noqa: E402,F401,F403

# ---------------------------------------------------------------------------
# Harmony (beats are absolute beat indices on the 96 BPM grid)
# ---------------------------------------------------------------------------
# (start_beat, end_beat, bass_root_midi, pad_voicing)
CHORDS = [
    # Problem: A minor, uneasy
    (0, 8, 45, [57, 60, 64, 71]),  # Am(add9)
    (8, 12, 41, [53, 57, 60, 64]),  # Fmaj7
    (12, 16, 38, [57, 60, 62, 65]),  # Dm7
    (16, 20, 41, [53, 57, 60, 64]),  # Fmaj7
    (20, 22, 40, [57, 59, 64, 69]),  # Esus4
    (22, 24, 40, [56, 59, 64, 68]),  # E
    # Reveal: lift to C major
    (24, 30, 36, [55, 60, 64, 67, 71]),  # Cmaj7
    (30, 34, 43, [55, 60, 62, 67]),  # Gsus4
    # Groove x2: C G Am F
    (34, 38, 36, [55, 60, 64, 67]),
    (38, 42, 43, [55, 59, 62, 67, 69]),
    (42, 46, 45, [57, 60, 64, 67]),
    (46, 50, 41, [53, 57, 60, 67]),
    (50, 54, 36, [55, 60, 64, 67]),
    (54, 58, 43, [55, 59, 62, 67, 69]),
    (58, 62, 45, [57, 60, 64, 67]),
    (62, 66, 41, [53, 57, 60, 67]),
    # Trust: airy lift
    (66, 70, 41, [57, 60, 65, 69]),  # F
    (70, 74, 43, [55, 59, 62, 67]),  # G
    # CTA: cadence landing on the click at beat 84
    (74, 78, 36, [55, 60, 64, 67, 71]),  # Cmaj7
    (78, 80, 45, [57, 60, 64, 67]),  # Am7
    (80, 82, 41, [57, 60, 65, 69]),  # F
    (82, 84, 43, [55, 59, 62, 67]),  # G
    (84, 96, 36, [48, 55, 60, 64, 67, 71, 76]),  # C (final, wide)
]


def chord_at(beat):
    for c in CHORDS:
        if c[0] <= beat < c[1]:
            return c
    return CHORDS[-1]


def render_pad():
    dark, bright = Bus(), Bus()
    for b0, b1, root, voicing in CHORDS:
        t0, d = b2s(b0), b2s(b1 - b0)
        for i, m in enumerate(voicing):
            pan = (i / max(1, len(voicing) - 1)) * 1.2 - 0.6
            s = pad_note(m, d, attack=0.35 if b0 >= 24 else 0.8, release=1.4)
            dark.add(s, t0, pan, 0.16)
            bright.add(s, t0, pan, 0.16)
    dark.x = lowpass(dark.x, 700, 2)
    bright.x = lowpass(bright.x, 3800, 2)
    # Filter opens at the reveal, breathes in the trust section, fully open at CTA.
    mixc = automation([(0, 0.0), (12.4, 0.0), (15.0, 0.9), (20.6, 0.55), (40.6, 0.8), (46.25, 1.0), (DUR + 0.5, 1.0)])
    out = dark.x * (1 - mixc) + bright.x * mixc
    vol = automation(
        [
            (0, 0.0),
            (1.2, 0.7),
            (7.5, 0.8),
            (14.3, 1.0),
            (14.7, 0.25),
            (15.0, 1.1),
            (20.6, 0.75),
            (40.6, 0.95),
            (46.25, 1.0),
            (54.5, 1.0),
            (DUR + 0.3, 0.0),
            (DUR + 0.5, 0.0),
        ]
    )
    return highpass(out * vol, 120, 2)


def render_arp():
    bus = Bus()
    # 16th-note arpeggio over the chord (upper register) in the groove + CTA sections.
    pattern = [0, 1, 2, 3, 2, 1, 2, 3]
    for step in range(int(34 * 4), int(84 * 4)):
        beat = step / 4
        if 66 <= beat < 74 and step % 2:  # thinner in the trust section
            continue
        _, _, _, voicing = chord_at(beat)
        tones = sorted(set(voicing))[-4:]
        m = tones[pattern[step % 8] % len(tones)] + 12
        accent = 1.0 if step % 4 == 0 else 0.72
        s = pluck(mtof(m), int(0.5 * SR), bright=0.7, decay=1.6)
        bus.add(s, b2s(beat), pan=0.35 if step % 2 else -0.35, gain=0.11 * accent)
    # Reveal: a rising shimmer arpeggio (beats 24-34)
    rise = [60, 64, 67, 71, 72, 76, 79, 83]
    for i in range(20):
        beat = 24 + i * 0.5
        m = rise[i % 8] + 12 * (i // 8)
        s = pluck(mtof(min(m, 96)), int(0.9 * SR), bright=1.2, decay=0.9)
        bus.add(s, b2s(beat), pan=np.sin(i) * 0.6, gain=0.07)
    bus.x += pingpong(bus.x, BEAT * 0.75, fb=0.35, repeats=5)
    return highpass(bus.x, 250, 2)


def render_tick():
    """Problem section: a muted, clock-like pluck motif."""
    bus = Bus()
    motif = [76, 72, 74, 71]  # E5 C5 D5 B4
    for i in range(int(4 * 2), int(23 * 2)):  # eighths from beat 4 to 23
        beat = i / 2
        if beat < 12 and i % 4 not in (0, 3):
            continue
        m = motif[i % 4] - (0 if beat < 12 else 0)
        gain = 0.09 if beat < 12 else 0.12 + 0.05 * (beat - 12) / 11
        s = pluck(mtof(m), int(0.35 * SR), bright=0.5, decay=2.2)
        bus.add(s, b2s(beat), pan=-0.4 if i % 2 else 0.4, gain=gain)
    bus.x += pingpong(bus.x, BEAT * 0.75, fb=0.3, repeats=4, damp=2500)
    return lowpass(highpass(bus.x, 300), 3500)


MELODY = [  # (beat offset in 16-beat phrase, midi, dur)
    (0, 76, 1),
    (1, 74, 0.5),
    (1.5, 72, 1.5),
    (3, 67, 1),
    (4, 74, 1),
    (5, 71, 0.5),
    (5.5, 74, 1),
    (6.5, 79, 1.5),
    (8, 76, 1),
    (9, 72, 0.5),
    (9.5, 71, 1),
    (10.5, 69, 1.5),
    (12, 72, 1),
    (13, 69, 0.5),
    (13.5, 72, 1),
    (14.5, 74, 1.5),
]


def render_bells():
    bus = Bus()
    for start, g in ((50, 0.05), (74, 0.075)):
        for o, m, d in MELODY:
            beat = start + o
            if beat >= 84:
                break
            s = fm_bell(mtof(m + 12), int(1.6 * SR))
            bus.add(s, b2s(beat), pan=0.15, gain=g)
    # Final chord bell hits at the click
    for i, m in enumerate([72, 76, 79, 84]):
        bus.add(fm_bell(mtof(m + 12), int(3.5 * SR), decay=1.2), b2s(84) + i * 0.035, pan=(i - 1.5) * 0.3, gain=0.06)
    bus.x += pingpong(bus.x, BEAT * 0.75, fb=0.4, repeats=6)
    return highpass(bus.x, 400)


DRUM_SECTIONS = [  # (start_beat, end_beat, style)
    (34, 66, "full"),
    (66, 74, "light"),
    (74, 84, "full"),
]


def render_drums():
    kb, cb, hb = Bus(), Bus(), Bus()
    kick_times = []
    for b0, b1, style in DRUM_SECTIONS:
        for beat in range(b0, b1):
            t = b2s(beat)
            if style == "full" or beat % 2 == 0:
                kb.add(kick(), t, 0, 0.55 if style == "full" else 0.35)
                kick_times.append(t)
            if style == "full" and beat % 2 == 1:
                cb.add(clap(), t, 0.05, 0.22)
            for s in range(4):
                if style == "light" and s % 2:
                    continue
                acc = [0.5, 0.25, 1.0, 0.3][s]
                hb.add(
                    hat(open_=(s == 2 and style == "full" and beat % 2 == 1)),
                    t + s * BEAT / 4,
                    pan=0.25 if s % 2 else -0.15,
                    gain=0.05 * acc,
                )
    # Problem section: a distant heartbeat-like sub pulse
    for beat in range(0, 23):
        t = b2s(beat)
        g = 0.18 + 0.2 * beat / 23
        kb.add(lowpass(kick(), 180), t, 0, g)
        if beat >= 12:
            kb.add(lowpass(kick(), 180), t + BEAT / 2, 0, g * 0.5)
    # Build into the drop: snare-ish roll over beats 32-34 and 72-74
    for s0, s1 in ((32, 34), (72, 74)):
        steps = int((s1 - s0) * 4)
        for i in range(steps):
            cb.add(clap(), b2s(s0) + i * BEAT / 4, 0, 0.04 + 0.12 * i / steps)
    cb.x += reverb(cb.x, IR_ROOM, 0.35)
    drums = kb.x + cb.x + hb.x
    return drums, kick_times


def render_bass(kick_times):
    bus = Bus()
    for b0, b1, root, _ in CHORDS:
        if b0 < 34 or b0 >= 84:
            continue
        light = 66 <= b0 < 74
        for i in range(int((b1 - b0) * 2)):
            beat = b0 + i * 0.5
            dur = BEAT * 0.45
            n = int((dur + 0.08) * SR)
            f = mtof(root - 12 + 12 * (i % 2 == 1 and not light) * 0)
            t = np.arange(n) / SR
            x = np.sin(2 * np.pi * f * t) + 0.35 * lowpass(saw(f, n), 600, 2)
            x = np.tanh(x * 1.3) * env_adsr(n, 0.004, 0.12, 0.6, 0.06, hold=dur)
            bus.add(x, b2s(beat), 0, 0.2 if not light else 0.12)
    # Final sustained root
    n = int(5 * SR)
    t = np.arange(n) / SR
    f = mtof(36 - 12)
    bus.add(np.sin(2 * np.pi * f * t) * np.exp(-t / 2.2) * np.minimum(1, t / 0.01), b2s(84), 0, 0.3)
    # Problem section: sub drone following the chord roots
    for b0, b1, root, _ in CHORDS:
        if b0 >= 24:
            break
        d = b2s(b1 - b0)
        n = int((d + 0.4) * SR)
        t = np.arange(n) / SR
        x = np.sin(2 * np.pi * mtof(root - 12) * t) * env_adsr(n, 0.3, 1, 0.8, 0.4, hold=d)
        bus.add(x, b2s(b0), 0, 0.1)
    return bus.x


def main():
    print("pad...")
    pad = render_pad()
    print("arp / tick / bells...")
    arp = render_arp()
    tick = render_tick()
    bells = render_bells()
    print("drums / bass...")
    drums, kick_times = render_drums()
    bass = render_bass(kick_times)
    sc = sidechain(kick_times)

    music = (pad * 1.0 + arp * 0.9) * sc + bells * sc + tick + bass * sc + drums
    music = music + reverb(pad * 0.5 + arp * 0.6 + bells * 0.6 + tick * 0.4, IR_HALL, 0.4)
    # Global music envelope: fade in, short dip before reveal, tail out
    music *= automation([(0, 0.0), (0.4, 1.0), (DUR - 1.2, 1.0), (DUR + 0.4, 0.0), (DUR + 0.5, 0.0)])
    music = lowpass(music, 16000, 1)

    print("sfx...")
    sfx = render_sfx()
    print("vo...")
    vo = render_vo()

    # Level targets (RMS, dBFS): narration -18, music groove -22 (ducked ~8 dB under speech).
    def rms_db(x, t0, t1):
        seg = x[:, int(t0 * SR) : int(t1 * SR)]
        return 20 * np.log10(np.sqrt(np.mean(seg**2)) + 1e-12)

    active = np.abs(vo).max(axis=0) > 0.01
    vo_rms = 20 * np.log10(np.sqrt(np.mean(vo[:, active] ** 2)))
    vo = vo * db(-18 - vo_rms)
    music = music * db(-22 - rms_db(music, 21, 40))
    sfx = sfx * db(-12 - 20 * np.log10(np.max(np.abs(sfx)) + 1e-9)) * 2.2

    duck = vo_duck(vo, depth_db=-8.0)
    mix = music * duck + sfx * (0.6 + 0.4 * duck) + vo
    peak = np.max(np.abs(mix))
    # Master to -14 LUFS with a -1.5 dBFS ceiling (two passes: the limiter lowers loudness a bit).
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
