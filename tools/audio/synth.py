"""Shared synthesis library for every video's score: DSP helpers, instruments, sound effects,
voiceover processing and loudness mastering. Everything is synthesised from scratch (no samples).

A video's music.py calls init() first, then imports the names it needs:

    import synth
    synth.init()                       # reads --video <dir> --lang <code> from argv
    from synth import *                # SR, N, DUR, BEAT, TL, Bus, pluck, render_sfx, ...

init() loads videos/<id>/out/<lang>/timeline.json (written by tools/export-timeline.mjs) and
points VO_DIR at the video's trimmed clips. Only the arrangement (chords, parts, levels) lives
in music.py; anything two videos would copy belongs here.
"""

import argparse
import json
import os

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
TL = BEAT = DUR = N = rng = OUT = VO_DIR = LANG = VIDEO_DIR = IR_HALL = IR_ROOM = None


def init(argv=None):
    global TL, BEAT, DUR, N, rng, OUT, VO_DIR, LANG, VIDEO_DIR, IR_HALL, IR_ROOM
    p = argparse.ArgumentParser()
    p.add_argument("--video", required=True, help="path to videos/<id>")
    p.add_argument("--lang", default="en")
    a = p.parse_args(argv)
    VIDEO_DIR, LANG = os.path.abspath(a.video), a.lang
    OUT = os.path.join(VIDEO_DIR, "out", LANG)
    VO_DIR = os.path.join(VIDEO_DIR, "vo", LANG, "trim")
    os.makedirs(OUT, exist_ok=True)
    TL = json.load(open(os.path.join(OUT, "timeline.json")))
    BEAT = TL.get("beat", 0.6)
    DUR = TL["duration"]
    N = int(SR * (DUR + 0.5))
    rng = np.random.default_rng(7)
    IR_HALL = make_ir(3.2, damp=5000, predelay=0.03)
    IR_ROOM = make_ir(0.9, damp=7000, predelay=0.01, stereo_seed=5)
    return TL


def write_stems(stems, trim=None):
    """Write {name: (2, n) array} to OUT/<name>.wav at 24-bit, trimmed to the video length.
    Stems other than the mix are peak-normalised to -0.2 dBFS if they would clip."""
    trim = trim or int(DUR * SR)
    for name, x in stems.items():
        x = x[:, :trim]
        pk = np.max(np.abs(x))
        if name != "mix" and pk > 0.98:
            x = x / pk * 0.98
        sf.write(os.path.join(OUT, f"{name}.wav"), x.T, SR, subtype="PCM_24")


def b2s(beat):
    return beat * BEAT


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def db(x):
    return 10 ** (x / 20)


class Bus:
    def __init__(self):
        self.x = np.zeros((2, N))

    def add(self, sig, t, pan=0.0, gain=1.0):
        """Add a mono (n,) or stereo (2,n) signal starting at time t (s)."""
        start = int(round(t * SR))
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.vstack([sig * l * 1.4142, sig * r * 1.4142])
        if start < 0:
            sig = sig[:, -start:]
            start = 0
        end = min(N, start + sig.shape[1])
        if end > start:
            self.x[:, start:end] += sig[:, : end - start] * gain


def env_adsr(n, a, d, s, r, hold=None):
    """Sample-domain ADSR. hold = seconds before release (default: fill)."""
    t = np.arange(n) / SR
    total = n / SR
    hold = total - r if hold is None else hold
    e = np.where(t < a, t / max(a, 1e-6), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)))
    rel = t > hold
    e[rel] *= np.exp(-(t[rel] - hold) / max(r / 4, 1e-6))
    return e


def polyblep(ph, dt):
    y = np.zeros_like(ph)
    m = ph < dt
    x = ph[m] / dt[m] if np.ndim(dt) else ph[m] / dt
    y[m] = x + x - x * x - 1
    m2 = ph > 1 - (dt if not np.ndim(dt) else dt)
    x = (ph[m2] - 1) / (dt[m2] if np.ndim(dt) else dt)
    y[m2] = x * x + x + x + 1
    return y


def saw(f, n, phase0=0.0):
    dt = f / SR
    ph = (phase0 + dt * np.arange(n)) % 1.0
    return 2 * ph - 1 - polyblep(ph, dt)


def lowpass(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=-1)


