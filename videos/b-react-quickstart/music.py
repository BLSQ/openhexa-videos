"""Score and mix: the shared song form (tools/audio/song.py), one energy level per scene.
Write a custom arrangement here instead when the video needs one (see videos/getting-started/music.py)."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "audio"))
import synth  # noqa: E402

synth.init()
import song  # noqa: E402

song.render(energy={"intro": 0, "concept": 1, "join": 2, "files": 2, "datasets": 3, "pipelines": 3, "members": 2, "ai": 3, "rules": 1, "outro": 1})
