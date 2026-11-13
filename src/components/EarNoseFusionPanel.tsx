import React from 'react';
import { Volume2, Wind, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { TranslationStrings } from '../services/i18n';

interface EarNoseFusionPanelProps {
  acousticScore: number;
  gasScore: number;
  insectEventsPerMin: number;
  gasIndex: number;
  t: TranslationStrings;
}

export const EarNoseFusionPanel: React.FC<EarNoseFusionPanelProps> = ({
  acousticScore,
  gasScore,
  insectEventsPerMin,
  gasIndex,
  t,
}) => {
  const acousticHigh = acousticScore >= 60;
  const gasHigh = gasScore >= 60;
  const bothAgree = acousticHigh && gasHigh;
  const oneHigh = (acousticHigh || gasHigh) && !bothAgree;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            {t.earNoseFusionTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.earNoseSubtitle}
          </p>
        </div>

        {/* Status Pill Badge */}
        <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
          {bothAgree ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 animate-pulse border border-red-300 dark:border-red-800">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              {t.fusionBothAgree}
            </span>
          ) : oneHigh ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {t.fusionOneHigh}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {t.fusionNormal}
            </span>
          )}
        </div>
      </div>

      {/* Fusion Schematic Layout */}
      <div className="relative mt-6 pt-2 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 relative">
          
          {/* SENSOR 1: THE EAR (Acoustic Sensor) */}
          <div className={`p-4 rounded-xl border transition-all ${
            acousticHigh
              ? 'border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Volume2 className={`w-4 h-4 ${acousticHigh ? 'text-red-600 animate-bounce' : 'text-teal-600'}`} />
                {t.acousticEar}
              </span>
              <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                acousticHigh ? 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {acousticHigh ? 'EXCEEDED' : 'NOMINAL'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                  {insectEventsPerMin}
                </span>
                <span className="text-xs text-slate-500 ml-1">events/min</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400">Score:</span>
                <span className={`ml-1 text-sm font-bold font-mono ${acousticHigh ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {acousticScore}/100
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 relative w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${acousticHigh ? 'bg-red-500' : 'bg-teal-500'}`}
                style={{ width: `${acousticScore}%` }}
              />
              {/* Threshold mark at 60% */}
              <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-red-600 z-10" title="Threshold: 60" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0</span>
              <span className="text-red-500 font-bold">Thresh: 60</span>
              <span>100</span>
            </div>
          </div>

          {/* CENTRAL FUSION JUNCTION / CROSS-VALIDATION CORE */}
          <div className="flex flex-col items-center justify-center p-4">
            {/* Animated Connector lines for desktop */}
            <div className="relative flex items-center justify-center w-full">
              {/* Central Glowing Shield / Checkbox */}
              <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-500 shadow-md ${
                bothAgree
                  ? 'border-red-500 bg-red-600 text-white animate-pulse shadow-red-500/40 scale-105'
                  : oneHigh
                  ? 'border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                {bothAgree ? (
                  <>
                    <ShieldAlert className="w-8 h-8 animate-bounce" />
                    <span className="text-[10px] font-black tracking-widest mt-0.5">ALERT</span>
                  </>
                ) : oneHigh ? (
                  <>
                    <AlertTriangle className="w-8 h-8" />
                    <span className="text-[10px] font-bold tracking-tight mt-0.5">1 SIGNAL</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-8 h-8" />
                    <span className="text-[10px] font-bold tracking-tight mt-0.5">AGREED</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {bothAgree
                  ? 'CROSS-VALIDATED'
                  : oneHigh
                  ? 'UNCONFIRMED SIGNAL'
                  : 'SAFE STATUS'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5 max-w-[200px]">
                {bothAgree
                  ? 'Both acoustic and gas exceed limit: Spoilage confirmed!'
                  : oneHigh
                  ? 'Only 1 sensor high. Cross-validation prevents false alarm.'
                  : 'Both sensors indicate clean grain.'}
              </span>
            </div>
          </div>

          {/* SENSOR 2: THE NOSE (Gas Sensor MQ-135) */}
          <div className={`p-4 rounded-xl border transition-all ${
            gasHigh
              ? 'border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wind className={`w-4 h-4 ${gasHigh ? 'text-red-600 animate-pulse' : 'text-orange-500'}`} />
                {t.gasNose}
              </span>
              <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                gasHigh ? 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {gasHigh ? 'EXCEEDED' : 'NOMINAL'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                  {gasIndex.toFixed(2)}x
                </span>
                <span className="text-xs text-slate-500 ml-1">vs baseline</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400">Score:</span>
                <span className={`ml-1 text-sm font-bold font-mono ${gasHigh ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {gasScore}/100
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 relative w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${gasHigh ? 'bg-red-500' : 'bg-orange-500'}`}
                style={{ width: `${gasScore}%` }}
              />
              {/* Threshold mark at 60% */}
              <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-red-600 z-10" title="Threshold: 60" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0</span>
              <span className="text-red-500 font-bold">Thresh: 60</span>
              <span>100</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
