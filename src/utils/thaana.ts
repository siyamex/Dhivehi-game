import { CellCoord, GridCell, LevelConfig, PlacedWord, WordDirection } from '../types/game';

/**
 * Splits a Dhivehi Thaana string into atomic syllable units (Akuru + attached Fili).
 * Ensures vowel diacritics (U+07A6 - U+07B0) never detach from their base consonant (U+0780 - U+07A5).
 */
export function splitThaanaSyllables(word: string): string[] {
  const cleaned = word.replace(/\s+/g, '').trim();
  const syllables: string[] = [];
  const regex = /[\u0780-\u07A5][\u07A6-\u07B0]*|[^\u0780-\u07B0\s]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(cleaned)) !== null) {
    syllables.push(match[0]);
  }
  return syllables;
}

/**
 * Common authentic Dhivehi syllables (Akuru + Fili) used to fill empty cells in the grid
 * so distractors look natural and indistinguishable from real word parts.
 */
export const COMMON_THAANA_SYLLABLES: string[] = [
  'ހަ', 'ހި', 'ހު', 'ހެ', 'ހޯ',
  'ށަ', 'ށި', 'ށް',
  'ނަ', 'ނި', 'ނު', 'ން', 'ނެ', 'ނާ',
  'ރަ', 'ރި', 'ރު', 'ރާ', 'ރެ', 'ރޭ', 'ރޯ',
  'ބަ', 'ބި', 'ބު', 'ބާ', 'ބެ', 'ބޮ',
  'ޅަ', 'ޅި', 'ޅު',
  'ކަ', 'ކި', 'ކު', 'ކާ', 'ކެ', 'ކޮ',
  'އަ', 'އި', 'އު', 'އެ', 'އާ', 'އް',
  'ވަ', 'ވި', 'ވު', 'ވެ', 'ވާ',
  'މަ', 'މި', 'މު', 'މާ', 'މެ', 'މް',
  'ފަ', 'ފި', 'ފު', 'ފާ', 'ފެ',
  'ދަ', 'ދި', 'ދު', 'ދާ', 'ދެ', 'ދޯ',
  'ތަ', 'ތި', 'ތު', 'ތާ', 'ތެ', 'ތް',
  'ލަ', 'ލި', 'ލު', 'ލާ', 'ލެ',
  'ގަ', 'ގި', 'ގު', 'ގާ', 'ގެ',
  'ސަ', 'ސި', 'ސު', 'ސް', 'ސާ',
  'ޑަ', 'ޑި', 'ޑު',
  'ޒަ', 'ޒި', 'ޒު',
  'ޓަ', 'ޓި', 'ޓު',
  'ޔަ', 'ޔި', 'ޔު', 'ޔާ',
  'ޖަ', 'ޖި', 'ޖު', 'ޖެ',
];

/**
 * Deterministic 32-bit PRNG (Mulberry32) seeded from any string key (e.g. 'daily-2026-10-26').
 */
export function createSeededRng(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const t = (h ^= h >>> 16) >>> 0;
    return t / 4294967296;
  };
}

interface DirectionDelta {
  direction: WordDirection;
  dRow: number;
  dCol: number;
  labelDv: string;
  labelEn: string;
}

/**
 * Note on coordinate system:
 * Row 0 is top, Row N-1 is bottom.
 * Col 0 is physical left, Col N-1 is physical right.
 * Therefore, standard Dhivehi Right-to-Left horizontal reading starts at a right column
 * and moves left (dRow = 0, dCol = -1).
 */
export const DIRECTION_DELTAS: DirectionDelta[] = [
  {
    direction: 'RTL_HORIZONTAL',
    dRow: 0,
    dCol: -1,
    labelDv: 'ކަނާތުން ވާތަށް (ހުރަހަށް)',
    labelEn: 'Right-to-Left Horizontal',
  },
  {
    direction: 'DOWN_VERTICAL',
    dRow: 1,
    dCol: 0,
    labelDv: 'މަތިން ތިރިއަށް (ދިގަށް)',
    labelEn: 'Top-to-Bottom Vertical',
  },
  {
    direction: 'DIAG_DOWN_LEFT',
    dRow: 1,
    dCol: -1,
    labelDv: 'ކައްޗަށް (ކަނާތުން ތިރިއަށް)',
    labelEn: 'Diagonal Down-Left (RTL)',
  },
  {
    direction: 'UP_VERTICAL',
    dRow: -1,
    dCol: 0,
    labelDv: 'ތިރިން މައްޗަށް (ދިގަށް)',
    labelEn: 'Bottom-to-Top Vertical',
  },
  {
    direction: 'LTR_HORIZONTAL',
    dRow: 0,
    dCol: 1,
    labelDv: 'ވާތުން ކަނާތަށް (ހުރަހަށް)',
    labelEn: 'Left-to-Right Horizontal',
  },
  {
    direction: 'DIAG_UP_LEFT',
    dRow: -1,
    dCol: -1,
    labelDv: 'ކައްޗަށް (ކަނާތުން މައްޗަށް)',
    labelEn: 'Diagonal Up-Left (RTL)',
  },
];

