import React, { useCallback, useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { PlayerProgress, ScoreSubmission } from '../types/game';
import { flushOfflineScoreQueue } from '../utils/storage';
import { GameKitOrbButton, GameKitPillButton } from './GameKitUI';

interface LeaderboardModalProps {
  progress: PlayerProgress;
  todayDateKey: string;
  onClose: () => void;
  onProgressUpdated: (updated: PlayerProgress) => void;
}

type LeaderboardTab = 'daily' | 'allTime';

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  progress,
  todayDateKey,
  onClose,
  onProgressUpdated,
}) => {
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('daily');
  const [dailyList, setDailyList] = useState<ScoreSubmission[]>([]);
  const [allTimeList, setAllTimeList] = useState<ScoreSubmission[]>([]);

  const fetchAndSyncLeaderboard = useCallback(async () => {
    let currentProgress = progress;
    if (isOnline && progress.pendingSyncQueue.length > 0) {
      const { updatedProgress } = await flushOfflineScoreQueue(progress);
      currentProgress = updatedProgress;
      onProgressUpdated(updatedProgress);
    }

    try {
      const res = await fetch(
        `/api/leaderboard?dateKey=${encodeURIComponent(todayDateKey)}`
      );
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      setDailyList(data.daily || []);
      setAllTimeList(data.allTime || []);
    } catch {
      setDailyList(currentProgress.pendingSyncQueue);
      setAllTimeList(currentProgress.pendingSyncQueue);
    }
  }, [isOnline, onProgressUpdated, progress, todayDateKey]);

  useEffect(() => {
    fetchAndSyncLeaderboard();
  }, [fetchAndSyncLeaderboard]);

  const activeEntries = activeTab === 'daily' ? dailyList : allTimeList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
      <div
        dir="rtl"
        className="gamekit-green-panel rounded-[42px] max-w-md w-full max-h-[82vh] flex flex-col p-5 overflow-hidden text-slate-900"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="gamekit-teal-banner flex-1 rounded-full px-5 py-2 text-center text-white">
            <h2 className="font-thaana text-2xl">ވަނަތައް</h2>
          </div>

          <GameKitOrbButton
            variant="orange"
            icon="close"
            size="md"
            onClick={onClose}
          />
        </div>

        <div dir="ltr" className="flex items-center justify-center gap-3 mb-3">
          <GameKitPillButton
            variant={activeTab === 'daily' ? 'start' : 'next'}
            size="sm"
            onClick={() => setActiveTab('daily')}
          >
            <span className="font-thaana">މިއަދު</span>
          </GameKitPillButton>
          <GameKitPillButton
            variant={activeTab === 'allTime' ? 'start' : 'next'}
            size="sm"
            onClick={() => setActiveTab('allTime')}
          >
            <span className="font-thaana">ހުރިހާ</span>
          </GameKitPillButton>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {activeEntries.map((entry, idx) => (
            <div
              key={entry.id}
              className="py-2.5 px-4 rounded-2xl bg-white/95 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-full bg-[#FF9E00] text-white font-game-display text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-thaana text-lg text-slate-900 truncate">
                  {entry.playerNameDv || entry.playerName}
                </span>
              </div>

              <span
                dir="ltr"
                className="font-mono-num text-sm font-extrabold text-[#0D7A7C] shrink-0"
              >
                {entry.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
