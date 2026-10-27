import React from 'react';

/**
 * 3 Plump Glossy 3D Golden Stars matching the top of the COMPLETE! panel in the reference Game Kit.
 */
export const GameKitStars: React.FC<{
  earnedCount?: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ earnedCount = 3, size = 'lg' }) => {
  const dims =
    size === 'lg'
      ? 'w-14 h-14 sm:w-16 sm:h-16'
      : size === 'md'
      ? 'w-10 h-10'
      : 'w-6 h-6';

  return (
    <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 select-none" dir="ltr">
      {[0, 1, 2].map((idx) => {
        const earned = idx < earnedCount;
        const isCenter = idx === 1;
        return (
          <svg
            key={idx}
            viewBox="0 0 100 100"
            className={`${dims} ${isCenter ? '-translate-y-1.5 scale-110' : ''} drop-shadow-md transition-transform`}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`starGrad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={earned ? '#FFF75E' : '#CBD5E1'} />
                <stop offset="55%" stopColor={earned ? '#FFAA00' : '#94A3B8'} />
                <stop offset="100%" stopColor={earned ? '#FF6B00' : '#64748B'} />
              </linearGradient>
            </defs>
            {/* Outer 3D Dark Orange/Brown Bevel Rim */}
            <path
              d="M50 6 L63 32 L92 36 L71 56 L76 85 L50 71 L24 85 L29 56 L8 36 L37 32 Z"
              fill={earned ? '#B43E00' : '#475569'}
              stroke={earned ? '#B43E00' : '#475569'}
              strokeWidth="8"
              strokeLinejoin="round"
              transform="translate(0, 4)"
            />
            {/* Main Plump Star Body */}
            <path
              d="M50 6 L63 32 L92 36 L71 56 L76 85 L50 71 L24 85 L29 56 L8 36 L37 32 Z"
              fill={`url(#starGrad-${idx})`}
              stroke={earned ? '#D9480F' : '#64748B'}
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Inner Top Specular Shine */}
            {earned && (
              <path
                d="M50 13 L59 31 L78 34 C65 40 42 40 22 34 L41 31 Z"
                fill="rgba(255, 255, 255, 0.65)"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
};

export type PillVariant = 'start' | 'ok' | 'next' | 'exit';

const PILL_GRADIENTS: Record<
  PillVariant,
  { bg: string; innerShadow: string; textShadow: string }
> = {
  // Yellow-Orange glossy capsule ("START")
  start: {
    bg: 'linear-gradient(180deg, #FFEE32 0%, #FF9E00 52%, #FF5400 100%)',
    innerShadow: 'inset 0 -5px 8px rgba(180, 45, 0, 0.55)',
    textShadow: '0 2px 3px rgba(154, 52, 18, 0.85)',
  },
  // Lime-Green glossy capsule ("OK")
  ok: {
    bg: 'linear-gradient(180deg, #AACC00 0%, #70E000 52%, #2B9348 100%)',
    innerShadow: 'inset 0 -5px 8px rgba(20, 83, 45, 0.55)',
    textShadow: '0 2px 3px rgba(20, 83, 45, 0.85)',
  },
  // Sky-Blue glossy capsule ("NEXT")
  next: {
    bg: 'linear-gradient(180deg, #48CAE4 0%, #0096C7 52%, #023E8A 100%)',
    innerShadow: 'inset 0 -5px 8px rgba(3, 4, 94, 0.55)',
    textShadow: '0 2px 3px rgba(3, 4, 94, 0.85)',
  },
  // Red-Orange glossy capsule ("EXIT")
  exit: {
    bg: 'linear-gradient(180deg, #FF9E00 0%, #FF4800 52%, #C9184A 100%)',
    innerShadow: 'inset 0 -5px 8px rgba(128, 15, 47, 0.6)',
    textShadow: '0 2px 3px rgba(128, 15, 47, 0.9)',
  },
};

/**
 * Glossy Pill Button with Thick White/Silver Outer Rim matching START, OK, NEXT, EXIT in the reference Game Kit.
 */
export const GameKitPillButton: React.FC<{
  variant?: PillVariant;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}> = ({
  variant = 'start',
  onClick,
  disabled = false,
  size = 'md',
  className = '',
  children,
}) => {
  const styleCfg = PILL_GRADIENTS[variant];
  const sizeClasses =
    size === 'lg'
      ? 'px-7 py-3 text-base sm:text-lg min-h-[54px]'
      : size === 'md'
      ? 'px-5 py-2.5 text-sm sm:text-base min-h-[46px]'
      : 'px-3.5 py-1.5 text-xs sm:text-sm min-h-[36px]';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #DCE4EE 65%, #94A3B8 100%)',
        boxShadow: '0 5px 0 #475569, 0 10px 18px rgba(15, 23, 42, 0.42)',
      }}
      className={`gamekit-btn-press relative rounded-full p-[4px] inline-flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none shrink-0 ${className}`}
    >
      <span
        style={{
          background: styleCfg.bg,
          boxShadow: styleCfg.innerShadow,
          textShadow: styleCfg.textShadow,
        }}
        className={`relative w-full h-full rounded-full ${sizeClasses} font-game-display font-bold text-white flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap`}
      >
        {/* Top White Gloss Reflection Capsule */}
        <span
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.12) 100%)',
          }}
          className="absolute top-[3px] left-[10%] right-[10%] h-[42%] rounded-full pointer-events-none"
          aria-hidden="true"
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </span>
    </button>
  );
};

export type OrbVariant = 'orange' | 'green' | 'blue';
export type OrbIconType =
  | 'play'
  | 'next'
  | 'prev'
  | 'undo'
  | 'close'
  | 'plus'
  | 'check'
  | 'pause'
  | 'home'
  | 'trophy'
  | 'stats'
  | 'sound-on'
  | 'sound-off';

