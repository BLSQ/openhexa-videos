"""Ready-made score for a new video: a warm C-major song form whose intensity follows the scenes.

    import synth; synth.init()
    import song
    song.render(energy={"intro": 0, "feature": 3, "outro": 1})

energy per scene (scene names from TL["scenes"], in time order):
    0  pad only                       1  + eighth-note arpeggio
    2  + half-time kick, hats, bass    3  full groove: sixteenths, four-on-the-floor, claps
The chords float (Fmaj7/C) until the first scene at energy >= 2, then loop C G/B Am7 Fmaj7; a
cadence (F, G) lands on TL["outroHit"], the end-card downbeat, and the final chord rings out.
Derived from the getting-started arrangement (videos/getting-started/music.py).
"""

import numpy as np

import synth as S


def render(energy, music_db=-25.0, vo_room=0.04, duck_db=-7.0, motif_scenes=None):
    TL, BEAT, DUR, SR = S.TL, S.BEAT, S.DUR, S.SR
    origin = TL["gridOrigin"]
    BAR = 4

    def b2s(beat):
        return origin + beat * BEAT

    def bar_at(t):
        return int(round((t - origin) / BEAT / BAR))

    scenes = sorted(TL["scenes"].items(), key=lambda kv: kv[1])
    unknown = [k for k in energy if k not in TL["scenes"]]
    if unknown:
        raise SystemExit(f"song.render: unknown scene(s) {unknown}; scenes are {[k for k, _ in scenes]}")
    starts = [(bar_at(t), name) for name, t in scenes]
    b_hit = bar_at(TL["outroHit"])
    b_end = int(np.ceil((DUR - origin) / BEAT / BAR)) + 1
    first_beat = int(np.ceil(-origin / BEAT))

    def scene_at_bar(b):
        cur = starts[0][1]
        for sb, name in starts:
            if b >= sb:
                cur = name
        return cur

    def level(beat):
        b = beat / BAR
        return -1 if b >= b_hit else energy.get(scene_at_bar(int(b)), 1)

    groove_bar = next((sb for sb, name in starts if energy.get(name, 1) >= 2), b_hit)
    LOOP = [(36, [55, 60, 64, 67, 71]), (35, [55, 59, 62, 67]), (33, [55, 57, 60, 64]), (41, [57, 60, 64, 65, 69])]
    INTRO = [(41, [57, 60, 64, 69]), (36, [55, 60, 64, 67])]
    CADENCE = [(41, [57, 60, 65, 69]), (43, [55, 59, 62, 67, 74])]
    FINAL = (36, [48, 55, 60, 64, 67, 71, 76])
    chords = []
    for b in range(b_end):
        if b >= b_hit:
            chords.append((b * BAR, b_end * BAR, *FINAL))
            break
        if b >= b_hit - 2:
            c = CADENCE[b - (b_hit - 2)]
        elif b < groove_bar:
            c = INTRO[(b // 2) % 2]
        else:
            c = LOOP[(b - groove_bar) % 4]
        chords.append((b * BAR, (b + 1) * BAR, *c))

    def chord_at(beat):
        for c in chords:
            if c[0] <= beat < c[1]:
                return c
        return chords[-1]

    # pad
    bus = S.Bus()
    for b0, b1, _, voicing in chords:
        for i, m in enumerate(voicing):
            pan = (i / max(1, len(voicing) - 1)) * 1.2 - 0.6
            bus.add(_pad_note(m, b2s(b1 - b0) - origin), b2s(b0), pan, 0.14)
    pad_level = {0: 0.85, 1: 0.9, 2: 0.8, 3: 0.62}
    pts = [(0, 0.0), (1.0, pad_level[energy.get(scenes[0][0], 0)])]
    pts += [(max(1.1, t), pad_level[energy.get(name, 1)]) for name, t in scenes[1:]]
    pts += [(TL["outroHit"], 1.0), (DUR - 0.6, 0.9), (DUR + 0.3, 0.0), (DUR + 0.5, 0.0)]
    pad = S.highpass(S.lowpass(bus.x, 2600, 2) * S.automation(sorted(pts)), 140, 2)

    # arpeggio
    bus = S.Bus()
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    for step in range(0, int(b_hit * BAR * 4)):
        beat = step / 4
        lv = level(beat)
        if lv < 1 or (lv < 3 and step % 2):
            continue
        tones = sorted(set(chord_at(beat)[3]))[-4:]
        m = tones[pattern[step % 8] % len(tones)] + 12
        g = {1: 0.07, 2: 0.09, 3: 0.085}[lv] * (1.0 if step % 4 == 0 else 0.7)
        bus.add(S.pluck(S.mtof(m), int(0.5 * SR), bright=0.7, decay=1.6), b2s(beat), pan=0.35 if step % 2 else -0.35, gain=g)
    bus.x += S.pingpong(bus.x, BEAT * 0.75, fb=0.33, repeats=5)
    arp = S.highpass(bus.x, 260, 2)

    # bells: opening motif, motif again on the listed scenes, chord at the hit
    motif = [(0, 76, 1), (1, 79, 0.5), (1.5, 76, 1), (2.5, 74, 1.5), (4, 72, 1), (5, 74, 0.5), (5.5, 76, 2)]
    bus = S.Bus()
    at = [(first_beat + 0.5, 0.075)] + [(bar_at(TL["scenes"][s]) * BAR, 0.05) for s in (motif_scenes or [])]
    for start, g in at:
        for o, m, _ in motif:
            bus.add(S.fm_bell(S.mtof(m + 12), int(1.8 * SR)), b2s(start + o), pan=0.15, gain=g)
    for i, m in enumerate([72, 76, 79, 84]):
        bus.add(S.fm_bell(S.mtof(m + 12), int(4.0 * SR), decay=1.0), b2s(b_hit * BAR) + i * 0.04, pan=(i - 1.5) * 0.3, gain=0.06)
    bus.x += S.pingpong(bus.x, BEAT * 0.75, fb=0.4, repeats=6)
    bells = S.highpass(bus.x, 400)

    # drums
    kb, cb, hb = S.Bus(), S.Bus(), S.Bus()
    kick_times = []
    for beat in range(0, b_hit * BAR):
        lv = level(beat)
        if lv < 2:
            continue
        t = b2s(beat)
        full = lv == 3
        if full or beat % 2 == 0:
            kb.add(_kick(), t, 0, 0.42 if full else 0.3)
            kick_times.append(t)
        if full and beat % 2 == 1:
            cb.add(S.clap(), t, 0.05, 0.13)
        for s in range(4):
            if not full and s % 2:
                continue
            acc = [0.5, 0.25, 1.0, 0.3][s]
            hb.add(S.hat(open_=(s == 2 and full and beat % 4 == 3)), t + s * BEAT / 4, pan=0.25 if s % 2 else -0.15, gain=0.035 * acc)
    fills = [sb for (sb, name), prev in zip(starts[1:], starts) if energy.get(name, 1) == 3 and energy.get(prev[1], 1) < 3] + [b_hit]
    for b in fills:
        for i in range(8):
            cb.add(S.clap(), b2s(b * BAR - 2) + i * BEAT / 4, 0, 0.03 + 0.07 * i / 8)
    kb.add(_kick(1.1), b2s(b_hit * BAR), 0, 0.5)
    cb.x += S.reverb(cb.x, S.IR_ROOM, 0.35)
    drums = kb.x + cb.x + hb.x

    # bass
    bus = S.Bus()
    for b0, b1, root, _ in chords:
        lv = level(b0)
        if lv == -1:
            n = int(5 * SR)
            t = np.arange(n) / SR
            bus.add(np.sin(2 * np.pi * S.mtof(root) * t) * np.exp(-t / 2.2) * np.minimum(1, t / 0.01), b2s(b0), 0, 0.28)
            continue
        if lv < 2:
            continue
        step = 1.0 if lv == 2 else 0.5
        for i in range(int((b1 - b0) / step)):
            dur = BEAT * step * 0.85
            n = int((dur + 0.08) * SR)
            f = S.mtof(root)
            t = np.arange(n) / SR
            x = np.sin(2 * np.pi * f * t) + 0.3 * S.lowpass(S.saw(f, n), 700, 2)
            bus.add(np.tanh(x * 1.2) * S.env_adsr(n, 0.004, 0.12, 0.6, 0.06, hold=dur), b2s(b0 + i * step), 0, 0.16)
    bass = bus.x

    sc = S.sidechain(kick_times, depth=0.45)
    music = (pad + arp * 0.9 + bass) * sc + bells + drums
    music = music + S.reverb(pad * 0.5 + arp * 0.6 + bells * 0.6, S.IR_HALL, 0.4)
    music *= S.automation([(0, 0.0), (0.3, 1.0), (DUR - 1.2, 1.0), (DUR + 0.4, 0.0), (DUR + 0.5, 0.0)])
    music = S.lowpass(music, 16000, 1)
    mix_and_master(music, music_db=music_db, vo_room=vo_room, duck_db=duck_db)


def mix_and_master(music, music_db=-25.0, vo_room=0.04, duck_db=-7.0):
    """Narration at -18 dBFS RMS, music bed music_db under it (ducked), sound effects, then -14 LUFS
    with a -1.5 dBFS ceiling. Writes music/sfx/vo/mix stems to OUT."""
    sfx = S.render_sfx()
    vo = S.render_vo(room_wet=vo_room)
    active = np.abs(vo).max(axis=0) > 0.01
    vo = vo * S.db(-18 - 20 * np.log10(np.sqrt(np.mean(vo[:, active] ** 2))))
    loud = np.abs(music).max(axis=0) > 1e-4
    music = music * S.db(music_db - 20 * np.log10(np.sqrt(np.mean(music[:, loud] ** 2)) + 1e-12))
    if np.max(np.abs(sfx)) > 0:
        sfx = sfx * S.db(-12 - 20 * np.log10(np.max(np.abs(sfx)) + 1e-9)) * 1.8
    duck = S.vo_duck(vo, depth_db=duck_db)
    mix = music * duck + sfx * (0.6 + 0.4 * duck) + vo
    for _ in range(3):
        mix = S.limiter(mix * S.db(-14 - S.lufs(mix)))
    print("master loudness", round(S.lufs(mix), 2), "LUFS, peak", round(20 * np.log10(np.abs(mix).max()), 2), "dBFS")
    S.write_stems({"music": music, "sfx": sfx, "vo": vo, "mix": mix})


def _pad_note(m, dur, attack=0.5, release=1.4):
    n = int((dur + release) * S.SR)
    f = S.mtof(m)
    x = S.supersaw(f, n, detune=0.1) * 0.55 + np.sin(2 * np.pi * f * np.arange(n) / S.SR) * 0.45
    return x * S.env_adsr(n, attack, 0.8, 0.85, release, hold=dur)


def _kick(level=1.0):
    n = int(0.45 * S.SR)
    t = np.arange(n) / S.SR
    f = 48 + 110 * np.exp(-t / 0.026)
    body = np.sin(2 * np.pi * np.cumsum(f) / S.SR) * np.exp(-t / 0.26)
    click = S.highpass(S.noise(n), 3000) * np.exp(-t / 0.004) * 0.2
    return np.tanh((body + click) * 1.4) * level
