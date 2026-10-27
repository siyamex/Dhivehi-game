import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BoardTheme,
  CellCoord,
  GridCell,
  LevelConfig,
  PlacedWord,
} from '../types/game';
import { soundEngine } from '../utils/sound';
import {
  computeSnappedLineCells,
  generateWordSearchBoard,
} from '../utils/thaana';
import { GameKitOrbButton, GameKitStars } from './GameKitUI';

interface WordSearchBoardProps {
  level: LevelConfig;
  theme: BoardTheme;
  showTransliteration: boolean;
  soundMuted: boolean;
  onChangeTheme: (theme: BoardTheme) => void;
  onToggleTransliteration: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onBackToMenu: () => void;
  onOpenLeaderboard: () => void;
  onOpenStats: () => void;
  onLevelComplete: (stats: {
    score: number;
    timeSeconds: number;
    wordsFound: number;
    hintsUsed: number;
    discoveredWordsList: string[];
  }) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  isStar?: boolean;
}

const WORD_PALETTE_GAMEKIT = [
  {
    fill: 'linear-gradient(180deg, #FF4800 0%, #D91B1B 100%)',
    solid: '#D91B1B',
    border: '#7F1D1D',
    text: '#FFFFFF',
  },
  {
    fill: 'linear-gradient(180deg, #AACC00 0%, #55D600 55%, #1B8A00 100%)',
    solid: '#55D600',
    border: '#14532D',
    text: '#FFFFFF',
  },
  {
    fill: 'linear-gradient(180deg, #FFEE32 0%, #FF9E00 55%, #FF5400 100%)',
    solid: '#FF9E00',
    border: '#B43E00',
    text: '#FFFFFF',
  },
  {
    fill: 'linear-gradient(180deg, #48CAE4 0%, #0096C7 55%, #023E8A 100%)',
    solid: '#0096C7',
    border: '#03045E',
    text: '#FFFFFF',
  },
  {
    fill: 'linear-gradient(180deg, #C77DFF 0%, #9D4EDD 55%, #5A189A 100%)',
    solid: '#9D4EDD',
    border: '#3C096C',
    text: '#FFFFFF',
  },
  {
    fill: 'linear-gradient(180deg, #FF70A6 0%, #FF0A54 55%, #A4133C 100%)',
    solid: '#FF0A54',
    border: '#800F2F',
    text: '#FFFFFF',
  },
];