const ORB_GRADIENTS: Record<OrbVariant, string> = {
  orange:
    'radial-gradient(circle at 50% 22%, #FFF75E 0%, #FF9E00 55%, #E85D04 100%)',
  green:
    'radial-gradient(circle at 50% 22%, #B5F82A 0%, #55D600 55%, #1B8A00 100%)',
  blue:
    'radial-gradient(circle at 50% 22%, #90E0EF 0%, #00B4D8 55%, #0077B6 100%)',
};

/**
 * Circular Glossy Orb Icon Button with Icy-Cyan Rim & Chunky 3D Beveled SVG Icons
 * matching the right 2 columns of the reference Game Kit image.
 */
export const GameKitOrbButton: React.FC<{
  variant?: OrbVariant;
  icon: OrbIconType;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  badge?: string | number;
  className?: string;
}> = ({
  variant = 'orange',
  icon,
  onClick,
  title,
  disabled = false,
  size = 'md',
  badge,
  className = '',
}) => {
  const outerDims =
    size === 'lg'
      ? 'w-16 h-16 p-[4px]'
      : size === 'md'
      ? 'w-12 h-12 p-[3.5px]'
      : 'w-10 h-10 p-[3px]';

  const iconDims =
    size === 'lg' ? 'w-9 h-9' : size === 'md' ? 'w-6 h-6' : 'w-5 h-5';

  const isGreenIconStyle = variant === 'green';

  const renderChunkyIcon = () => {
    const fillId = isGreenIconStyle ? '#058C11' : '#F8FAFC';
    const strokeId = isGreenIconStyle ? '#03530A' : '#9A3412';

    switch (icon) {
      case 'play':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M20 14 L50 32 L20 50 Z"
              fill={fillId}
              stroke={strokeId}
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'next':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M12 24 H34 V14 L54 32 L34 50 V40 H12 Z"
              fill={fillId}
              stroke={strokeId}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'prev':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M52 24 H30 V14 L10 32 L30 50 V40 H52 Z"
              fill={fillId}
              stroke={strokeId}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'undo':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M28 18 V10 L12 24 L28 38 V30 C39 30 44 35 44 42 C44 47 39 51 32 52 L35 58 C46 56 54 49 54 39 C54 27 44 18 28 18 Z"
              fill={fillId}
              stroke={strokeId}
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'close':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M18 18 L46 46 M46 18 L18 46"
              stroke={fillId}
              strokeWidth="11"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'plus':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M32 14 V50 M14 32 H50"
              stroke={fillId}
              strokeWidth="12"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'check':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M15 34 L27 46 L50 20"
              fill="none"
              stroke={fillId}
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'pause':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <rect
              x="17"
              y="15"
              width="11"
              height="34"
              rx="5"
              fill={fillId}
              stroke={strokeId}
              strokeWidth="3"
            />
            <rect
              x="36"
              y="15"
              width="11"
              height="34"
              rx="5"
              fill={fillId}
              stroke={strokeId}
              strokeWidth="3"
            />
          </svg>
        );
      case 'home':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M32 12 L10 32 H18 V50 H28 V38 H36 V50 H46 V32 H54 Z"
              fill={fillId}
              stroke={strokeId}
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'trophy':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M18 14 H46 V28 C46 37 39 42 32 42 C25 42 18 37 18 28 Z M26 42 H38 V50 H26 Z M20 50 H44"
              fill={fillId}
              stroke={strokeId}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'stats':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <rect x="14" y="32" width="9" height="18" rx="3" fill={fillId} />
            <rect x="27.5" y="18" width="9" height="32" rx="3" fill={fillId} />
            <rect x="41" y="25" width="9" height="25" rx="3" fill={fillId} />
          </svg>
        );
      case 'sound-on':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M14 25 H24 L36 15 V49 L24 39 H14 Z"
              fill={fillId}
              stroke={strokeId}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M44 22 C49 27 49 37 44 42 M50 16 C58 24 58 40 50 48"
              fill="none"
              stroke={fillId}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'sound-off':
        return (
          <svg viewBox="0 0 64 64" className={iconDims} aria-hidden="true">
            <path
              d="M14 25 H24 L36 15 V49 L24 39 H14 Z"
              fill={fillId}
              stroke={strokeId}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M43 25 L55 39 M55 25 L43 39"
              stroke={fillId}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: 'linear-gradient(180deg, #F0F9FF 0%, #7DD3FC 55%, #0284C7 100%)',
        boxShadow: '0 5px 0 #0369A1, 0 9px 16px rgba(15, 23, 42, 0.45)',
      }}
      className={`gamekit-btn-press relative rounded-full ${outerDims} inline-flex items-center justify-center cursor-pointer disabled:opacity-45 disabled:pointer-events-none select-none shrink-0 ${className}`}
    >
      <span
        style={{
          background: ORB_GRADIENTS[variant],
          boxShadow: 'inset 0 -5px 8px rgba(0, 0, 0, 0.32)',
        }}
        className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden"
      >
        {/* Curved Upper Specular Gloss Arc */}
        <span
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.08) 100%)',
          }}
          className="absolute top-[3px] left-[14%] right-[14%] h-[44%] rounded-full pointer-events-none"
          aria-hidden="true"
        />
        <span className="relative z-10 drop-shadow-xs flex items-center justify-center">
          {renderChunkyIcon()}
        </span>
      </span>

      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#FF4800] border-2 border-white text-[10px] font-mono-num font-bold text-white leading-none shadow-xs">
          {badge}
        </span>
      )}
    </button>
  );
};