def highpass(x, fc, order=2):
    sos = signal.butter(order, fc, "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=-1)


def bandpass(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, min(hi, SR * 0.45)], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=-1)


def noise(n):
    return rng.standard_normal(n)


def make_ir(seconds, damp=6000, predelay=0.02, stereo_seed=3):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    r = np.random.default_rng(stereo_seed)
    ir = r.standard_normal((2, n)) * np.exp(-6.9 * t / seconds)
    ir = lowpass(ir, damp, 1)
    ir[:, : int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    pad = np.zeros((2, int(predelay * SR)))
    ir = np.concatenate([pad, ir], axis=1)
    return ir / np.sqrt(np.sum(ir**2) / 2)


def reverb(x, ir, wet):
    y = np.vstack([signal.fftconvolve(x[0], ir[0])[: x.shape[1]], signal.fftconvolve(x[1], ir[1])[: x.shape[1]]])
    return y * wet


def pingpong(x, delay_s, fb=0.45, repeats=6, damp=4500):
    d = int(delay_s * SR)
    out = np.zeros_like(x)
    src = x.copy()
    mono = (src[0] + src[1]) * 0.5
    cur = mono
    for k in range(1, repeats + 1):
        cur = lowpass(cur, damp, 1)
        ch = k % 2
        out[ch, k * d :] += cur[: N - k * d] * fb**k
    return out


def automation(points):
    """Piecewise-linear curve over the whole track: points = [(t, v), ...]."""
    t = np.arange(N) / SR
    ts, vs = zip(*points)
    return np.interp(t, ts, vs)


def lufs(x):
    """Integrated loudness (ITU-R BS.1770-4, 48 kHz) of a stereo (2, n) signal."""
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621]
    y = signal.lfilter(b2, a2, signal.lfilter(b1, a1, x, axis=-1), axis=-1)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    p = np.array([np.mean(y[:, i : i + blk] ** 2, axis=1).sum() for i in range(0, y.shape[1] - blk, hop)])
    l = -0.691 + 10 * np.log10(p + 1e-12)
    p = p[l > -70]
    rel = -0.691 + 10 * np.log10(p.mean()) - 10
    p = p[-0.691 + 10 * np.log10(p) > rel]
    return -0.691 + 10 * np.log10(p.mean())


def limiter(x, ceiling_db=-1.5, lookahead=0.004, release=0.08):
    """Look-ahead brickwall limiter (4x oversampled peak detection)."""
    from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

    c = db(ceiling_db)
    up = signal.resample_poly(np.abs(x).max(axis=0), 4, 1)
    pk = np.abs(up).reshape(-1, 4).max(axis=1)[: x.shape[1]]
    la = int(lookahead * SR)
    g = np.minimum(1.0, c / np.maximum(maximum_filter1d(pk, 2 * la + 1), 1e-9))
    g = minimum_filter1d(g, 2 * la + 1)
    g = uniform_filter1d(g, la * 2 + 1)
    # release smoothing: one-pole going up only
    b, a = signal.butter(1, 1 / (2 * np.pi * release), fs=SR)
    g = np.minimum(g, signal.filtfilt(b, a, g))
    return x * g


# ---------------------------------------------------------------------------
# Instruments
# ---------------------------------------------------------------------------
def supersaw(f, n, voices=5, detune=0.12):
    out = np.zeros(n)
    for i in range(voices):
        cents = (i - (voices - 1) / 2) / ((voices - 1) / 2) * detune * 100
        out += saw(f * 2 ** (cents / 1200), n, phase0=rng.random())
    return out / voices


def pad_note(m, dur, attack=0.6, release=1.2, bright=1.0):
    n = int((dur + release) * SR)
    f = mtof(m)
    x = supersaw(f, n) * 0.7 + np.sin(2 * np.pi * f * np.arange(n) / SR) * 0.3
    e = env_adsr(n, attack, 0.8, 0.85, release, hold=dur)
    return x * e


def pluck(f, n, bright=1.0, decay=1.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    k = 1
    while k * f < 12000 and k <= 24:
        amp = 1.0 / k**1.1
        d = (2.2 + 0.9 * k**1.35 / bright) / decay
        out += amp * np.sin(2 * np.pi * k * f * t + k * 0.3) * np.exp(-t * d)
        k += 1
    att = np.minimum(1, t / 0.002)
    return out * att * 0.5


def fm_bell(f, n, ratio=3.5, index=2.2, decay=2.5):
    t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * f * ratio * t) * index * np.exp(-t * 6)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * decay) * np.minimum(1, t / 0.003)