export const WordSearchBoard: React.FC<WordSearchBoardProps> = ({
  level,
  soundMuted,
  onToggleMute,
  onPause,
  onBackToMenu,
  onLevelComplete,
}) => {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [dragStart, setDragStart] = useState<CellCoord | null>(null);
  const [dragCurrent, setDragCurrent] = useState<CellCoord | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tapAnchor, setTapAnchor] = useState<CellCoord | null>(null);
  const [cursorCell, setCursorCell] = useState<CellCoord>({
    row: 0,
    col: level.gridSize - 1,
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [boardShake, setBoardShake] = useState(false);

  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef(false);

  const initBoard = useCallback(() => {
    const generated = generateWordSearchBoard(level);
    setGrid(generated.grid);
    setPlacedWords(generated.placedWords);
    setDragStart(null);
    setDragCurrent(null);
    setIsDragging(false);
    setTapAnchor(null);
    setElapsedSeconds(0);
    setScore(0);
    setCombo(1);
    setHintsUsed(0);
    completedRef.current = false;
  }, [level]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!completedRef.current) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleBlur = () => {
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();

    const drawMiniStar = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        if (i === 0) {
          ctx.moveTo(
            cx + Math.cos(outerAngle) * r,
            cy + Math.sin(outerAngle) * r
          );
        } else {
          ctx.lineTo(
            cx + Math.cos(outerAngle) * r,
            cy + Math.sin(outerAngle) * r
          );
        }
        ctx.lineTo(
          cx + Math.cos(innerAngle) * (r * 0.45),
          cy + Math.sin(innerAngle) * (r * 0.45)
        );
      }
      ctx.closePath();
      ctx.fill();
    };

    const updateParticles = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (particlesRef.current.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const alive: Particle[] = [];
        for (const p of particlesRef.current) {
          p.life += dt;
          if (p.life < p.maxLife) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 240 * dt;
            const alpha = 1 - p.life / p.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            if (p.isStar) {
              drawMiniStar(p.x, p.y, p.size);
            } else {
              ctx.beginPath();
              ctx.roundRect(
                p.x - p.size / 2,
                p.y - p.size / 2,
                p.size,
                p.size,
                3
              );
              ctx.fill();
            }
            ctx.restore();
            alive.push(p);
          }
        }
        particlesRef.current = alive;
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(updateParticles);
    };

    animId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animId);
  }, []);

  const spawnParticleBurst = useCallback(
    (cells: CellCoord[], colorHex: string) => {
      const canvas = particleCanvasRef.current;
      const container = boardContainerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const size = level.gridSize;
      const cellW = rect.width / size;
      const cellH = rect.height / size;

      for (const c of cells) {
        const cx = (c.col + 0.5) * cellW;
        const cy = (c.row + 0.5) * cellH;
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
          const speed = 70 + Math.random() * 150;
          particlesRef.current.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 60,
            color: i % 2 === 0 ? '#FFEE32' : colorHex,
            size: 9 + Math.random() * 6,
            life: 0,
            maxLife: 0.65 + Math.random() * 0.3,
            isStar: i % 2 === 0,
          });
        }
      }
    },
    [level.gridSize]
  );

  const activeSelectionCells: CellCoord[] =
    dragStart && dragCurrent
      ? computeSnappedLineCells(dragStart, dragCurrent, level.gridSize)
      : tapAnchor
      ? [tapAnchor]
      : [];

  const activePreviewSyllables = activeSelectionCells
    .map((c) => grid[c.row]?.[c.col]?.syllable || '')
    .join('');

  const evaluateSelection = useCallback(
    (selectedCells: CellCoord[]) => {
      if (selectedCells.length < 2) return false;

      const matchIndex = placedWords.findIndex((pw) => {
        if (pw.found) return false;
        if (pw.cells.length !== selectedCells.length) return false;

        const exactForward = pw.cells.every(
          (c, idx) =>
            c.row === selectedCells[idx].row && c.col === selectedCells[idx].col
        );
        const exactBackward = pw.cells.every(
          (c, idx) =>
            c.row === selectedCells[selectedCells.length - 1 - idx].row &&
            c.col === selectedCells[selectedCells.length - 1 - idx].col
        );

        if (exactForward || exactBackward) return true;

        const forwardSyls = selectedCells.map(
          (c) => grid[c.row][c.col].syllable
        );
        const reverseSyls = [...forwardSyls].reverse();
        const targetSyls = pw.syllables;

        const sylForwardMatch =
          forwardSyls.length === targetSyls.length &&
          forwardSyls.every((s, idx) => s === targetSyls[idx]);
        const sylReverseMatch =
          reverseSyls.length === targetSyls.length &&
          reverseSyls.every((s, idx) => s === targetSyls[idx]);

        return sylForwardMatch || sylReverseMatch;
      });

      if (matchIndex !== -1) {
        const matchedWord = placedWords[matchIndex];
        const wordGain = matchedWord.syllables.length * 60 * combo;
        const nextScore = score + wordGain;

        const updatedWords = placedWords.map((pw, idx) =>
          idx === matchIndex
            ? { ...pw, found: true, cells: selectedCells }
            : pw
        );

        setPlacedWords(updatedWords);
        setScore(nextScore);
        setCombo((prev) => Math.min(prev + 1, 5));

        const colorObj =
          WORD_PALETTE_GAMEKIT[
            matchedWord.colorIndex % WORD_PALETTE_GAMEKIT.length
          ];
        spawnParticleBurst(selectedCells, colorObj.solid);

        const allDone = updatedWords.every((w) => w.found);
        if (allDone && !completedRef.current) {
          completedRef.current = true;
          soundEngine.playVictoryFanfare();
          const timeBonus = Math.max(0, 600 - elapsedSeconds * 4);
          const hintPenalty = hintsUsed * 45;
          const finalScore = Math.max(100, nextScore + timeBonus - hintPenalty);

          window.setTimeout(() => {
            onLevelComplete({
              score: finalScore,
              timeSeconds: Math.max(1, elapsedSeconds),
              wordsFound: updatedWords.length,
              hintsUsed,
              discoveredWordsList: updatedWords.map((w) => w.word),
            });
          }, 500);
        } else {
          soundEngine.playWordFound();
        }
        return true;
      } else {
        soundEngine.playInvalidRelease();
        setCombo(1);
        setBoardShake(true);
        window.setTimeout(() => setBoardShake(false), 180);
        return false;
      }
    },
    [
      placedWords,
      grid,
      combo,
      score,
      spawnParticleBurst,
      elapsedSeconds,
      hintsUsed,
      onLevelComplete,
    ]
  );

  const triggerProgressiveHint = useCallback(() => {
    const targetIdx = placedWords.findIndex((w) => !w.found);
    if (targetIdx === -1) return;

    const target = placedWords[targetIdx];
    const nextTier = Math.min(4, target.hintTierRevealed + 1);
    soundEngine.playHintUsed();
    setHintsUsed((prev) => prev + 1);

    setPlacedWords((prev) =>
      prev.map((w, i) =>
        i === targetIdx ? { ...w, hintTierRevealed: nextTier } : w
      )
    );
  }, [placedWords]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onPause();
        return;
      }
      if (e.code === 'KeyH') {
        e.preventDefault();
        triggerProgressiveHint();
        return;
      }
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        setCursorCell((p) => ({ ...p, row: Math.max(0, p.row - 1) }));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setCursorCell((p) => ({
          ...p,
          row: Math.min(level.gridSize - 1, p.row + 1),
        }));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCursorCell((p) => ({ ...p, col: Math.max(0, p.col - 1) }));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCursorCell((p) => ({
          ...p,
          col: Math.min(level.gridSize - 1, p.col + 1),
        }));
      } else if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!tapAnchor) {
          setTapAnchor(cursorCell);
          soundEngine.playTileStep(0);
        } else {
          const line = computeSnappedLineCells(
            tapAnchor,
            cursorCell,
            level.gridSize
          );
          evaluateSelection(line);
          setTapAnchor(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    cursorCell,
    evaluateSelection,
    level.gridSize,
    onPause,
    tapAnchor,
    triggerProgressiveHint,
  ]);

  const handleCellPointerDown = (row: number, col: number) => {
    setCursorCell({ row, col });
    setIsDragging(true);
    setDragStart({ row, col });
    setDragCurrent({ row, col });
    soundEngine.playTileStep(0);
  };

  const handleCellPointerEnter = (row: number, col: number) => {
    if (!isDragging || !dragStart) return;
    if (dragCurrent && dragCurrent.row === row && dragCurrent.col === col) return;
    setDragCurrent({ row, col });
    const line = computeSnappedLineCells(
      dragStart,
      { row, col },
      level.gridSize
    );
    soundEngine.playTileStep(Math.max(0, line.length - 1));
  };

  const handleBoardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !boardContainerRef.current) return;
    const rect = boardContainerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) return;

    const col = Math.min(
      level.gridSize - 1,
      Math.max(0, Math.floor((relX / rect.width) * level.gridSize))
    );
    const row = Math.min(
      level.gridSize - 1,
      Math.max(0, Math.floor((relY / rect.height) * level.gridSize))
    );

    if (!dragCurrent || dragCurrent.row !== row || dragCurrent.col !== col) {
      setDragCurrent({ row, col });
      const line = computeSnappedLineCells(
        dragStart,
        { row, col },
        level.gridSize
      );
      soundEngine.playTileStep(Math.max(0, line.length - 1));
    }
  };

  const handlePointerUp = () => {
    if (!isDragging || !dragStart || !dragCurrent) {
      setIsDragging(false);
      return;
    }

    const line = computeSnappedLineCells(
      dragStart,
      dragCurrent,
      level.gridSize
    );

    if (line.length === 1) {
      const clicked = line[0];
      if (!tapAnchor) {
        setTapAnchor(clicked);
      } else if (
        tapAnchor.row === clicked.row &&
        tapAnchor.col === clicked.col
      ) {
        setTapAnchor(null);
      } else {
        const tapLine = computeSnappedLineCells(
          tapAnchor,
          clicked,
          level.gridSize
        );
        evaluateSelection(tapLine);
        setTapAnchor(null);
      }
    } else {
      evaluateSelection(line);
      setTapAnchor(null);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const formatClock = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const foundCount = placedWords.filter((w) => w.found).length;
  const totalWords = placedWords.length;
  const earnedStars =
    foundCount === 0
      ? 0
      : foundCount < Math.ceil(totalWords / 2)
      ? 1
      : foundCount < totalWords
      ? 2
      : 3;

  return (
    <div
      className="gamekit-backdrop min-h-screen w-full text-white flex flex-col justify-between select-none"
      onPointerUp={handlePointerUp}
    >
      {/* Clean Icon-Only Game Kit HUD */}
      <header className="w-full max-w-[960px] mx-auto px-4 pt-3 pb-2 flex items-center justify-between gap-3">
        <GameKitOrbButton
          variant="green"
          icon="home"
          size="md"
          onClick={onBackToMenu}
        />

        <div
          dir="ltr"
          className="gamekit-teal-banner rounded-full px-5 py-1.5 flex items-center gap-3 font-mono-num text-sm"
        >
          <GameKitStars earnedCount={earnedStars} size="sm" />
          <span className="font-extrabold text-base text-white">
            {formatClock(elapsedSeconds)}
          </span>
        </div>

        <div dir="ltr" className="flex items-center gap-2">
          <GameKitOrbButton
            variant="green"
            icon="plus"
            size="md"
            disabled={foundCount === totalWords}
            onClick={triggerProgressiveHint}
          />
          <GameKitOrbButton
            variant="orange"
            icon={soundMuted ? 'sound-off' : 'sound-on'}
            size="md"
            onClick={onToggleMute}
          />
          <GameKitOrbButton
            variant="orange"
            icon="undo"
            size="md"
            onClick={initBoard}
          />
          <GameKitOrbButton
            variant="green"
            icon="pause"
            size="md"
            onClick={onPause}
          />
        </div>
      </header>

      {/* Main Playfield: Grid + Clean "ހޯދަންވީ ބަސްތައް" Card */}
      <main className="flex-1 w-full max-w-[960px] mx-auto px-4 py-2 flex flex-col lg:flex-row items-center justify-center gap-6">
        {/* Centerpiece: 8x8 Thaana Syllable Grid */}
        <div className="w-full max-w-[490px] flex flex-col items-center">
          {/* Live Drag Preview Pill (only visible while dragging) */}
          <div className="h-10 mb-2 flex items-center justify-center">
            {activePreviewSyllables && (
              <div
                dir="rtl"
                style={{
                  background:
                    'linear-gradient(180deg, #FFEE32 0%, #FF9E00 55%, #FF5400 100%)',
                }}
                className="px-6 py-1 rounded-full border-2 border-white text-white font-thaana text-xl shadow-md"
              >
                {activePreviewSyllables}
              </div>
            )}
          </div>

          <div
            ref={boardContainerRef}
            dir="ltr"
            onPointerMove={handleBoardPointerMove}
            className={`gamekit-green-panel relative w-full aspect-square p-3 sm:p-4 rounded-[36px] transition-transform duration-150 touch-none ${
              boardShake ? 'translate-x-1.5' : ''
            }`}
          >
            <canvas
              ref={particleCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              aria-hidden="true"
            />

            <div
              className="w-full h-full grid gap-1.5 sm:gap-2"
              style={{
                gridTemplateColumns: `repeat(${level.gridSize}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${level.gridSize}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((rowArr, rIdx) =>
                rowArr.map((cell, cIdx) => {
                  const isSelected = activeSelectionCells.some(
                    (c) => c.row === rIdx && c.col === cIdx
                  );

                  const foundWordMatch = placedWords.find(
                    (pw) =>
                      pw.found &&
                      pw.cells.some((c) => c.row === rIdx && c.col === cIdx)
                  );

                  const hintedWordMatch = placedWords.find((pw) => {
                    if (pw.found || pw.hintTierRevealed === 0) return false;
                    if (pw.hintTierRevealed >= 4) {
                      return pw.cells.some(
                        (c) => c.row === rIdx && c.col === cIdx
                      );
                    }
                    if (pw.hintTierRevealed >= 3) {
                      return pw.cells[0].row === rIdx;
                    }
                    if (pw.hintTierRevealed >= 1) {
                      return (
                        pw.cells[0].row === rIdx && pw.cells[0].col === cIdx
                      );
                    }
                    return false;
                  });

                  const isHintStartTile = placedWords.some(
                    (pw) =>
                      !pw.found &&
                      pw.hintTierRevealed >= 1 &&
                      pw.cells[0].row === rIdx &&
                      pw.cells[0].col === cIdx
                  );

                  const colorScheme = foundWordMatch
                    ? WORD_PALETTE_GAMEKIT[
                        foundWordMatch.colorIndex % WORD_PALETTE_GAMEKIT.length
                      ]
                    : null;

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      type="button"
                      dir="rtl"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        handleCellPointerDown(rIdx, cIdx);
                      }}
                      onPointerEnter={() => handleCellPointerEnter(rIdx, cIdx)}
                      style={
                        isSelected
                          ? {
                              background:
                                'linear-gradient(180deg, #48CAE4 0%, #0096C7 55%, #023E8A 100%)',
                              borderColor: '#FFFFFF',
                              color: '#FFFFFF',
                            }
                          : colorScheme
                          ? {
                              background: colorScheme.fill,
                              borderColor: colorScheme.border,
                              color: colorScheme.text,
                            }
                          : undefined
                      }
                      className={`thaana-tile relative w-full h-full min-h-[38px] rounded-xl font-thaana text-xl sm:text-2xl flex items-center justify-center select-none cursor-pointer border-b-[4px] focus:outline-none ${
                        isSelected
                          ? 'scale-[1.06] z-10 shadow-md border-2'
                          : colorScheme
                          ? 'shadow-xs'
                          : isHintStartTile
                          ? 'bg-[#FFEE32] text-slate-950 border-[#D97706] animate-hint-pulse'
                          : hintedWordMatch
                          ? 'bg-amber-100 text-slate-950 border-amber-400'
                          : 'bg-white text-slate-950 border-slate-300 hover:bg-sky-50'
                      }`}
                    >
                      <span
                        className="absolute inset-0 rounded-xl tile-gloss pointer-events-none"
                        aria-hidden="true"
                      />
                      <span className="relative z-10 leading-none pt-0.5">
                        {cell.syllable}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Minimal "ހޯދަންވީ ބަސްތައް" Card matching the clean reference image */}
        <aside className="w-full max-w-[320px] lg:w-[270px]">
          <div
            dir="rtl"
            className="rounded-[32px] bg-[#D6F0F8] border-4 border-[#A5F3FC] shadow-xl px-6 py-5 text-slate-900"
          >
            <h2 className="font-thaana text-2xl sm:text-3xl text-center text-slate-950 mb-4">
              ހޯދަންވީ ބަސްތައް
            </h2>

            <div className="space-y-2 text-right">
              {placedWords.map((pw) => {
                const cScheme =
                  WORD_PALETTE_GAMEKIT[
                    pw.colorIndex % WORD_PALETTE_GAMEKIT.length
                  ];

                return (
                  <div
                    key={pw.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl"
                    style={
                      pw.found
                        ? {
                            background: cScheme.fill,
                            color: '#FFFFFF',
                          }
                        : undefined
                    }
                  >
                    <span
                      className={`font-thaana text-2xl leading-relaxed ${
                        pw.found ? 'line-through decoration-2 text-white' : 'text-slate-950'
                      }`}
                    >
                      {pw.word}
                    </span>

                    {pw.found && (
                      <span className="text-sm font-bold text-white" dir="ltr">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </main>

      <div className="h-3" aria-hidden="true" />
    </div>
  );
};
