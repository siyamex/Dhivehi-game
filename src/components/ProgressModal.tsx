import React from 'react';
import { PlayerProgress } from '../types/game';
import { GameKitOrbButton, GameKitPillButton } from './GameKitUI';

interface ProgressModalProps {
  progress: PlayerProgress;
  onClose: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  progress,
  onClose,
}) => {
  const discoveredWordsEntries = Object.keys(progress.discoveredWords);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
      <div
        dir="rtl"
        className="gamekit-green-panel rounded-[42px] max-w-md w-full max-h-[82vh] flex flex-col p-5 overflow-hidden text-slate-900"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="gamekit-teal-banner flex-1 rounded-full px-5 py-2 text-center text-white">
            <h2 className="font-thaana text-2xl">ކުރިއެރުން</h2>
          </div>

          <GameKitOrbButton
            variant="orange"
            icon="close"
            size="md"
            onClick={onClose}
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5 font-mono-num mb-4" dir="ltr">
          <div className="p-3 rounded-2xl bg-white/95 text-center">
            <div className="text-2xl font-extrabold text-[#FF5400]">
              {progress.currentStreak}d
            </div>
            <div className="font-thaana text-xs text-slate-600">ސްޓްރީކް</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/95 text-center">
            <div className="text-2xl font-extrabold text-[#0096C7]">
              {progress.totalGamesWon}
            </div>
            <div className="font-thaana text-xs text-slate-600">މޮޅުވި</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/95 text-center">
            <div className="text-2xl font-extrabold text-[#2B9348]">
              {progress.totalWordsFound}
            </div>
            <div className="font-thaana text-xs text-slate-600">ބަސް</div>
          </div>
        </div>

        {discoveredWordsEntries.length > 0 && (
          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pr-1">
            {discoveredWordsEntries.map((wordStr) => (
              <div
                key={wordStr}
                className="py-2 px-3 rounded-xl bg-white/95 text-center font-thaana text-lg text-slate-900"
              >
                {wordStr}
              </div>
            ))}
          </div>
        )}

        <div dir="ltr" className="mt-4 flex justify-center">
          <GameKitPillButton variant="ok" size="md" onClick={onClose}>
            <span>OK</span>
          </GameKitPillButton>
        </div>
      </div>
    </div>
  );
};
