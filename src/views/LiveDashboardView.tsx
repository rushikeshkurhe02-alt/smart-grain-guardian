import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Radio,
} from 'lucide-react';
import { SensorReading, StorageSettings, ScenarioType, AlertSeverity } from '../types';
import { TranslationStrings } from '../services/i18n';
import { RadialRiskGauge } from '../components/RadialRiskGauge';
import { EarNoseFusionPanel } from '../components/EarNoseFusionPanel';
import { GrainBinGraphic } from '../components/GrainBinGraphic';
import { MetricCards } from '../components/MetricCards';
import { LiveChart } from '../components/LiveChart';

interface LiveDashboardViewProps {
  currentReading: SensorReading;
  previousReading?: SensorReading;
  readings: SensorReading[];
  settings: StorageSettings;
  activeScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  onOpenPitch: () => void;
  onOpenESP32: () => void;
  t: TranslationStrings;
}

export const LiveDashboardView: React.FC<LiveDashboardViewProps> = ({
  currentReading,
  previousReading,
  readings,
  settings,
  activeScenario,
  onSelectScenario,
  onOpenPitch,
  onOpenESP32,
  t,
}) => {
  const isGrains = settings.module === 'grains';
  const status = currentReading.status;

  const getStatusBannerStyle = (st: AlertSeverity) => {
    if (st === 'alert') {
      return {
        bg: 'bg-red-500/10 dark:bg-red-950/40 border-red-500/40 text-red-900 dark:text-red-100',
        badgeBg: 'bg-red-600 text-white',
        icon: <ShieldAlert className="w-5 h-5 text-red-600 animate-bounce" />,
        headline: t.alertHeadline,
        tag: t.statusAlert,
      };
    }
    if (st === 'early_warning') {
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/40 text-amber-950 dark:text-amber-100',
        badgeBg: 'bg-amber-500 text-white',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        headline: t.warningHeadline,
        tag: t.statusWarning,
      };
    }
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-950 dark:text-emerald-100',
      badgeBg: 'bg-emerald-600 text-white',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      headline: t.normalHeadline,
      tag: t.statusNormal,
    };
  };

  const banner = getStatusBannerStyle(status);

  return (
    <div className="space-y-6">

      {/* 1. Main Status Banner with Pulsing Alert State */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${banner.bg} ${status === 'alert' ? 'animate-pulse-subtle shadow-lg shadow-red-500/10' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs mt-0.5">
              {banner.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase ${banner.badgeBg}`}>
                  {banner.tag}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {new Date(currentReading.ts).toLocaleTimeString()}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mt-1 text-slate-900 dark:text-white">
                {banner.headline}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
                {currentReading.statusReason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={onOpenPitch}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.tabPitchMode}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Scenario Testing Strip (For Judges & Demos) */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {t.scenariosTitle}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              · Test IoT response live
            </span>
          </div>

          <button
            onClick={onOpenESP32}
            className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline self-start md:self-center"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Connect Physical ESP32 Hardware</span>
          </button>
        </div>

        {/* 5 Scenario Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
          <button
            onClick={() => onSelectScenario('normal')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-left ${
              activeScenario === 'normal'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="block font-bold">{t.scenarioNormal}</span>
            <span className={`text-[10px] ${activeScenario === 'normal' ? 'text-emerald-100' : 'text-slate-400'}`}>
              Safe ambient balance
            </span>
          </button>

          <button
            onClick={() => onSelectScenario('humidity_rising')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-left ${
              activeScenario === 'humidity_rising'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="block font-bold">{t.scenarioHumRising}</span>
            <span className={`text-[10px] ${activeScenario === 'humidity_rising' ? 'text-blue-100' : 'text-slate-400'}`}>
              Rain / damp drift (&gt;74%)
            </span>
          </button>

          <button
            onClick={() => onSelectScenario('fungal_spoilage')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-left ${
              activeScenario === 'fungal_spoilage'
                ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="block font-bold">{t.scenarioFungus}</span>
            <span className={`text-[10px] ${activeScenario === 'fungal_spoilage' ? 'text-orange-100' : 'text-slate-400'}`}>
              MQ-135 Gas VOC surge
            </span>
          </button>

          <button
            onClick={() => onSelectScenario('insect_infestation')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-left ${
              activeScenario === 'insect_infestation'
                ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="block font-bold">{t.scenarioInsects}</span>
            <span className={`text-[10px] ${activeScenario === 'insect_infestation' ? 'text-teal-100' : 'text-slate-400'}`}>
              Acoustic chewing pulses
            </span>
          </button>

          <button
            onClick={() => onSelectScenario('confirmed_alert')}
            className={`col-span-2 sm:col-span-1 px-3 py-2 rounded-xl text-xs font-semibold border transition text-left ${
              activeScenario === 'confirmed_alert'
                ? 'bg-red-600 text-white border-red-600 shadow-sm animate-pulse'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="block font-bold">{t.scenarioConfirmedAlert}</span>
            <span className={`text-[10px] ${activeScenario === 'confirmed_alert' ? 'text-red-100' : 'text-slate-400'}`}>
              Dual-Signal Agreement!
            </span>
          </button>
        </div>
      </div>

      {/* 3. Central Telemetry Grid: Radial Risk Gauge + Grain Bin Graphic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Radial Risk Gauge & Micro-Climate Summary (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t.riskGaugeTitle}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Formula v2.4 (Biochemical)
              </span>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <RadialRiskGauge score={currentReading.riskScore} status={currentReading.status} size={250} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Gas Sub-Score</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{currentReading.gasScore}/100</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block">{isGrains ? 'Acoustic Score' : 'Temp Risk'}</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                {isGrains ? `${currentReading.acousticScore}/100` : `${currentReading.tempRisk}/100`}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Humidity Risk</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{currentReading.humidityRisk}/100</span>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Grain Bin Graphic (HC-SR04 Level & Fill) (7 cols) */}
        <div className="lg:col-span-7">
          <GrainBinGraphic
            fillPct={currentReading.grainLevelPct}
            distanceCm={currentReading.distanceCm}
            binHeightCm={settings.binHeightCm}
            riskScore={currentReading.riskScore}
            module={settings.module}
          />
        </div>
      </div>

      {/* 4. Signature Visual: "EAR + NOSE" Fusion Panel (Grains Module Only) */}
      {isGrains && (
        <EarNoseFusionPanel
          acousticScore={currentReading.acousticScore}
          gasScore={currentReading.gasScore}
          insectEventsPerMin={currentReading.insectEventsPerMin}
          gasIndex={currentReading.gasIndex}
          t={t}
        />
      )}

      {/* 5. KPI Cards with Sparkline Direction */}
      <MetricCards
        current={currentReading}
        previous={previousReading}
        settings={settings}
        t={t}
      />

      {/* 6. Live Multi-Line Chart (Last 30 Cycles) */}
      <LiveChart readings={readings} settings={settings} />

    </div>
  );
};
