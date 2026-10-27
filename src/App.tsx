/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  GameKitOrbButton,
  GameKitPillButton,
  GameKitStars,
} from './components/GameKitUI';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ProgressModal } from './components/ProgressModal';
import { TitleScreen } from './components/TitleScreen';
import { WordSearchBoard } from './components/WordSearchBoard';
import {
  getDailyLevelConfig,
  OFFLINE_CAMPAIGN_PACKS,
} from './data/lexicon';
import { useOnlineStatus } from './hooks/usePWAInstall';
import {
  ActiveModal,
  BoardTheme,
  GameScreen,
  LevelConfig,
  PlayerProgress,
} from './types/game';
import { soundEngine } from './utils/sound';
import { shareGame, shareScore } from './utils/instantGames';
import {
  createScoreSubmission,
  flushOfflineScoreQueue,
  getTodayDateKey,
  getYesterdayDateKey,
  loadPlayerProgress,
  savePlayerProgress,
} from './utils/storage';

interface RoundSummaryData {
  level: LevelConfig;
  score: number;
  timeSeconds: number;
  wordsFound: number;
  hintsUsed: number;
  isNewBest: boolean;
  syncedLive: boolean;
}

export default function App() {
  const isOnline = useOnlineStatus();
  const [todayDateKey] = useState<string>(() => getTodayDateKey());
  const [progress, setProgress] = useState<PlayerProgress>(() =>
    loadPlayerProgress()
  );
  const [screen, setScreen] = useState<GameScreen>('TITLE_MENU');
  const [activeLevel, setActiveLevel] = useState<LevelConfig>(() =>
    getDailyLevelConfig(getTodayDateKey())
  );
  const [activeModal, setActiveModal] = useState<ActiveModal>('NONE');
  const [roundSummary, setRoundSummary] = useState<RoundSummaryData | null>(
    null
  );
  const [boardInstanceKey, setBoardInstanceKey] = useState<number>(1);

  useEffect(() => {
    soundEngine.setMuted(progress.soundMuted);
  }, [progress.soundMuted]);

  useEffect(() => {
    if (isOnline && progress.pendingSyncQueue.length > 0) {
      flushOfflineScoreQueue(progress).then(({ updatedProgress, syncedCount }) => {
        if (syncedCount > 0) {
          setProgress(updatedProgress);
        }
      });
    }
  }, [isOnline, progress]);

  const updateAndPersistProgress = useCallback((next: PlayerProgress) => {
    setProgress(next);
    savePlayerProgress(next);
  }, []);

  const handleStartDaily = useCallback(() => {
    const dailyCfg = getDailyLevelConfig(todayDateKey);
    setActiveLevel(dailyCfg);
    setBoardInstanceKey((k) => k + 1);
    setScreen('PLAYING');
    setActiveModal('NONE');
  }, [todayDateKey]);

  const handleSelectCampaignLevel = useCallback((level: LevelConfig) => {
    setActiveLevel(level);
    setBoardInstanceKey((k) => k + 1);
    setScreen('PLAYING');
    setActiveModal('NONE');
  }, []);

  const handleUpdateProfile = useCallback(
    (nameEn: string, nameDv: string, atollTag: string) => {
      const next: PlayerProgress = {
        ...progress,
        profile: { nameEn, nameDv, atollTag },
      };
      updateAndPersistProgress(next);
    },
    [progress, updateAndPersistProgress]
  );

  const handleChangeTheme = useCallback(
    (theme: BoardTheme) => {
      const next: PlayerProgress = {
        ...progress,
        preferredTheme: theme,
      };
      updateAndPersistProgress(next);
    },
    [progress, updateAndPersistProgress]
  );

  const handleToggleTransliteration = useCallback(() => {
    const next: PlayerProgress = {
      ...progress,
      showTransliteration: !progress.showTransliteration,
    };
    updateAndPersistProgress(next);
  }, [progress, updateAndPersistProgress]);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !progress.soundMuted;
    soundEngine.setMuted(nextMuted);
    const next: PlayerProgress = {
      ...progress,
      soundMuted: nextMuted,
    };
    updateAndPersistProgress(next);
  }, [progress, updateAndPersistProgress]);

  const handleLevelComplete = useCallback(
    async (stats: {
      score: number;
      timeSeconds: number;
      wordsFound: number;
      hintsUsed: number;
      discoveredWordsList: string[];
    }) => {
      const prevLevelRec = progress.completedLevels[activeLevel.id];
      const isNewBest = !prevLevelRec || stats.score > prevLevelRec.bestScore;

      const yesterdayKey = getYesterdayDateKey();
      let nextStreak = progress.currentStreak;
      if (progress.lastDailyDateKey !== todayDateKey) {
        if (progress.lastDailyDateKey === yesterdayKey) {
          nextStreak = progress.currentStreak + 1;
        } else if (!progress.lastDailyDateKey) {
          nextStreak = Math.max(1, progress.currentStreak);
        } else {
          nextStreak = 1;
        }
      }
      const nextBestStreak = Math.max(progress.bestStreak, nextStreak);

      const nextDiscovered = { ...progress.discoveredWords };
      for (const w of stats.discoveredWordsList) {
        nextDiscovered[w] = (nextDiscovered[w] || 0) + 1;
      }

      const nextCompletedLevels = {
        ...progress.completedLevels,
        [activeLevel.id]: {
          levelId: activeLevel.id,
          bestScore: prevLevelRec
            ? Math.max(prevLevelRec.bestScore, stats.score)
            : stats.score,
          fastestTimeSeconds: prevLevelRec
            ? Math.min(prevLevelRec.fastestTimeSeconds, stats.timeSeconds)
            : stats.timeSeconds,
          completedAt: Date.now(),
          hintsUsed: stats.hintsUsed,
        },
      };

      const nextDailyHistory = { ...progress.dailyHistory };
      if (activeLevel.mode === 'daily') {
        const prevDaily = nextDailyHistory[todayDateKey];
        if (!prevDaily || stats.score > prevDaily.score) {
          nextDailyHistory[todayDateKey] = {
            dateKey: todayDateKey,
            score: stats.score,
            timeSeconds: stats.timeSeconds,
            hintsUsed: stats.hintsUsed,
            completedAt: Date.now(),
          };
        }
      }

      const submission = createScoreSubmission(progress, {
        mode: activeLevel.mode,
        levelId: activeLevel.id,
        dateKey: todayDateKey,
        score: stats.score,
        timeSeconds: stats.timeSeconds,
        wordsFound: stats.wordsFound,
        hintsUsed: stats.hintsUsed,
        streak: nextStreak,
      });

      const updatedProgress: PlayerProgress = {
        ...progress,
        currentStreak: nextStreak,
        bestStreak: nextBestStreak,
        lastDailyDateKey: todayDateKey,
        totalGamesWon: progress.totalGamesWon + 1,
        totalWordsFound: progress.totalWordsFound + stats.wordsFound,
        totalTimePlayedSeconds:
          progress.totalTimePlayedSeconds + stats.timeSeconds,
        completedLevels: nextCompletedLevels,
        dailyHistory: nextDailyHistory,
        discoveredWords: nextDiscovered,
        pendingSyncQueue: [...progress.pendingSyncQueue, submission],
      };

      updateAndPersistProgress(updatedProgress);

      const { updatedProgress: postSyncProgress, syncedCount } =
        await flushOfflineScoreQueue(updatedProgress);

      if (syncedCount > 0) {
        setProgress(postSyncProgress);
      }

      setRoundSummary({
        level: activeLevel,
        score: stats.score,
        timeSeconds: stats.timeSeconds,
        wordsFound: stats.wordsFound,
        hintsUsed: stats.hintsUsed,
        isNewBest,
        syncedLive: syncedCount > 0,
      });
      setActiveModal('ROUND_SUMMARY');
    },
    [activeLevel, progress, todayDateKey, updateAndPersistProgress]
  );

  const getNextCampaignLevel = (): LevelConfig | null => {
    const allLevels = OFFLINE_CAMPAIGN_PACKS.flatMap((p) => p.levels);
    const idx = allLevels.findIndex((l) => l.id === activeLevel.id);
    if (idx !== -1 && idx + 1 < allLevels.length) {
      return allLevels[idx + 1];
    }
    return allLevels[0] || null;
  };

  return (
    <div className="min-h-screen w-full relative">
      {screen === 'TITLE_MENU' ? (
        <TitleScreen
          progress={progress}
          todayDateKey={todayDateKey}
          onStartDaily={handleStartDaily}
          onSelectLevel={handleSelectCampaignLevel}
          onOpenLeaderboard={() => setActiveModal('LEADERBOARD')}
          onOpenStats={() => setActiveModal('STATS')}
          onShareGame={() => void shareGame()}
          onUpdateProfile={handleUpdateProfile}
          onChangeTheme={handleChangeTheme}
        />
      ) : (
        <WordSearchBoard
          key={`${activeLevel.id}-${boardInstanceKey}`}
          level={activeLevel}
          theme={progress.preferredTheme}
          showTransliteration={progress.showTransliteration}
          soundMuted={progress.soundMuted}
          onChangeTheme={handleChangeTheme}
          onToggleTransliteration={handleToggleTransliteration}
          onToggleMute={handleToggleMute}
          onPause={() => setActiveModal('PAUSED')}
          onBackToMenu={() => {
            setActiveModal('NONE');
            setScreen('TITLE_MENU');
          }}
          onOpenLeaderboard={() => setActiveModal('LEADERBOARD')}
          onOpenStats={() => setActiveModal('STATS')}
          onLevelComplete={handleLevelComplete}
        />
      )}

      {/* PAUSE MODAL — Clean Game Kit Panel */}
      {activeModal === 'PAUSED' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/75 p-4">
          <div className="gamekit-green-panel relative max-w-[380px] w-full rounded-[46px] px-6 pt-5 pb-12 text-center">
            <div className="mb-2">
              <GameKitStars earnedCount={2} size="lg" />
            </div>

            <div className="gamekit-teal-banner rounded-full py-3.5 px-6 mb-2">
              <h2 className="font-game-display font-extrabold text-3xl text-white tracking-wider">
                PAUSED
              </h2>
            </div>

            <div
              dir="ltr"
              className="absolute -bottom-7 left-0 right-0 flex items-center justify-around px-10"
            >
              <GameKitOrbButton
                variant="green"
                icon="home"
                size="lg"
                onClick={() => {
                  setActiveModal('NONE');
                  setScreen('TITLE_MENU');
                }}
              />
              <GameKitOrbButton
                variant="orange"
                icon="play"
                size="lg"
                onClick={() => setActiveModal('NONE')}
              />
            </div>
          </div>

          <div
            dir="ltr"
            className="mt-11 max-w-[380px] w-full grid grid-cols-2 gap-3.5"
          >
            <GameKitPillButton
              variant="start"
              onClick={() => setActiveModal('NONE')}
            >
              <span>START</span>
            </GameKitPillButton>

            <GameKitPillButton
              variant="exit"
              onClick={() => {
                setActiveModal('NONE');
                setScreen('TITLE_MENU');
              }}
            >
              <span>EXIT</span>
            </GameKitPillButton>
          </div>
        </div>
      )}

      {/* VICTORY / COMPLETE! MODAL — Exact Match to Reference Game Kit Image */}
      {activeModal === 'ROUND_SUMMARY' && roundSummary && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/75 p-4">
          <div className="gamekit-green-panel relative max-w-[400px] w-full rounded-[46px] px-6 pt-5 pb-12 text-center">
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

            <div className="gamekit-teal-banner rounded-full py-3.5 px-6 mb-2">
              <div className="font-game-display font-extrabold text-3xl sm:text-4xl text-white tracking-wider">
                COMPLETE!
              </div>
            </div>

            <div
              dir="ltr"
              className="font-mono-num text-sm font-extrabold text-emerald-950"
            >
              {roundSummary.score} PTS · {roundSummary.timeSeconds}s
            </div>

            {/* Docked Bottom Orbs: Green Home Orb + Orange Next Arrow Orb */}
            <div
              dir="ltr"
              className="absolute -bottom-7 left-0 right-0 flex items-center justify-around px-10"
            >
              <GameKitOrbButton
                variant="green"
                icon="home"
                size="lg"
                onClick={() => {
                  setActiveModal('NONE');
                  setScreen('TITLE_MENU');
                }}
              />
              <GameKitOrbButton
                variant="orange"
                icon="next"
                size="lg"
                onClick={() => {
                  const nextLvl = getNextCampaignLevel();
                  if (nextLvl) {
                    handleSelectCampaignLevel(nextLvl);
                  }
                }}
              />
            </div>
          </div>

          <div
            dir="ltr"
            className="mt-11 max-w-[400px] w-full grid grid-cols-2 gap-3.5"
          >
            <GameKitPillButton
              variant="start"
              onClick={() => {
                setBoardInstanceKey((k) => k + 1);
                setActiveModal('NONE');
              }}
            >
              <span>START</span>
            </GameKitPillButton>

            <GameKitPillButton
              variant="ok"
              onClick={() => setActiveModal('LEADERBOARD')}
            >
              <span>OK</span>
            </GameKitPillButton>

            <GameKitPillButton
              variant="next"
              onClick={() => {
                const nextLvl = getNextCampaignLevel();
                if (nextLvl) {
                  handleSelectCampaignLevel(nextLvl);
                }
              }}
            >
              <span>NEXT</span>
            </GameKitPillButton>

            <GameKitPillButton
              variant="next"
              className="col-span-2"
              onClick={() => void shareScore(roundSummary.score, roundSummary.level.id)}
            >
              <span>SHARE SCORE</span>
            </GameKitPillButton>

            <GameKitPillButton
              variant="exit"
              onClick={() => {
                setActiveModal('NONE');
                setScreen('TITLE_MENU');
              }}
            >
              <span>EXIT</span>
            </GameKitPillButton>
          </div>
        </div>
      )}

      {/* GLOBAL LEADERBOARD MODAL */}
      {activeModal === 'LEADERBOARD' && (
        <LeaderboardModal
          progress={progress}
          todayDateKey={todayDateKey}
          onClose={() => setActiveModal('NONE')}
          onProgressUpdated={setProgress}
        />
      )}

      {/* PLAYER PROGRESS MODAL */}
      {activeModal === 'STATS' && (
        <ProgressModal
          progress={progress}
          onClose={() => setActiveModal('NONE')}
        />
      )}
    </div>
  );
}
