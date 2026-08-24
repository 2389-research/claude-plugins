// ABOUTME: The motion binding's colour tokens plus the WCAG maths that keeps them honest.
// ABOUTME: Single source of truth for render.js validation and the authoring skill's binding doc.

// Ground. Every scene paints this as its first element, so it is the background every
// mark and label is measured against.
const PAPER = '#faf9f6';
const WHITE = '#ffffff';

// Neutral type ladder. All four clear 4.5:1 on paper.
const NEUTRAL_TEXT = {
  ink: '#171512',    // 17.31:1 — primary labels
  strong: '#33302a', // 12.49:1
  body: '#4a453b',   //  9.04:1
  muted: '#767168',  //  4.60:1 — the dimmest legal label
};

// Category accents. `mark` is the brand colour and is used for strokes, dashed routes
// and low-opacity washes, where the 3:1 floor for meaningful marks applies. `ink` is the
// darkened sibling used for two jobs that need the 4.5:1 text floor: accent-coloured
// labels, and any solid block that carries white type. Darkening improves both at once,
// so one extra token per category covers both cases.
const CATEGORIES = {
  'Development':            { mark: '#e6196e', ink: '#da1868' },
  'Testing & Review':       { mark: '#2f7d8c', ink: '#2e7b8a' },
  'Agents & Orchestration': { mark: '#7a3fb0', ink: '#7a3fb0' },
  'Infrastructure & Ops':   { mark: '#c67514', ink: '#a56111' },
  'Strategy & Reflection':  { mark: '#1f9e6b', ink: '#198158' },
};

// Hairlines and dashed route guides. Below 3:1 on purpose — they carry no meaning on
// their own, they only show where something is about to go.
const STRUCTURE = { hairline: '#e2ddd2', route: '#d8d3c8' };

const MARKS = Object.values(CATEGORIES).map((c) => c.mark);
const INKS = Object.values(CATEGORIES).map((c) => c.ink);

// Text fills a scene may use. White and paper are here because they are only ever set on
// type sitting inside a solid block, and solid blocks are restricted to ink tokens by
// `soldFillProblems` below — which is what makes them safe without resolving geometry.
const LEGAL_TEXT_FILLS = new Set([
  ...Object.values(NEUTRAL_TEXT),
  ...INKS,
  WHITE,
  PAPER,
]);

// Solid blocks that can carry white type. Anything else filled at full strength is a
// mark colour used where an ink belongs.
const LEGAL_SOLID_FILLS = new Set([...INKS, NEUTRAL_TEXT.ink, WHITE, PAPER]);

const TEXT_FLOOR = 4.5;
const MARK_FLOOR = 3.0;

function luminance(hex) {
  const h = hex.replace('#', '');
  const parts = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2];
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// The tokens are values in a file, so nothing stops someone nudging one until it no
// longer clears its floor. This recomputes every claim above and is called before any
// scene is checked, so a bad token fails the build rather than shipping quietly.
function selfCheck() {
  const problems = [];
  for (const [name, hex] of Object.entries(NEUTRAL_TEXT)) {
    const ratio = contrast(hex, PAPER);
    if (ratio < TEXT_FLOOR) {
      problems.push(`token NEUTRAL_TEXT.${name} ${hex} is ${ratio.toFixed(2)}:1 on paper, needs ${TEXT_FLOOR}`);
    }
  }
  for (const [name, { mark, ink }] of Object.entries(CATEGORIES)) {
    const markRatio = contrast(mark, PAPER);
    if (markRatio < MARK_FLOOR) {
      problems.push(`token ${name}.mark ${mark} is ${markRatio.toFixed(2)}:1 on paper, needs ${MARK_FLOOR}`);
    }
    const inkOnPaper = contrast(ink, PAPER);
    if (inkOnPaper < TEXT_FLOOR) {
      problems.push(`token ${name}.ink ${ink} is ${inkOnPaper.toFixed(2)}:1 on paper, needs ${TEXT_FLOOR}`);
    }
    const whiteOnInk = contrast(WHITE, ink);
    if (whiteOnInk < TEXT_FLOOR) {
      problems.push(`token ${name}.ink ${ink} gives white type ${whiteOnInk.toFixed(2)}:1, needs ${TEXT_FLOOR}`);
    }
  }
  return problems;
}

module.exports = {
  PAPER,
  WHITE,
  NEUTRAL_TEXT,
  CATEGORIES,
  STRUCTURE,
  MARKS,
  INKS,
  LEGAL_TEXT_FILLS,
  LEGAL_SOLID_FILLS,
  TEXT_FLOOR,
  MARK_FLOOR,
  contrast,
  selfCheck,
};
