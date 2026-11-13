import React from 'react';
import { AlertSeverity } from '../types';

interface RadialRiskGaugeProps {
  score: number;
  status: AlertSeverity;
  size?: number;
}

export const RadialRiskGauge: React.FC<RadialRiskGaugeProps> = ({ score, status, size = 240 }) => {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  // Semi-circle gauge from 180° to 360° (or -180 to 0)
  // Needle angle: 0 corresponds to -90° (left), 100 corresponds to 90° (right)
  const angle = -90 + (clampedScore / 100) * 180;

  // Colors based on status
  const getColor = () => {
    if (clampedScore < 40) return '#16A34A'; // green
    if (clampedScore < 60) return '#D97706'; // amber
    return '#DC2626'; // crimson red
  };

  const getStatusLabel = () => {
    if (status === 'alert') return 'CRITICAL ALERT';
    if (status === 'early_warning') return 'EARLY WARNING';
    return 'SAFE / NOMINAL';
  };

  const currentColor = getColor();

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg
        width={size}
        height={size * 0.68}
        viewBox="0 0 240 160"
        className="overflow-visible select-none"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="40%" stopColor="#5BA85A" />
            <stop offset="55%" stopColor="#F2B134" />
            <stop offset="75%" stopColor="#E8622C" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>

          <filter id="gaugeShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Outer Background Arc */}
        <path
          d="M 30 140 A 90 90 0 0 1 210 140"
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Multi-Colored Range Arc */}
        <path
          d="M 30 140 A 90 90 0 0 1 210 140"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Threshold Markers */}
        {/* 40% marker */}
        <line
          x1="120"
          y1="140"
          x2={120 + 98 * Math.cos((-90 + 0.4 * 180) * (Math.PI / 180))}
          y2={140 + 98 * Math.sin((-90 + 0.4 * 180) * (Math.PI / 180))}
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />
        {/* 60% marker */}
        <line
          x1="120"
          y1="140"
          x2={120 + 98 * Math.cos((-90 + 0.6 * 180) * (Math.PI / 180))}
          y2={140 + 98 * Math.sin((-90 + 0.6 * 180) * (Math.PI / 180))}
          stroke="#EF4444"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />

        {/* Animated Needle */}
        <g
          transform={`translate(120, 140) rotate(${angle})`}
          className="transition-transform duration-700 ease-out"
        >
          {/* Needle shadow */}
          <path
            d="M -3 0 L 0 -84 L 3 0 Z"
            fill="rgba(0,0,0,0.2)"
            transform="translate(1, 2)"
          />
          {/* Main pointer needle */}
          <path
            d="M -3 0 L 0 -84 L 3 0 Z"
            fill={currentColor}
          />
          <circle cx="0" cy="0" r="8" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="3" fill={currentColor} />
        </g>

        {/* Threshold tick labels */}
        <text x="32" y="156" className="text-[10px] fill-slate-400 font-mono" textAnchor="middle">0</text>
        <text x="96" y="58" className="text-[10px] fill-slate-400 font-mono" textAnchor="middle">40</text>
        <text x="144" y="58" className="text-[10px] fill-red-400 font-mono font-bold" textAnchor="middle">60</text>
        <text x="208" y="156" className="text-[10px] fill-slate-400 font-mono" textAnchor="middle">100</text>
      </svg>

      {/* Central Value Readout */}
      <div className="text-center -mt-8">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
            {clampedScore}
          </span>
          <span className="text-sm font-semibold text-slate-400">/100</span>
        </div>

        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-bold tracking-wide" style={{ color: currentColor }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentColor }} />
          <span>{getStatusLabel()}</span>
        </div>
      </div>
    </div>
  );
};
