import React, { useEffect, useRef, useState } from 'react';
import { Share2 } from 'lucide-react';
import { MALDIVIAN_ATOLLS, OFFLINE_CAMPAIGN_PACKS } from '../data/lexicon';
import { BoardTheme, LevelConfig, PlayerProgress } from '../types/game';
import { COMMON_THAANA_SYLLABLES } from '../utils/thaana';
import {
  GameKitOrbButton,
  GameKitPillButton,
  GameKitStars,
} from './GameKitUI';

interface TitleScreenProps {
  progress: PlayerProgress;
  todayDateKey: string;
  onStartDaily: () => void;
  onSelectLevel: (level: LevelConfig) => void;
  onOpenLeaderboard: () => void;
  onOpenStats: () => void;
  onShareGame: () => void;
  onUpdateProfile: (nameEn: string, nameDv: string, atollTag: string) => void;
  onChangeTheme: (theme: BoardTheme) => void;
}

interface FloatingTile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  syllable: string;
  alpha: number;
  tint: string;
  isStar?: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  progress,
  onStartDaily,
  onSelectLevel,
  onOpenLeaderboard,
  onOpenStats,
  onShareGame,
  onUpdateProfile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showLevels, setShowLevels] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameDvInput, setNameDvInput] = useState(progress.profile.nameDv);
  const [atollInput, setAtollInput] = useState(progress.profile.atollTag);
  const [selectedPackId, setSelectedPackId] = useState<string>(
    OFFLINE_CAMPAIGN_PACKS[0].id
  );

  // Isolated 60fps Canvas background simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let lastTime = performance.now();

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const kitTints = ['#70E000', '#FF9E00', '#38BDF8', '#FFEE32', '#FF4800'];
    const tiles: FloatingTile[] = Array.from({ length: 18 }, (_, i) => ({
      x: (window.innerWidth / 18) * i + Math.random() * 40,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 14,
      vy: -10 - Math.random() * 16,
      size: 48 + (i % 3) * 12,
      syllable: COMMON_THAANA_SYLLABLES[i % COMMON_THAANA_SYLLABLES.length],
      alpha: 0.1 + (i % 4) * 0.025,
      tint: kitTints[i % kitTints.length],
      isStar: i % 4 === 0,
    }));

    const drawStar = (
      cx: number,
      cy: number,
      spikes: number,
      outerR: number,
      innerR: number
    ) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerR;
        y = cy + Math.sin(rot) * outerR;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerR;
        y = cy + Math.sin(rot) * innerR;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerR);
      ctx.closePath();
      ctx.fill();
    };

    const renderLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const tile of tiles) {
        tile.x += tile.vx * dt;
        tile.y += tile.vy * dt;

        if (tile.y + tile.size < -20) {
          tile.y = h + 20;
          tile.x = Math.random() * w;
        }
        if (tile.x < -60) tile.x = w + 20;
        if (tile.x > w + 60) tile.x = -20;

        ctx.save();
        ctx.globalAlpha = tile.alpha;
        ctx.fillStyle = tile.tint;

        if (tile.isStar) {
          drawStar(
            tile.x + tile.size / 2,
            tile.y + tile.size / 2,
            5,
            tile.size * 0.42,
            tile.size * 0.2
          );
        } else {
          ctx.beginPath();
          ctx.roundRect(tile.x, tile.y, tile.size, tile.size, 16);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `700 ${Math.round(tile.size * 0.44)}px "MV Faseyha", "Noto Sans Thaana", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            tile.syllable,
            tile.x + tile.size / 2,
            tile.y + tile.size / 2 + 2
          );
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingProfile || showLevels) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT') return;
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStartDaily();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingProfile, showLevels, onStartDaily]);

  const selectedPack =
    OFFLINE_CAMPAIGN_PACKS.find((p) => p.id === selectedPackId) ||
    OFFLINE_CAMPAIGN_PACKS[0];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(
      nameDvInput.trim() || 'Player',
      nameDvInput.trim() || 'ކުޅުންތެރިޔާ',
      atollInput
    );
    setEditingProfile(false);
  };

  return (
    <div className="gamekit-backdrop relative min-h-screen w-full text-white flex flex-col justify-between overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Minimal Top Bar */}
      <header className="relative z-10 w-full max-w-[1000px] mx-auto px-5 pt-4 flex items-center justify-between">
        <span className="font-thaana text-2xl font-bold text-white drop-shadow-xs">
          ބަސްހޯދާ
        </span>

        <div dir="ltr" className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Share game"
            title="Share game"
            onClick={onShareGame}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white cursor-pointer"
          >
            <Share2 size={20} aria-hidden="true" />
          </button>
          <GameKitOrbButton
            variant="orange"
            icon="trophy"
            size="md"
            onClick={onOpenLeaderboard}
          />
          <GameKitOrbButton
            variant="green"
            icon="stats"
            size="md"
            onClick={onOpenStats}
          />
          <button
            onClick={() => setEditingProfile((p) => !p)}
            className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 font-thaana text-sm text-white cursor-pointer"
          >
            {progress.profile.nameDv}
          </button>
        </div>
      </header>

      {/* Center Stage: Pure Game Kit UI */}
      <main className="relative z-10 flex-1 w-full max-w-[540px] mx-auto px-4 flex flex-col items-center justify-center">
        {editingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="mb-6 p-5 rounded-[32px] bg-[#2E3552]/95 border-4 border-[#7DD3FC] shadow-2xl w-full"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-thaana text-lg text-[#FFEE32]">ޕްރޮފައިލް</span>
              <GameKitOrbButton
                variant="orange"
                icon="close"
                size="sm"
                onClick={() => setEditingProfile(false)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                dir="rtl"
                value={nameDvInput}
                onChange={(e) => setNameDvInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border-2 border-sky-300/40 font-thaana text-base text-white focus:outline-none focus:border-[#FFEE32]"
                placeholder="ނަން"
              />
              <select
                value={atollInput}
                onChange={(e) => setAtollInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#2E3552] border-2 border-sky-300/40 font-thaana text-base text-white focus:outline-none focus:border-[#FFEE32]"
              >
                {MALDIVIAN_ATOLLS.map((atoll) => (
                  <option key={atoll} value={atoll}>
                    {atoll.split('(')[0].trim()}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-center">
              <GameKitPillButton
                variant="ok"
                size="sm"
                onClick={() =>
                  handleSaveProfile({
                    preventDefault: () => {},
                  } as React.FormEvent)
                }
              >
                <span>OK</span>
              </GameKitPillButton>
            </div>
          </form>
        )}

        {!showLevels ? (
          <>
            {/* Iconic Green Game Kit Panel with 3 Stars, Recessed Banner & 2 Docked Orbs */}
            <div className="gamekit-green-panel relative w-full max-w-[400px] rounded-[46px] px-6 pt-5 pb-12 text-center">
              <div
                className="absolute top-3 left-7 w-16 h-6 rounded-full bg-white/45 -rotate-12 pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute top-3 right-7 w-16 h-6 rounded-full bg-white/45 rotate-12 pointer-events-none"
                aria-hidden="true"
              />

              <div className="mb-2">
                <GameKitStars earnedCount={3} size="lg" />
              </div>

              <div className="gamekit-teal-banner rounded-full px-6 py-4 mb-2 mx-auto">
                <h1 className="font-thaana text-4xl sm:text-5xl text-white drop-shadow-sm">
                  ބަސްހޯދާ
                </h1>
              </div>

              {/* Docked Bottom Orb Buttons on the Rim */}
              <div
                dir="ltr"
                className="absolute -bottom-7 left-0 right-0 flex items-center justify-around px-10"
              >
                <GameKitOrbButton
                  variant="green"
                  icon="trophy"
                  size="lg"
                  onClick={onOpenLeaderboard}
                />
                <GameKitOrbButton
                  variant="orange"
                  icon="play"
                  size="lg"
                  onClick={onStartDaily}
                />
              </div>
            </div>

            {/* 2x2 Pill Buttons Below Green Panel (exact match to reference layout) */}
            <div
              dir="ltr"
              className="mt-12 w-full max-w-[400px] grid grid-cols-2 gap-4"
            >
              <GameKitPillButton
                variant="start"
                size="lg"
                onClick={onStartDaily}
              >
                <span>START</span>
              </GameKitPillButton>

              <GameKitPillButton
                variant="ok"
                size="lg"
                onClick={() => setShowLevels(true)}
              >
                <span className="font-thaana">ލެވެލްތައް</span>
              </GameKitPillButton>

              <GameKitPillButton
                variant="next"
                size="lg"
                onClick={() => {
                  const classicPack = OFFLINE_CAMPAIGN_PACKS.find(
                    (p) => p.id === 'pack-classic'
                  );
                  if (classicPack) onSelectLevel(classicPack.levels[0]);
                }}
              >
                <span className="font-thaana">ކްލެސިކް</span>
              </GameKitPillButton>

              <GameKitPillButton
                variant="exit"
                size="lg"
                onClick={onOpenStats}
              >
                <span className="font-thaana">ވަނަތައް</span>
              </GameKitPillButton>
            </div>
          </>
        ) : (
          /* Minimal Level Selector Panel */
          <div className="gamekit-green-panel relative w-full rounded-[42px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="gamekit-teal-banner flex-1 rounded-full px-5 py-2 text-center">
                <h2 className="font-thaana text-2xl text-white">ލެވެލްތައް</h2>
              </div>
              <GameKitOrbButton
                variant="orange"
                icon="close"
                size="md"
                onClick={() => setShowLevels(false)}
              />
            </div>

            {/* Pack Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
              {OFFLINE_CAMPAIGN_PACKS.map((pack) => {
                const isActive = pack.id === selectedPack.id;
                return (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPackId(pack.id)}
                    className={`px-4 py-1.5 rounded-full font-thaana text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#FFEE32] text-slate-950 font-bold shadow-xs'
                        : 'bg-emerald-900/25 text-white hover:bg-emerald-900/40'
                    }`}
                  >
                    {pack.titleDv.split('(')[0].trim()}
                  </button>
                );
              })}
            </div>

            {/* Clean Level Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedPack.levels.map((lvl) => {
                const record = progress.completedLevels[lvl.id];
                return (
                  <div
                    key={lvl.id}
                    onClick={() => onSelectLevel(lvl)}
                    className="p-3.5 rounded-3xl bg-white/95 hover:bg-white border-2 border-emerald-800/15 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-thaana text-lg text-slate-900 truncate">
                        {lvl.titleDv}
                      </div>
                      {record && <GameKitStars earnedCount={3} size="sm" />}
                    </div>

                    <GameKitOrbButton
                      variant={record ? 'green' : 'orange'}
                      icon={record ? 'check' : 'play'}
                      size="md"
                      onClick={() => onSelectLevel(lvl)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <div className="h-4" aria-hidden="true" />
    </div>
  );
};
