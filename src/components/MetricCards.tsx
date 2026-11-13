import React from 'react';
import { Thermometer, Droplets, Gauge, Wind, Volume2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SensorReading, StorageSettings } from '../types';
import { TranslationStrings } from '../services/i18n';

interface MetricCardsProps {
  current: SensorReading;
  previous?: SensorReading;
  settings: StorageSettings;
  t: TranslationStrings;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ current, previous, settings, t }) => {
  const isGrains = current.module === 'grains';

  const getTrendIcon = (curr: number, prev?: number) => {
    if (!prev || Math.abs(curr - prev) < 0.05) {
      return <Minus className="w-3 h-3 text-slate-400" />;
    }
    if (curr > prev) {
      return <TrendingUp className="w-3 h-3 text-red-500" />;
    }
    return <TrendingDown className="w-3 h-3 text-emerald-500" />;
  };

  const tempOver = current.temperature > settings.tempThreshold;
  const humOver = current.humidity > settings.humidityThreshold;
  const gasOver = current.gasIndex >= settings.gasThreshold;
  const acousticOver = isGrains && current.insectEventsPerMin >= settings.acousticThreshold;

  return (
    <div className={`grid grid-cols-2 ${isGrains ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 sm:gap-4`}>
      
      {/* 1. Core Temperature */}
      <div className={`p-4 rounded-2xl border transition-all ${
        tempOver
          ? 'border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90'
      }`}>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Thermometer className={`w-3.5 h-3.5 ${tempOver ? 'text-red-500' : 'text-teal-600'}`} />
            {t.kpiTemp}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {getTrendIcon(current.temperature, previous?.temperature)}
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold tabular-nums font-mono text-slate-900 dark:text-white">
            {current.temperature.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-slate-400">°C</span>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Max Safe: {settings.tempThreshold}°C</span>
          <span className={tempOver ? 'text-red-600 font-bold' : 'text-emerald-600'}>
            {tempOver ? 'ELEVATED' : 'NOMINAL'}
          </span>
        </div>
      </div>

      {/* 2. Relative Humidity */}
      <div className={`p-4 rounded-2xl border transition-all ${
        humOver
          ? 'border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90'
      }`}>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className={`w-3.5 h-3.5 ${humOver ? 'text-amber-500' : 'text-blue-500'}`} />
            {t.kpiHumidity}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {getTrendIcon(current.humidity, previous?.humidity)}
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold tabular-nums font-mono text-slate-900 dark:text-white">
            {current.humidity.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-slate-400">%</span>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Safe Cap: {settings.humidityThreshold}%</span>
          <span className={humOver ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
            {humOver ? 'HIGH RISK' : 'NOMINAL'}
          </span>
        </div>
      </div>

      {/* 3. Gas Index (MQ-135) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        gasOver
          ? 'border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90'
      }`}>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Wind className={`w-3.5 h-3.5 ${gasOver ? 'text-red-500' : 'text-orange-500'}`} />
            {t.kpiGasIndex}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {getTrendIcon(current.gasIndex, previous?.gasIndex)}
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold tabular-nums font-mono text-slate-900 dark:text-white">
            {current.gasIndex.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-slate-400">index</span>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Limit: {settings.gasThreshold}x</span>
          <span className={gasOver ? 'text-red-600 font-bold' : 'text-emerald-600'}>
            {gasOver ? 'SPOILAGE' : 'CLEAN'}
          </span>
        </div>
      </div>

      {/* 4. Insect Sound Activity (Grains Only) */}
      {isGrains && (
        <div className={`p-4 rounded-2xl border transition-all ${
          acousticOver
            ? 'border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90'
        }`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className={`w-3.5 h-3.5 ${acousticOver ? 'text-red-500' : 'text-teal-600'}`} />
              {t.kpiAcoustic}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono">
              {getTrendIcon(current.insectEventsPerMin, previous?.insectEventsPerMin)}
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold tabular-nums font-mono text-slate-900 dark:text-white">
              {current.insectEventsPerMin}
            </span>
            <span className="text-xs font-semibold text-slate-400">/min</span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Limit: {settings.acousticThreshold}</span>
            <span className={acousticOver ? 'text-red-600 font-bold' : 'text-emerald-600'}>
              {acousticOver ? 'CHEWING' : 'QUIET'}
            </span>
          </div>
        </div>
      )}

      {/* 5. Grain Level (HC-SR04) */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-teal-600" />
            {t.kpiGrainLevel}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {current.distanceCm}cm gap
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold tabular-nums font-mono text-slate-900 dark:text-white">
            {current.grainLevelPct}
          </span>
          <span className="text-sm font-semibold text-slate-400">%</span>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Bin: {settings.binHeightCm}cm</span>
          <span className="text-teal-600 font-semibold">STABLE</span>
        </div>
      </div>

    </div>
  );
};
