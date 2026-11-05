// Packages the openhexa-video skill for upload to claude.ai (organization skills):
//   node tools/build-skill.mjs        -> dist/openhexa-video-skill.zip
// The zip holds the skill folder (.claude/skills/openhexa-video), the docs as references/, and the
// whole kit as kit.tar.gz, built from the last commit (HEAD) so the skill matches the repo
// exactly. In a sandbox without repo access, scripts/setup.sh unpacks it. Rebuild and re-upload
// after merging changes to main.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './lib.mjs';

const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', ...opts }).trim();
const sha = sh('git', ['rev-parse', '--short', 'HEAD']);
if (sh('git', ['status', '--porcelain'])) console.warn('warning: uncommitted changes are NOT in the kit (it is built from HEAD)');

const dist = path.join(ROOT, 'dist');
const stage = path.join(dist, 'skill', 'openhexa-video');
fs.rmSync(path.join(dist, 'skill'), { recursive: true, force: true });
fs.mkdirSync(path.join(stage, 'references'), { recursive: true });
fs.cpSync(path.join(ROOT, '.claude', 'skills', 'openhexa-video'), stage, { recursive: true });
for (const f of ['playbook.md', 'app-facts.md', 'components.md', 'lessons.md']) fs.copyFileSync(path.join(ROOT, 'docs', f), path.join(stage, 'references', f));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ohv-kit-'));
const tar = path.join(tmp, 'kit.tar');
sh('git', ['archive', '--format=tar', '-o', tar, 'HEAD', '--', '.', ':(exclude).claude']);
const kitDir = path.join(tmp, 'kit');
fs.mkdirSync(kitDir);
execFileSync('tar', ['-xf', tar, '-C', kitDir]);
fs.writeFileSync(path.join(kitDir, 'KIT_VERSION'), `BLSQ/openhexa-videos@${sha} (${sh('git', ['log', '-1', '--format=%cs'])})\n`);
execFileSync('tar', ['-czf', path.join(stage, 'kit.tar.gz'), '-C', kitDir, '.']);
fs.rmSync(tmp, { recursive: true, force: true });

const zip = path.join(dist, 'openhexa-video-skill.zip');
fs.rmSync(zip, { force: true });
execFileSync('zip', ['-qr', zip, 'openhexa-video'], { cwd: path.join(dist, 'skill') });
const mb = (f) => (fs.statSync(f).size / 1e6).toFixed(1) + ' MB';
console.log(`wrote dist/openhexa-video-skill.zip (${mb(zip)}; kit ${mb(path.join(stage, 'kit.tar.gz'))}, from ${sha})`);
