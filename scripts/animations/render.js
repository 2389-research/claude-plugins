// ABOUTME: Renders each scene SVG in scripts/animations/scenes/ to an MP4 + poster PNG per plugin.
// ABOUTME: Scrubs the SMIL clock in headless Chrome frame by frame, then encodes with ffmpeg.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync, spawn } = require('child_process');
const palette = require('./palette');

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
const SHOT_TIMEOUT = 60000; // per frame; a wedged Chrome is killed rather than waited on
const GROUND = 'FAF9F6FF'; // --paper, matches the ground rect inside every scene
const GRID = 20;
// Placement debt, frozen per scene. The scenes predate the grid check and only two of
// them were ever on it, so the gate ratchets instead of grandfathering: a new scene must
// be clean, and an existing one may only improve. Lower a number here when you pay some
// of it back; the renderer says so when a scene beats its baseline.
const GRID_BASELINE = path.join(__dirname, 'grid-baseline.json');

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

// Ordered walk over a scene's tags, carrying `fill` down the tree the way SVG does — a
// label inside <g fill="#ffffff"> has a white fill even with no fill of its own, so
// checking the attribute alone would miss it.
function elements(svg) {
  const out = [];
  const stack = [{ fill: undefined }];
  const source = svg.replace(/<!--[\s\S]*?-->/g, '');
  for (const m of source.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
    const [, closing, tag, rawAttrs, selfClose] = m;
    if (closing) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const attrs = {};
    for (const a of rawAttrs.matchAll(/([\w:-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
    const fill = attrs.fill !== undefined ? attrs.fill : stack[stack.length - 1].fill;
    const content = tag === 'text' && !selfClose
      ? source.slice(m.index + m[0].length).split('<')[0]
      : '';
    out.push({ tag, attrs, fill, content });
    if (!selfClose) stack.push({ fill });
  }
  return out;
}

// Type below the contrast floor is the failure the binding is least able to see: it
// looks refined on the screen of whoever picked it. So legality is a token lookup rather
// than a judgement, and palette.selfCheck() keeps the tokens themselves honest.
function paletteProblems(name, svg) {
  const problems = new Set();
  for (const el of elements(svg)) {
    const fill = (el.fill || '').toLowerCase();
    // The floor governs type. A colour emoji is painted by the font, not by `fill`, so it
    // is exempt — but only when the glyph is all there is. Empty content means the label
    // is in child <tspan>s the walker cannot see, and that has to stay gated.
    const isType = el.content.trim() === '' || /[A-Za-z0-9]/.test(el.content);
    if (el.tag === 'text' && isType && !palette.LEGAL_TEXT_FILLS.has(fill)) {
      const measured = /^#[0-9a-f]{6}$/.test(fill)
        ? `${palette.contrast(fill, palette.PAPER).toFixed(2)}:1 on paper`
        : 'no fill resolved';
      problems.add(`${name}: text fill ${fill || '(none)'} is not a legal ink token `
        + `(${measured}, floor ${palette.TEXT_FLOOR}:1)`);
    }
    // A category whose accent already clears the text floor has mark === ink, so its
    // solid blocks are fine as authored.
    if (el.tag === 'rect' && palette.MARKS.includes(fill)
      && !palette.LEGAL_SOLID_FILLS.has(fill)) {
      // A wash is a mark and only needs 3:1. A block at full strength is type backing.
      const own = Number(el.attrs.opacity ?? el.attrs['fill-opacity'] ?? '1');
      if (own >= 0.5) {
        problems.add(`${name}: solid rect filled with the mark colour ${fill} — use that `
          + `category's ink so white type on it clears ${palette.TEXT_FLOOR}:1`);
      }
    }
  }
  return [...problems];
}

function offGridCount(svg) {
  let off = 0;
  for (const el of elements(svg)) {
    if (el.tag !== 'rect') continue;
    if (el.attrs.width === String(WIDTH) && el.attrs.height === String(HEIGHT)) continue;
    for (const attr of ['x', 'y']) {
      const v = el.attrs[attr];
      if (v === undefined) continue;
      const n = Number(v);
      if (Number.isFinite(n) && n % GRID !== 0) off += 1;
    }
  }
  return off;
}

function gridProblems(name, svg, baseline) {
  const off = offGridCount(svg);
  const allowed = baseline[name] ?? 0;
  if (off > allowed) {
    return [`${name}: ${off} off-${GRID}px placement coords, baseline allows ${allowed} — `
      + `put new geometry on the ${GRID}px grid`];
  }
  if (off < allowed) {
    console.log(`  · ${name} is under its grid baseline (${allowed} → ${off}) — lower it in `
      + path.basename(GRID_BASELINE));
  }
  return [];
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

// Chrome runs with its stdio ignored. With pipes attached, an orphaned Chrome helper can
// hold stdout open after the parent is killed, so the callback never fires and the frame
// pool waits on a promise that will never settle — a single wedged frame used to hang the
// whole render indefinitely, and `timeout` was powerless because it kills the process
// rather than closing the pipes. Ignoring stdio means `close` fires on exit regardless of
// what Chrome left behind.
function shootOnce(pageUrl, t, outPng) {
  return new Promise((resolve, reject) => {
    const child = spawn(CHROME, [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      `--force-device-scale-factor=${SCALE}`,
      `--window-size=${WIDTH},${HEIGHT + WINDOW_SLACK}`,
      `--default-background-color=${GROUND}`,
      `--screenshot=${outPng}`,
      `${pageUrl}?t=${t.toFixed(4)}`,
    ], { stdio: 'ignore' });

    const watchdog = setTimeout(() => child.kill('SIGKILL'), SHOT_TIMEOUT);
    child.on('error', (err) => {
      clearTimeout(watchdog);
      reject(err);
    });
    child.on('close', () => {
      clearTimeout(watchdog);
      // Chrome can exit cleanly having written nothing, so the frame is the real result.
      if (fs.existsSync(outPng)) resolve();
      else reject(new Error(`no frame written at t=${t.toFixed(4)}`));
    });
  });
}

// One dropped frame costs the whole scene, so a shot gets a second attempt before the
// render gives up on it.
async function shoot(pageUrl, t, outPng) {
  try {
    await shootOnce(pageUrl, t, outPng);
  } catch {
    await shootOnce(pageUrl, t, outPng);
  }
}

// Failures are collected rather than thrown straight out, so every worker drains before
// the scene gives up. Throwing from inside a worker used to leave its siblings running
// against a scene the renderer had already abandoned.
async function pool(tasks, limit) {
  let i = 0;
  const failures = [];
  const workers = Array.from({ length: limit }, async () => {
    while (i < tasks.length) {
      const mine = i++;
      try {
        await tasks[mine]();
      } catch (err) {
        failures.push(err);
      }
    }
  });
  await Promise.all(workers);
  if (failures.length) throw new Error(`${failures.length} frame(s) failed: ${failures[0].message}`);
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

async function renderScene(file, posterOnly, baseline) {
  const name = path.basename(file, '.svg');
  const svg = fs.readFileSync(path.join(SCENES, file), 'utf8');

  const problems = [
    ...validateScene(name, svg),
    ...paletteProblems(name, svg),
    ...gridProblems(name, svg, baseline),
  ];
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

  // ffmpeg's %04d input stops at the first gap in the sequence, so a single missing frame
  // silently yields a video that ends early instead of an error. Count them first.
  const shot = fs.readdirSync(work).filter((f) => /^f\d{4}\.png$/.test(f)).length;
  if (shot !== total) throw new Error(`${name}: ${shot} of ${total} frames on disk`);

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

  // A token that no longer clears its floor would let every scene using it pass, so the
  // binding is checked before any scene is.
  const tokenProblems = palette.selfCheck();
  if (tokenProblems.length) {
    tokenProblems.forEach((p) => console.error(`  ✗ ${p}`));
    process.exit(1);
  }
  const baseline = JSON.parse(fs.readFileSync(GRID_BASELINE, 'utf8'));

  // Validation on its own, so the contract can be checked without Chrome or ffmpeg —
  // it runs in the test suite, where rendering would be far too slow.
  if (argv.includes('--check')) {
    const found = files.flatMap((file) => {
      const name = path.basename(file, '.svg');
      const svg = fs.readFileSync(path.join(SCENES, file), 'utf8');
      return [
        ...validateScene(name, svg),
        ...paletteProblems(name, svg),
        ...gridProblems(name, svg, baseline),
      ];
    });
    found.forEach((p) => console.error(`  ✗ ${p}`));
    console.log(found.length
      ? `\n${found.length} problem(s) across ${files.length} scene(s).`
      : `${files.length} scene(s) pass the contract.`);
    process.exit(found.length ? 1 : 0);
  }

  console.log(posterOnly
    ? `Reshooting ${files.length} poster${files.length === 1 ? '' : 's'} at ${WIDTH}x${HEIGHT}`
    : `Rendering ${files.length} scene${files.length === 1 ? '' : 's'} `
      + `at ${WIDTH}x${HEIGHT}, ${FPS}fps, ${CYCLE}s cycle (${PARALLEL} shooters)`);

  const failed = [];
  for (const file of files) {
    try {
      await renderScene(file, posterOnly, baseline);
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