export function getDirectionInfo(dir: WordDirection): DirectionDelta {
  return (
    DIRECTION_DELTAS.find((d) => d.direction === dir) || DIRECTION_DELTAS[0]
  );
}

/**
 * Generates a complete, solvable Thaana Word Search board from a LevelConfig.
 * Prioritizes RTL_HORIZONTAL, DOWN_VERTICAL, and DIAG_DOWN_LEFT for natural Dhivehi flow.
 */
export function generateWordSearchBoard(config: LevelConfig): {
  grid: GridCell[][];
  placedWords: PlacedWord[];
} {
  const size = config.gridSize;
  const rng = createSeededRng(config.seedKey);

  // If level provides a fixed reference grid (like the classic reference screenshot), use it first
  if (config.fixedGrid && config.fixedGrid.length === size) {
    const grid: GridCell[][] = config.fixedGrid.map((rowArr, r) =>
      rowArr.map((syllable, c) => ({
        row: r,
        col: c,
        syllable,
      }))
    );

    const placedWords: PlacedWord[] = [];
    config.words.forEach((lex, idx) => {
      const syls = lex.syllables.length > 0 ? lex.syllables : splitThaanaSyllables(lex.word);
      const foundPlacement = findSyllablePathInGrid(grid, syls);
      if (foundPlacement) {
        placedWords.push({
          id: `${config.id}-w-${idx}`,
          word: lex.word,
          syllables: syls,
          meaningEn: lex.meaningEn,
          transliteration: lex.transliteration,
          cells: foundPlacement.cells,
          direction: foundPlacement.direction,
          found: false,
          colorIndex: idx % 6,
          hintTierRevealed: 0,
        });
      }
    });

    return { grid, placedWords };
  }

  // Empty matrix
  const matrix: (string | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );

  // Sort words longest first for optimal packing
  const sortedWords = [...config.words]
    .map((w) => ({
      ...w,
      syllables: w.syllables.length > 0 ? w.syllables : splitThaanaSyllables(w.word),
    }))
    .filter((w) => w.syllables.length <= size)
    .sort((a, b) => b.syllables.length - a.syllables.length);

  const placedWords: PlacedWord[] = [];

  // Weighted directions favoring natural RTL horizontal & vertical
  const preferredDirs: DirectionDelta[] = [
    DIRECTION_DELTAS[0], // RTL_HORIZONTAL
    DIRECTION_DELTAS[0], // extra weight for RTL_HORIZONTAL
    DIRECTION_DELTAS[1], // DOWN_VERTICAL
    DIRECTION_DELTAS[1], // extra weight for DOWN_VERTICAL
    DIRECTION_DELTAS[2], // DIAG_DOWN_LEFT
    DIRECTION_DELTAS[3], // UP_VERTICAL
  ];

  for (let wIdx = 0; wIdx < sortedWords.length; wIdx++) {
    const wordObj = sortedWords[wIdx];
    const syls = wordObj.syllables;
    const len = syls.length;
    let placed = false;

    // Build all candidate placements and shuffle deterministically
    const candidates: { row: number; col: number; dir: DirectionDelta; overlapScore: number }[] = [];

    for (const dir of preferredDirs) {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const endR = r + dir.dRow * (len - 1);
          const endC = c + dir.dCol * (len - 1);
          if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

          let fits = true;
          let overlaps = 0;
          for (let i = 0; i < len; i++) {
            const nr = r + dir.dRow * i;
            const nc = c + dir.dCol * i;
            const existing = matrix[nr][nc];
            if (existing !== null && existing !== syls[i]) {
              fits = false;
              break;
            }
            if (existing === syls[i]) {
              overlaps++;
            }
          }

          if (fits) {
            candidates.push({ row: r, col: c, dir, overlapScore: overlaps });
          }
        }
      }
    }

    // Shuffle candidates using seeded RNG
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = candidates[i];
      candidates[i] = candidates[j];
      candidates[j] = temp;
    }

    // Prefer slight overlaps occasionally so grid feels cohesive, but avoid full overlaps
    candidates.sort((a, b) => {
      if (a.overlapScore !== b.overlapScore && rng() > 0.45) {
        return b.overlapScore - a.overlapScore;
      }
      return 0;
    });

    if (candidates.length > 0) {
      const chosen = candidates[0];
      const cells: CellCoord[] = [];
      for (let i = 0; i < len; i++) {
        const nr = chosen.row + chosen.dir.dRow * i;
        const nc = chosen.col + chosen.dir.dCol * i;
        matrix[nr][nc] = syls[i];
        cells.push({ row: nr, col: nc });
      }
      placedWords.push({
        id: `${config.id}-w-${wIdx}`,
        word: wordObj.word,
        syllables: syls,
        meaningEn: wordObj.meaningEn,
        transliteration: wordObj.transliteration,
        cells,
        direction: chosen.dir.direction,
        found: false,
        colorIndex: placedWords.length % 6,
        hintTierRevealed: 0,
      });
      placed = true;
    }

    if (!placed) {
      // Fallback: try any empty row RTL
      for (let r = 0; r < size; r++) {
        const canForce = matrix[r].every((cell) => cell === null);
        if (canForce && len <= size) {
          const startCol = size - 1;
          const cells: CellCoord[] = [];
          for (let i = 0; i < len; i++) {
            const nc = startCol - i;
            matrix[r][nc] = syls[i];
            cells.push({ row: r, col: nc });
          }
          placedWords.push({
            id: `${config.id}-w-${wIdx}`,
            word: wordObj.word,
            syllables: syls,
            meaningEn: wordObj.meaningEn,
            transliteration: wordObj.transliteration,
            cells,
            direction: 'RTL_HORIZONTAL',
            found: false,
            colorIndex: placedWords.length % 6,
            hintTierRevealed: 0,
          });
          break;
        }
      }
    }
  }

  // Fill remaining null cells with natural Thaana syllables
  const grid: GridCell[][] = matrix.map((rowArr, r) =>
    rowArr.map((cell, c) => {
      const syllable =
        cell !== null
          ? cell
          : COMMON_THAANA_SYLLABLES[
              Math.floor(rng() * COMMON_THAANA_SYLLABLES.length)
            ];
      return {
        row: r,
        col: c,
        syllable,
      };
    })
  );

  return { grid, placedWords };
}

