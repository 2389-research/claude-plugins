// ABOUTME: Tests every scene passes the render contract and that the contract itself still bites.
// ABOUTME: Runs render.js --check, which needs neither Chrome nor ffmpeg, so it is CI-safe.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const RENDER = path.join(ROOT, 'scripts', 'animations', 'render.js');
const SCENES = path.join(ROOT, 'scripts', 'animations', 'scenes');

// Every committed scene passes.
execFileSync('node', [RENDER, '--check'], { cwd: ROOT, stdio: 'pipe' });

// The tokens hold their floors. palette.selfCheck runs inside --check, but assert the
// numbers here too so a silent edit to a hex is a test failure with a readable message.
const palette = require('../scripts/animations/palette');
assert.deepStrictEqual(palette.selfCheck(), [], 'palette tokens must clear their contrast floors');
for (const [name, hex] of Object.entries(palette.NEUTRAL_TEXT)) {
  const ratio = palette.contrast(hex, palette.PAPER);
  assert.ok(ratio >= palette.TEXT_FLOOR, `${name} ${hex} is ${ratio.toFixed(2)}:1, below the text floor`);
}

// A gate that cannot fail is not a gate. Each probe is a scene that breaks exactly one
// rule; --check must reject all of them.
const BASE = fs.readFileSync(path.join(__dirname, '..', '.claude', 'skills',
  'authoring-motion-diagrams', 'references', 'scene-template.svg'), 'utf8');

const PROBES = {
  'grey below the text floor': (s) => s.replace('fill="#767168"', 'fill="#8a857a"'),
  'a mark colour as a solid block': (s) => s.replace('fill="#2e7b8a"', 'fill="#2f7d8c"'),
  'a keySplines count that disables the animation': (s) => s.replace(
    'keySplines="0.22 0.9 0.3 1;0.22 0.9 0.3 1;0.22 0.9 0.3 1;0.22 0.9 0.3 1"',
    'keySplines="0.22 0.9 0.3 1;0.22 0.9 0.3 1;0.22 0.9 0.3 1"',
  ),
  'a cycle that is not 8s': (s) => s.replace('dur="8s"', 'dur="6s"'),
  'no paper ground rect': (s) => s.replace('<rect width="1200" height="400" fill="#faf9f6"/>', ''),
  'placement off the 20px grid': (s) => s.replace('x="100" y="180"', 'x="103" y="180"'),
};

for (const [label, mutate] of Object.entries(PROBES)) {
  const probe = path.join(SCENES, `__probe-${Math.abs(hash(label))}.svg`);
  fs.writeFileSync(probe, mutate(BASE));
  try {
    const run = spawnSync('node', [RENDER, '--check'], { cwd: ROOT, encoding: 'utf8' });
    assert.strictEqual(run.status, 1, `--check should reject ${label}`);
  } finally {
    fs.rmSync(probe);
  }
}

// The unmutated template must pass, or the probes above prove nothing.
const clean = path.join(SCENES, '__probe-clean.svg');
fs.writeFileSync(clean, BASE);
try {
  execFileSync('node', [RENDER, '--check'], { cwd: ROOT, stdio: 'pipe' });
} finally {
  fs.rmSync(clean);
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

console.log('animation contract tests passed');
