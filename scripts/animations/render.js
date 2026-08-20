// ABOUTME: Renders each scene SVG in scripts/animations/scenes/ to an MP4 + poster PNG per plugin.
// ABOUTME: Scrubs the SMIL clock in headless Chrome frame by frame, then encodes with ffmpeg.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync, execFile } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const SCENES = path.join(__dirname, 'scenes');
const WORK = path.join(os.tmpdir(), 'claude-plugins-anim');

const FPS = 30;
const CYCLE = 8; // seconds — every scene shares one cycle length
// Fraction of the cycle the poster is shot at. Late in the hold, after even the
// slowest-settling scene has finished drawing, and before the 0.95 fade-out — a poster
// caught mid-draw shows a half-finished line, which reads as a broken diagram.
const POSTER_AT = 0.94;
const WIDTH = 1200;
const HEIGHT = 400;
const SCALE = 2; // shoot at 2x, downsample on encode for cleaner edges
// Chrome's content viewport comes out ~88px shorter than --window-size, which silently
// clips the bottom of the scene. Shoot with vertical slack and crop back to HEIGHT.
const WINDOW_SLACK = 160;
const PARALLEL = Math.max(2, os.cpus().length - 2);
const GROUND = 'FAF9F6FF'; // --paper, matches the ground rect inside every scene

const CHROME = process.env.CHROME_BIN
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Three SMIL attribute counts must agree or the browser silently disables the
// animation — the element just keeps its authored value and nothing reports it.
function validateScene(name, svg) {
  const problems = [];
  for (const m of svg.matchAll(/<(animate|animateMotion|animateTransform)\b[^>]*?\/>/g)) {
    const tag = m[0];
    const kt = tag.match(/keyTimes="([^"]+)"/);
    if (!kt) continue;
    const n = kt[1].split(';').length;
    const checks = [
      ['keySplines', /keySplines="([^"]+)"/, n - 1],
      ['values', /values="([^"]+)"/, n],
      ['keyPoints', /keyPoints="([^"]+)"/, n],
    ];
    for (const [label, pattern, want] of checks) {
      const found = tag.match(pattern);
      if (!found) continue;
      const got = found[1].split(';').length;
      if (got !== want) problems.push(`${name}: ${label} count ${got} != ${want}`);
    }
    const dur = tag.match(/dur="([^"]+)"/);
    if (dur && dur[1] !== `${CYCLE}s`) problems.push(`${name}: dur ${dur[1]} != ${CYCLE}s`);
  }
  if (!/<rect[^>]*fill="#faf9f6"/i.test(svg)) {
    problems.push(`${name}: no paper ground rect — the scene will composite onto the host page`);
  }
  return problems;
}

// The scrub page. An <img>-embedded SVG is frozen at t=0, so the SVG is inlined
// and the clock is set explicitly from the query string before the screenshot.
function framePage(svg) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:#faf9f6;}
  svg{display:block;}
</style></head><body>
${svg}
<script>
  const s = document.querySelector('svg');
  const t = parseFloat(new URLSearchParams(location.search).get('t') || '0');
  s.pauseAnimations();
  s.setCurrentTime(t);
