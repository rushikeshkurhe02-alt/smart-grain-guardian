import React from 'react';
import { Layers, Radio, Sparkles } from 'lucide-react';

interface GrainBinGraphicProps {
  fillPct: number;
  distanceCm: number;
  binHeightCm: number;
  riskScore: number;
  module: 'grains' | 'onion_potato';
}

export const GrainBinGraphic: React.FC<GrainBinGraphicProps> = ({
  fillPct,
  distanceCm,
  binHeightCm,
  riskScore,
  module,
}) => {
  const clampedFill = Math.min(Math.max(fillPct, 5), 98);
  const isGrains = module === 'grains';

  // Color interpolation for grain/produce based on riskScore
  // Safe (<40): Healthy Gold (#E8A338 / #F2B134)
  // Warning (40-60): Amber (#D97706)
  // Critical (>60): Spoiled Rust / Dark Red (#991B1B)
  const getFillColor = () => {
    if (riskScore < 40) return '#F2B134';
    if (riskScore < 60) return '#D97706';
    return '#991B1B';
  };

  const getSecondaryColor = () => {
    if (riskScore < 40) return '#E8622C';
    if (riskScore < 60) return '#B45309';
    return '#7F1D1D';
  };

  const grainColor = getFillColor();
  const grainSecondary = getSecondaryColor();

  // SVG dimensions: viewBox 0 0 200 280
  // Silo body height: 180px (from y=60 to y=240), hopper cone: y=240 to y=270
  // Fill height: (clampedFill / 100) * 190
  const fillHeightPx = (clampedFill / 100) * 180;
  const grainTopY = 240 - fillHeightPx;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm flex flex-col items-center justify-between">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {isGrains ? 'Silo Grain Bulk (HC-SR04)' : 'Produce Bin Fill (HC-SR04)'}
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              Height: {binHeightCm}cm · Air gap: {distanceCm}cm
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-black tabular-nums text-slate-900 dark:text-white font-mono">
            {fillPct}%
          </span>
          <span className="text-[10px] text-slate-400 block -mt-1">Capacity</span>
        </div>
      </div>

      {/* Silo SVG Graphic */}
      <div className="relative my-4 flex items-center justify-center">
        <svg
          width="180"
          height="250"
          viewBox="0 0 200 280"
          className="overflow-visible"
        >
          <defs>
            {/* Grain Texture / Gradient */}
            <linearGradient id="grainFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={grainColor} />
              <stop offset="100%" stopColor={grainSecondary} />
            </linearGradient>

            {/* Silo Metallic Sheen */}
            <linearGradient id="siloMetalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.4" />
              <stop offset="20%" stopColor="#CBD5E1" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F1F5F9" stopOpacity="0.3" />
              <stop offset="85%" stopColor="#94A3B8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#64748B" stopOpacity="0.5" />
            </linearGradient>

            <clipPath id="siloClip">
              {/* Cylindrical body with conical roof and discharge hopper */}
              <path d="M 40 50 L 160 50 L 160 230 L 115 265 L 85 265 L 40 230 Z" />
            </clipPath>
          </defs>

          {/* Silo Conical Roof */}
          <path
            d="M 40 50 L 100 20 L 160 50"
            fill="none"
            stroke="#64748B"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Ultrasonic Sensor at Apex */}
          <g transform="translate(90, 14)">
            <rect width="20" height="10" rx="2" fill="#0E8A96" />
            <circle cx="6" cy="10" r="3" fill="#38BDF8" />
            <circle cx="14" cy="10" r="3" fill="#38BDF8" />
          </g>

          {/* Animated Ultrasonic Waves downward */}
          <path
            d="M 94 30 A 10 10 0 0 1 106 30"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            className="animate-pulse"
          />
          <path
            d="M 88 38 A 18 18 0 0 1 112 38"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="animate-pulse"
          />

          {/* Silo Body Outline */}
          <path
            d="M 40 50 L 160 50 L 160 230 L 115 265 L 85 265 L 40 230 Z"
            fill="none"
            stroke="url(#siloMetalGrad)"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* Horizontal Silo Ribs */}
          <line x1="40" y1="95" x2="160" y2="95" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <line x1="40" y1="140" x2="160" y2="140" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <line x1="40" y1="185" x2="160" y2="185" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

          {/* Clipped Grain Fill Area with Smooth Wave at Surface */}
          <g clipPath="url(#siloClip)">
            {/* Grain background block */}
            <rect
              x="30"
              y={grainTopY}
              width="140"
              height={280 - grainTopY}
              fill="url(#grainFillGrad)"
              className="transition-all duration-700 ease-out"
            />

            {/* Grain heap surface curve */}
            <ellipse
              cx="100"
              cy={grainTopY}
              rx="60"
              ry="8"
              fill={grainColor}
              opacity="0.9"
              className="transition-all duration-700 ease-out"
            />

            {/* Spoilage heat pocket indicator if risk > 50 */}
            {riskScore >= 50 && (
              <g className="animate-pulse">
                <circle
                  cx="95"
                  cy={grainTopY + 45}
                  r="22"
                  fill="#EF4444"
                  opacity="0.35"
                />
                <circle
                  cx="95"
                  cy={grainTopY + 45}
                  r="12"
                  fill="#DC2626"
                  opacity="0.6"
                />
                <text
                  x="95"
                  y={grainTopY + 48}
                  fill="#FFFFFF"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  HOT SPOT
                </text>
              </g>
            )}

            {/* Spoilage Gas Bubbles rising if risk > 40 */}
            {riskScore >= 40 && (
              <g className="animate-grain">
                <circle cx="80" cy={grainTopY + 25} r="2.5" fill="#FFFFFF" opacity="0.6" />
                <circle cx="110" cy={grainTopY + 35} r="3" fill="#FFFFFF" opacity="0.6" />
                <circle cx="125" cy={grainTopY + 15} r="2" fill="#FFFFFF" opacity="0.7" />
              </g>
            )}
          </g>

          {/* Level Measurement Arrow on Side */}
          <line x1="172" y1="50" x2="172" y2={grainTopY} stroke="#0EA5E9" strokeWidth="1.5" strokeDasharray="2 2" />
          <text x="178" y={Math.max(50 + (grainTopY - 50) / 2, 70)} className="text-[9px] fill-sky-600 dark:fill-sky-400 font-mono" textAnchor="start">
            {distanceCm}cm
          </text>

          {/* Total Height Baseline */}
          <line x1="28" y1="50" x2="28" y2="265" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="24" y="160" className="text-[9px] fill-slate-400 font-mono" textAnchor="end">
            {binHeightCm}cm
          </text>
        </svg>
      </div>

      {/* Footer Info */}
      <div className="w-full text-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: grainColor }} />
          <span className="text-slate-700 dark:text-slate-300">
            {riskScore < 40 ? 'Clean Harvest Bulk' : (riskScore < 60 ? 'Thermal/Moisture Drift' : 'Spoilage Discoloration')}
          </span>
        </div>
      </div>
    </div>
  );
};