def kick(level=1.0):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 46 + 120 * np.exp(-t / 0.028)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.32)
    click = highpass(noise(n), 3000) * np.exp(-t / 0.004) * 0.25
    return np.tanh((body + click) * 1.6) * level


def clap():
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for k, dt in enumerate((0, 0.011, 0.022)):
        m = t >= dt
        e[m] += np.exp(-(t[m] - dt) / 0.006) * (0.8 if k < 2 else 1)
    e += np.exp(-np.maximum(t - 0.022, 0) / 0.12) * 0.35 * (t >= 0.022)
    return bandpass(noise(n), 900, 5000) * e


def hat(open_=False):
    n = int((0.25 if open_ else 0.08) * SR)
    t = np.arange(n) / SR
    return highpass(noise(n), 7500, 4) * np.exp(-t / (0.07 if open_ else 0.018))


def sidechain(kick_times, depth=0.55, release=0.16):
    g = np.ones(N)
    t = np.arange(N) / SR
    for kt in kick_times:
        s = int(kt * SR)
        e = min(N, s + int(release * 5 * SR))
        seg = t[s:e] - kt
        g[s:e] = np.minimum(g[s:e], 1 - depth * np.exp(-seg / release))
    return g


# ---------------------------------------------------------------------------
# Sound design
# ---------------------------------------------------------------------------
def sfx_whoosh(dur=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = noise(n)
    # Sweep a band-pass up then down by splitting into short frames.
    out = np.zeros(n)
    frames = 40
    fl = n // frames
    for i in range(frames):
        p = i / frames
        fc = 300 + 5500 * np.sin(np.pi * p) ** 2
        seg = bandpass(x[i * fl : (i + 2) * fl], fc * 0.6, fc * 1.6)
        w = np.hanning(len(seg))
        out[i * fl : i * fl + len(seg)] += seg * w
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    y = out * e
    pan = np.linspace(-0.7, 0.7, n)
    return np.vstack([y * np.cos((pan + 1) * np.pi / 4), y * np.sin((pan + 1) * np.pi / 4)]) * 1.4


def sfx_riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    p = t / dur
    x = noise(n)
    out = np.zeros(n)
    frames = 60
    fl = n // frames
    for i in range(frames):
        q = i / frames
        fc = 400 * 2 ** (q * 4.5)
        seg = bandpass(x[i * fl : (i + 2) * fl], fc * 0.7, fc * 1.4)
        out[i * fl : i * fl + len(seg)] += seg * np.hanning(len(seg))
    f = 110 * 2 ** (p * 3)
    tone = saw(1, n) * 0
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) * 0.3 + np.sin(ph * 1.5) * 0.15
    y = (out * 0.8 + tone) * p**2.2
    return np.vstack([y, np.roll(y, int(0.007 * SR))])


def sfx_impact():
    n = int(3.5 * SR)
    t = np.arange(n) / SR
    f = 38 + 70 * np.exp(-t / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9)
    crack = lowpass(noise(n), 2500) * np.exp(-t / 0.12) * 0.5
    y = np.tanh((boom + crack) * 1.4)
    st = np.vstack([y, y])
    return st + reverb(st, IR_HALL, 0.35)


def sfx_shimmer():
    bus_len = int(4.0 * SR)
    out = np.zeros((2, bus_len))
    notes = [84, 88, 91, 95, 96, 100, 103]
    r = np.random.default_rng(11)
    for i in range(14):
        m = notes[r.integers(len(notes))]
        start = int(r.uniform(0, 1.4) * SR)
        s = fm_bell(mtof(m), bus_len - start, ratio=2.0, index=0.8, decay=3.0) * r.uniform(0.3, 1)
        pan = r.uniform(-0.8, 0.8)
        out[0, start:] += s * np.cos((pan + 1) * np.pi / 4)
        out[1, start:] += s * np.sin((pan + 1) * np.pi / 4)
    return (out + reverb(out, IR_HALL, 0.8)) * 0.25


def sfx_swell(dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = highpass(noise(n), 2000) * (t / dur) ** 3
    y = np.vstack([x, np.roll(x, 300)])
    return y * 0.5


def sfx_click():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.012) * 0.6 + highpass(noise(n), 4000) * np.exp(-t / 0.003) * 0.5
    return np.vstack([y, y])