</script>
</body></html>`;
}

function shoot(pageUrl, t, outPng) {
  return new Promise((resolve, reject) => {
    execFile(CHROME, [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      `--force-device-scale-factor=${SCALE}`,
      `--window-size=${WIDTH},${HEIGHT + WINDOW_SLACK}`,
      `--default-background-color=${GROUND}`,
      `--screenshot=${outPng}`,
      `${pageUrl}?t=${t.toFixed(4)}`,
    ], { timeout: 60000 }, (err) => (err ? reject(err) : resolve()));
  });
}

async function pool(tasks, limit) {
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < tasks.length) {
      const mine = i++;
      await tasks[mine]();
    }
  });
  await Promise.all(workers);
}

function uniqueFrameCount(dir) {
  const out = execFileSync('/bin/sh', ['-c',
    `md5 -q ${JSON.stringify(dir)}/f*.png | sort -u | wc -l`], { encoding: 'utf8' });
  return parseInt(out.trim(), 10);
}

const FILTER = `crop=${WIDTH * SCALE}:${HEIGHT * SCALE}:0:0,`
  + `scale=${WIDTH}:${HEIGHT}:flags=lanczos`;

// The poster is shot on its own rather than lifted out of the frame sweep, so it can
// be regenerated without re-encoding the video.
async function shootPoster(pageUrl, work, outDir) {
  const raw = path.join(work, 'poster-raw.png');
  await shoot(pageUrl, CYCLE * POSTER_AT, raw);
  const poster = path.join(outDir, 'anim-poster.png');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-vf', FILTER, poster]);
  fs.rmSync(raw);
  return poster;
}

async function renderScene(file, posterOnly) {
  const name = path.basename(file, '.svg');
  const svg = fs.readFileSync(path.join(SCENES, file), 'utf8');

  const problems = validateScene(name, svg);
  if (problems.length) {
    problems.forEach((p) => console.error(`  ✗ ${p}`));
    throw new Error(`${name}: scene failed validation`);
  }

  const outDir = path.join(ROOT, 'docs', 'plugins', name);
  if (!fs.existsSync(outDir)) throw new Error(`${name}: no page dir at docs/plugins/${name}`);

  const work = path.join(WORK, name);
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  const page = path.join(work, 'frame.html');
  fs.writeFileSync(page, framePage(svg));
  const pageUrl = `file://${page}`;

  const kb = (p) => Math.round(fs.statSync(p).size / 1024);

  if (posterOnly) {
    const poster = await shootPoster(pageUrl, work, outDir);
    fs.rmSync(work, { recursive: true, force: true });
    console.log(`  ✓ ${name} — poster ${kb(poster)}KB (t=${(CYCLE * POSTER_AT).toFixed(2)}s)`);
    return;
  }

  const total = FPS * CYCLE;
  const tasks = [];
  for (let f = 0; f < total; f++) {
    const t = f / FPS;
    const png = path.join(work, `f${String(f).padStart(4, '0')}.png`);
    tasks.push(() => shoot(pageUrl, t, png));
  }
  await pool(tasks, PARALLEL);

  // A GIF or MP4 built from near-identical frames looks static and ffmpeg
  // reports nothing, so the uniqueness check is a hard gate.
  const uniq = uniqueFrameCount(work);
  if (uniq <= 20) throw new Error(`${name}: only ${uniq} unique frames — animation is not moving`);

  const mp4 = path.join(outDir, 'anim.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error',
    '-framerate', String(FPS), '-i', path.join(work, 'f%04d.png'),
    '-vf', FILTER,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20',
    '-movflags', '+faststart', mp4]);

  const poster = await shootPoster(pageUrl, work, outDir);

  fs.rmSync(work, { recursive: true, force: true });

  console.log(`  ✓ ${name} — ${uniq} unique frames · mp4 ${kb(mp4)}KB · poster ${kb(poster)}KB`);
}

async function main() {
  const argv = process.argv.slice(2);
  const posterOnly = argv.includes('--poster-only');
  const only = argv.filter((a) => !a.startsWith('--'));
  const files = fs.readdirSync(SCENES).filter((f) => f.endsWith('.svg'))
    .filter((f) => !only.length || only.includes(path.basename(f, '.svg')))
    .sort();

  if (!files.length) {
    console.error('No scenes to render.');
    process.exit(1);
  }

  console.log(posterOnly
    ? `Reshooting ${files.length} poster${files.length === 1 ? '' : 's'} at ${WIDTH}x${HEIGHT}`
    : `Rendering ${files.length} scene${files.length === 1 ? '' : 's'} `
      + `at ${WIDTH}x${HEIGHT}, ${FPS}fps, ${CYCLE}s cycle (${PARALLEL} shooters)`);

  const failed = [];
  for (const file of files) {
    try {
      await renderScene(file, posterOnly);
    } catch (err) {
      failed.push(err.message);
      console.error(`  ✗ ${err.message}`);
    }
  }

  if (failed.length) {
    console.error(`\n${failed.length} scene(s) failed.`);
    process.exit(1);
  }
}

main();