function findSyllablePathInGrid(
  grid: GridCell[][],
  syllables: string[]
): { cells: CellCoord[]; direction: WordDirection } | null {
  const size = grid.length;
  const len = syllables.length;

  for (const dir of DIRECTION_DELTAS) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const endR = r + dir.dRow * (len - 1);
        const endC = c + dir.dCol * (len - 1);
        if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

        const cells: CellCoord[] = [];
        let match = true;
        for (let i = 0; i < len; i++) {
          const nr = r + dir.dRow * i;
          const nc = c + dir.dCol * i;
          if (grid[nr][nc].syllable !== syllables[i]) {
            match = false;
            break;
          }
          cells.push({ row: nr, col: nc });
        }
        if (match) {
          return { cells, direction: dir.direction };
        }
      }
    }
  }
  return null;
}

/**
 * Given a start cell and current pointer cell, snaps to the closest valid 8-way straight line
 * (horizontal, vertical, or 45-degree diagonal) and returns the ordered CellCoord path.
 */
export function computeSnappedLineCells(
  start: CellCoord,
  end: CellCoord,
  gridSize: number
): CellCoord[] {
  const dRow = end.row - start.row;
  const dCol = end.col - start.col;

  if (dRow === 0 && dCol === 0) {
    return [start];
  }

  const angle = Math.atan2(dRow, dCol); // radians in [-PI, PI]
  // Snap to nearest multiple of PI / 4 (45 degrees)
  const octant = Math.round(angle / (Math.PI / 4));
  const stepRow = Math.round(Math.sin((octant * Math.PI) / 4));
  const stepCol = Math.round(Math.cos((octant * Math.PI) / 4));

  const distance = Math.max(Math.abs(dRow), Math.abs(dCol));
  const cells: CellCoord[] = [];

  for (let step = 0; step <= distance; step++) {
    const r = start.row + stepRow * step;
    const c = start.col + stepCol * step;
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) break;
    cells.push({ row: r, col: c });
  }

  return cells;
}