def sfx_blip(m=84):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    y = fm_bell(mtof(m), n, ratio=1.0, index=0.6, decay=9.0) * 0.6
    y += np.sin(2 * np.pi * mtof(m - 12) * t) * np.exp(-t / 0.03) * 0.3
    return y


def sfx_error():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    y = (np.sign(np.sin(2 * np.pi * 146.8 * t)) * 0.5 + np.sin(2 * np.pi * 155.6 * t)) * np.exp(-t / 0.07)
    y = lowpass(y, 1400, 2) * 0.8
    return np.vstack([y, y])


def sfx_key():
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    y = bandpass(noise(n), 1500, 6000) * np.exp(-t / 0.006) + np.sin(2 * np.pi * 320 * t) * np.exp(-t / 0.015) * 0.5
    return np.vstack([y, y]) * 0.8


def sfx_tick():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.006)
    return np.vstack([y, y]) * 0.5


def sfx_pop():
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    f = 520 + 900 * np.exp(-t / 0.025)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.04)
    return np.vstack([y, y]) * 0.6


def render_sfx():
    bus = Bus()
    for ev in TL["sfx"]:
        t, typ, g = ev["t"], ev["type"], ev.get("gain", 1.0)
        pan = ev.get("pan", 0.0)
        if typ == "whoosh":
            s = sfx_whoosh()
            bus.add(s, t - 0.55, gain=g * 0.5)
        elif typ == "riser":
            d = ev.get("dur", 2.0)
            bus.add(sfx_riser(d), t, gain=g * 0.35)
        elif typ == "impact":
            bus.add(sfx_impact(), t, gain=g * 0.45)
        elif typ == "shimmer":
            bus.add(sfx_shimmer(), t, gain=g)
        elif typ == "swell":
            d = 1.6
            bus.add(sfx_swell(d), t - d, gain=g * 0.5)
        elif typ == "click":
            bus.add(sfx_click(), t, gain=g * 0.5)
        elif typ == "error":
            bus.add(sfx_error(), t, gain=g * 0.35)
        elif typ == "key":
            bus.add(sfx_key(), t, gain=g * 0.5)
        elif typ == "tick":
            bus.add(sfx_tick(), t, gain=g * 0.3)
        elif typ == "pop":
            bus.add(sfx_pop(), t, gain=g * 0.35)
        elif typ == "blip":
            bus.add(sfx_blip(ev.get("note", 84)), t, pan=pan, gain=g * 0.18)
    wet = reverb(bus.x, IR_ROOM, 0.18)
    return bus.x + wet


# ---------------------------------------------------------------------------
# Voiceover
# ---------------------------------------------------------------------------
def render_vo(room_wet=0.05):
    bus = Bus()
    for vid, t in TL["vo"].items():
        x, sr = sf.read(os.path.join(VO_DIR, f"{vid}.wav"))
        assert sr == SR
        if x.ndim > 1:
            x = x.mean(axis=1)
        x = highpass(x, 85, 2)
        # Light presence lift and de-mud via simple shelving combos
        x = x + 0.25 * bandpass(x, 2500, 6000, 1) - 0.12 * bandpass(x, 200, 400, 1)
        # Level each line to the same RMS (speech-weighted)
        rms = np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2))
        x = x * (0.11 / rms)
        # Gentle compression (static curve on a smoothed envelope)
        env = np.maximum(signal.filtfilt(*signal.butter(1, 30, fs=SR), np.abs(x)), 1e-6)
        thr = 0.12
        gain = np.where(env > thr, (thr + (env - thr) / 3) / env, 1.0)
        x = x * gain
        bus.add(x, t, 0, 1.0)
    vo = bus.x
    vo = vo + reverb(vo, IR_ROOM, room_wet)
    return vo


def vo_duck(vo, depth_db=-9.0):
    env = np.abs(vo[0]) + np.abs(vo[1])
    env = signal.filtfilt(*signal.butter(1, 4, fs=SR), env)
    env = np.clip(env / (np.percentile(env[env > 1e-3], 60) + 1e-9), 0, 1)
    # Fast attack, slow release smoothing
    b, a = signal.butter(1, 2.5, fs=SR)
    env = np.maximum(env, signal.filtfilt(b, a, env))
    return db(depth_db) ** env
