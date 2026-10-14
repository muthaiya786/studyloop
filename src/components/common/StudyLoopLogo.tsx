import React from 'react';

interface StudyLoopLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  light?: boolean;
}

export const StudyLoopLogo: React.FC<StudyLoopLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
  light = false,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', subtext: 'text-[9px]' },
    md: { icon: 36, text: 'text-xl', subtext: 'text-[10px]' },
    lg: { icon: 44, text: 'text-2xl', subtext: 'text-xs' },
    xl: { icon: 56, text: 'text-3xl', subtext: 'text-sm' },
  };

  const { icon: iconDim, text: textSize, subtext: subtextSize } = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      role="img"
      aria-label="Study Loop Logo — Continuous learning and revision loop"
    >
      {/* SVG Learning Loop Icon */}
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="studyLoopGrad1" x1="4" y1="8" x2="60" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6857E8" />
            <stop offset="1" stopColor="#5645D3" />
          </linearGradient>
          <linearGradient id="studyLoopGrad2" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9B8EFF" />
            <stop offset="1" stopColor="#6857E8" />
          </linearGradient>
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6857E8" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Rounded Container / Base Halo */}
        <rect width="64" height="64" rx="16" fill="url(#studyLoopGrad1)" filter="url(#subtleGlow)" />

        {/* Geometric Infinite Learning Path & Open Study Pages */}
        {/* Left Loop (Book Base) */}
        <path
          d="M32 38C26 34 20 34 14 36V22C20 20 26 20 32 24V38Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />

        {/* Right Loop (Revision Pathway) */}
        <path
          d="M32 38C38 34 44 34 50 36V22C44 20 38 20 32 24V38Z"
          fill="#FFFFFF"
          fillOpacity="0.85"
        />

        {/* Central Spine */}
        <line x1="32" y1="23" x2="32" y2="38" stroke="#5645D3" strokeWidth="2.5" strokeLinecap="round" />

        {/* Continuous Active Recall Loop Orbit */}
        <path
          d="M20 44C24 47 40 47 44 44C47.5 41.3 47 37 43 35"
          stroke="#E3F8EF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 1"
        />

        {/* Dynamic Recall Checkmark */}
        <path
          d="M26 31L30.5 35.5L42 24"
          stroke="#238A66"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`font-black tracking-tight ${textSize} ${
                light ? 'text-white' : 'text-[#172033]'
              }`}
            >
              Study<span className="text-[#6857E8]">Loop</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#238A66] mb-1" />
          </div>
          <span
            className={`font-medium tracking-wide uppercase ${subtextSize} ${
              light ? 'text-[#D4DAE5]' : 'text-[#778196]'
            }`}
          >
            Your study, in rhythm.
          </span>
        </div>
      )}
    </div>
  );
};
