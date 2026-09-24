// ABOUTME: Shoots a single frame of one or more scenes for a quick layout check.
// ABOUTME: Much cheaper than a full render — use it while iterating on scene geometry.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const SCENES = path.join(__dirname, 'scenes');
const OUT = process.env.PREVIEW_DIR || path.join(os.tmpdir(), 'claude-plugins-anim-preview');
const CYCLE = 8;
const WIDTH = 1200;
const HEIGHT = 400;
const SCALE = 2;
const WINDOW_SLACK = 160;
const CHROME = process.env.CHROME_BIN
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Fraction of the cycle to shoot. Defaults to where every scene holds its settled
// state, which is what the committed poster shows.
const at = parseFloat(process.env.AT || '0.85');

fs.mkdirSync(OUT, { recursive: true });

const names = process.argv.slice(2);
if (!names.length) {
  console.error('usage: node scripts/animations/preview.js <scene> [scene...]   (AT=0.4 to pick a moment)');
  process.exit(1);
}

for (const name of names) {
  const svg = fs.readFileSync(path.join(SCENES, `${name}.svg`), 'utf8');
  const page = path.join(OUT, `${name}.html`);
  fs.writeFileSync(page, `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#faf9f6;}svg{display:block;}</style></head>
<body>${svg}<script>
  const s = document.querySelector('svg');
  s.pauseAnimations();
  s.setCurrentTime(${(CYCLE * at).toFixed(4)});
</script></body></html>`);

  const raw = path.join(OUT, `${name}-raw.png`);
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
    `--force-device-scale-factor=${SCALE}`,
    `--window-size=${WIDTH},${HEIGHT + WINDOW_SLACK}`,
    '--default-background-color=FAF9F6FF',
    `--screenshot=${raw}`, `file://${page}`], { stdio: 'pipe' });

  const out = path.join(OUT, `${name}.png`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-vf',
    `crop=${WIDTH * SCALE}:${HEIGHT * SCALE}:0:0,scale=${WIDTH}:${HEIGHT}:flags=lanczos`, out]);
  fs.rmSync(raw);
  console.log(out);
}
