/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Brain,
  History,
  Bell,
  HelpCircle,
  Settings as SettingsIcon,
  Play,
  Radio,
  Sun,
  Moon,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

import {
  SensorReading,
  StorageSettings,
  AlertItem,
  ScenarioType,
  StorageModule,
} from './types';
import { translations, SupportedLanguage } from './services/i18n';
import {
  DEFAULT_SETTINGS,
  generate7DaySeedData,
  SCENARIO_PRESETS,
  stepSimulatedReading,
} from './services/simulator';
import { generateAlertOnTransition } from './services/spoilageLogic';
import { exportSensorReadingsCSV } from './services/exportData';
import { useSoundAlarm } from './hooks/useSoundAlarm';

import { LiveDashboardView } from './views/LiveDashboardView';
import { AIInsightsView } from './views/AIInsightsView';
import { HistoryExportView } from './views/HistoryExportView';
import { AlertsCenterView } from './views/AlertsCenterView';
import { HowItWorksView } from './views/HowItWorksView';
import { SettingsView } from './views/SettingsView';
import { ESP32IntegrationView } from './views/ESP32IntegrationView';
import { PitchModeModal } from './components/PitchModeModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { PrintableReport } from './components/PrintableReport';

type ActiveTab = 'dashboard' | 'insights' | 'history' | 'alerts' | 'how-it-works' | 'settings' | 'esp32';

export default function App() {
  // 1. Settings & State
  const [settings, setSettings] = useState<StorageSettings>(() => {
    const saved = localStorage.getItem('grain_guardian_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('grain_guardian_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('normal');
  const [isPitchOpen, setIsPitchOpen] = useState<boolean>(false);

  // 2. Telemetry and Alerts State
  const [readings, setReadings] = useState<SensorReading[]>(() => generate7DaySeedData(settings));
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alert-init-1',
      ts: Date.now() - 4 * 3600 * 1000,
      severity: 'early_warning',
      type: 'humidity',
      message: 'Moisture drift: Internal bin humidity rose above 68% following ambient rain.',
      recommendedAction: 'Engage low-speed top exhaust aeration during cool, dry night window.',
      acknowledged: true,
      module: 'grains',
      riskScore: 46,
    },
    {
      id: 'alert-init-2',
      ts: Date.now() - 2 * 3600 * 1000,
      severity: 'early_warning',
      type: 'fungus',
      message: 'MQ-135 Gas index reached 1.45x baseline: Incipient fungal VOC detection.',
      recommendedAction: 'Inspect grain surface near ventilation inlet quadrant 3 for clumping.',
      acknowledged: false,
      module: 'grains',
      riskScore: 52,
    },
  ]);

  // Hardware Connection Tracking
  const [isHardwareOnline, setIsHardwareOnline] = useState<boolean>(false);
  const [lastSeenSecondsAgo, setLastSeenSecondsAgo] = useState<number | null>(null);

  const t = translations[settings.language] || translations.en;
  const currentReading = readings[readings.length - 1] || readings[0];
  const previousReading = readings[readings.length - 2];

  // Sound Alarm Chime
  useSoundAlarm(currentReading.status, settings.soundEnabled, settings.notificationsEnabled);

  // Theme Sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('grain_guardian_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('grain_guardian_theme', 'light');
    }
  }, [darkMode]);

  // Save Settings Sync
  useEffect(() => {
    localStorage.setItem('grain_guardian_settings', JSON.stringify(settings));
  }, [settings]);

  // 3. Real-Time Telemetry Loop (3-second cadence)
  useEffect(() => {
    const interval = window.setInterval(async () => {
      let isLiveESP32 = false;

      // Check if real ESP32 telemetry arrived at the server
      try {
        const res = await fetch(`/api/readings/latest?deviceId=${settings.deviceId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.reading && data?.isOnline) {
            isLiveESP32 = true;
            setIsHardwareOnline(true);
            setLastSeenSecondsAgo(data.lastSeenSecondsAgo);

            // Ingest real reading
            setReadings(prev => {
              const prevReading = prev[prev.length - 1];
              const newR: SensorReading = {
                id: `live-${Date.now()}`,
                ts: data.reading.ts,
                temperature: data.reading.temperature,
                humidity: data.reading.humidity,
                distanceCm: data.reading.distanceCm,
                grainLevelPct: Math.round(((settings.binHeightCm - data.reading.distanceCm) / settings.binHeightCm) * 100),
                gasRaw: data.reading.gasRaw,
                gasIndex: data.reading.gasIndex,
                acousticRaw: data.reading.acousticRaw,
                insectEventsPerMin: data.reading.insectEventsPerMin,
                module: settings.module,
                gasScore: Math.round(((data.reading.gasIndex - 1.0) / 0.4) * 100),
                acousticScore: Math.round((data.reading.insectEventsPerMin / settings.acousticThreshold) * 100),
                humidityRisk: data.reading.humidity > 65 ? Math.round(((data.reading.humidity - 65) / 20) * 100) : 0,
                tempRisk: data.reading.temperature > 30 ? Math.round(((data.reading.temperature - 30) / 12) * 100) : 0,
                riskScore: 0,
                status: 'normal',
                isSimulated: false,
              };

              // Recompute composite risk
              newR.riskScore = settings.module === 'grains'
                ? Math.round(0.4 * newR.gasScore + 0.35 * newR.acousticScore + 0.15 * newR.humidityRisk + 0.1 * newR.tempRisk)
                : Math.round(0.7 * newR.gasScore + 0.15 * newR.humidityRisk + 0.15 * newR.tempRisk);

              if (settings.module === 'grains' && newR.gasScore >= 60 && newR.acousticScore >= 60) {
                newR.status = 'alert';
                newR.statusReason = 'CRITICAL: Live ESP32 hardware acoustic & gas sensors cross-validated!';
              } else if (newR.gasScore >= 60 || newR.acousticScore >= 60 || newR.humidityRisk >= 60) {
                newR.status = 'early_warning';
                newR.statusReason = 'EARLY WARNING: Hardware parameter elevated above baseline.';
              }

              // Check for alert transition
              if (prevReading) {
                const newAlert = generateAlertOnTransition(prevReading.status, newR);
                if (newAlert) {
                  setAlerts(a => [newAlert, ...a]);
                }
              }

              const next = [...prev, newR];
              return next.length > 500 ? next.slice(-500) : next;
            });
          } else {
            setIsHardwareOnline(false);
            setLastSeenSecondsAgo(data?.lastSeenSecondsAgo || null);
          }
        }
      } catch (e) {
        // Dev server fallback
      }

      // If no live hardware packet was received, run the autonomous physics simulator
      if (!isLiveESP32) {
        setReadings(prev => {
          const prevReading = prev[prev.length - 1];
          const target = SCENARIO_PRESETS[activeScenario];
          const newReading = stepSimulatedReading(prevReading, target, settings, prev.slice(-10), 0.12);

          // Check for alert transition
          const newAlert = generateAlertOnTransition(prevReading.status, newReading);
          if (newAlert) {
            setAlerts(a => [newAlert, ...a]);
          }

          const next = [...prev, newReading];
          return next.length > 500 ? next.slice(-500) : next;
        });
      }
    }, settings.refreshSeconds * 1000);

    return () => clearInterval(interval);
  }, [activeScenario, settings]);

  // Module Toggle Handler
  const handleToggleModule = (mod: StorageModule) => {
    setSettings(prev => ({ ...prev, module: mod }));
  };

  // Language Change
  const handleChangeLanguage = (lang: SupportedLanguage) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  // Alerts Ack
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const handleAcknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  // Hardware Test Reading Dispatch
  const handleSendTestReading = async () => {
    try {
      await fetch('/api/readings/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: settings.deviceId,
          temperature: 32.1,
          humidity: 71.4,
          distanceCm: 42,
          gasRaw: 880,
          gasIndex: 1.48,
          acousticRaw: 380,
          insectEventsPerMin: 28,
          module: settings.module,
        }),
      });
      setIsHardwareOnline(true);
      setLastSeenSecondsAgo(1);
    } catch (e) {}
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-teal-500 selection:text-white pb-20 md:pb-6">
      
      {/* Printable Report (Hidden in web, visible in browser Print) */}
      <PrintableReport
        currentReading={currentReading}
        readings={readings}
        alerts={alerts}
        settings={settings}
      />

      {/* Top Bar (Universal Contract: Brand | Navigation / Toggles | Primary CTA) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Zone 1: Single Brand Wordmark & Sensor Core Icon */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-900/20">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                {t.brandName}
              </span>
              <span className="hidden lg:inline text-[11px] text-slate-400 dark:text-slate-500 ml-2 font-mono">
                · IoT Sensor Fusion
              </span>
            </div>
          </div>

          {/* Zone 2: Module Switch & Telemetry Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Storage Module Segmented Switch */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => handleToggleModule('grains')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  settings.module === 'grains'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.moduleGrains}
              </button>
              <button
                onClick={() => handleToggleModule('onion_potato')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  settings.module === 'onion_potato'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.moduleOnionPotato}
              </button>
            </div>

            {/* Live vs Simulated Badge (Honest labeling) */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border shrink-0">
              {currentReading.isSimulated ? (
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {t.simulatedBadge}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.liveBadge}
                </span>
              )}
            </div>

            {/* Language Switcher (EN / HI / MR) */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold">
              <button
                onClick={() => handleChangeLanguage('en')}
                className={`px-2 py-1 rounded-lg transition ${
                  settings.language === 'en' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-400'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => handleChangeLanguage('hi')}
                className={`px-2 py-1 rounded-lg transition ${
                  settings.language === 'hi' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-400'
                }`}
                title="हिन्दी (Hindi)"
              >
                HI
              </button>
              <button
                onClick={() => handleChangeLanguage('mr')}
                className={`px-2 py-1 rounded-lg transition ${
                  settings.language === 'mr' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-400'
                }`}
                title="मराठी (Marathi)"
              >
                MR
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Zone 3: PWA Install + Pitch Mode CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />

            <button
              onClick={() => setIsPitchOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-teal-900/20 transition whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.tabPitchMode}</span>
            </button>
          </div>

        </div>

        {/* Desktop Secondary Navigation Bar */}
        <div className="hidden md:block border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <nav className="flex items-center gap-1 py-1.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{t.tabDashboard}</span>
              </button>

              <button
                onClick={() => setActiveTab('insights')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'insights'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{t.tabInsights}</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>{t.tabHistory}</span>
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 relative ${
                  activeTab === 'alerts'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{t.tabAlerts}</span>
                {unacknowledgedCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unacknowledgedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('how-it-works')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'how-it-works'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t.tabHowItWorks}</span>
              </button>

              <button
                onClick={() => setActiveTab('esp32')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'esp32'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>ESP32 Kit</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>{t.tabSettings}</span>
              </button>
            </nav>

            {/* Quick Telemetry Status Pill */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>Risk: <strong className={currentReading.riskScore >= 60 ? 'text-red-500' : currentReading.riskScore >= 40 ? 'text-amber-500' : 'text-emerald-500'}>{currentReading.riskScore}/100</strong></span>
              <span>·</span>
              <span>Fill: <strong>{currentReading.grainLevelPct}%</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <LiveDashboardView
            currentReading={currentReading}
            previousReading={previousReading}
            readings={readings}
            settings={settings}
            activeScenario={activeScenario}
            onSelectScenario={setActiveScenario}
            onOpenPitch={() => setIsPitchOpen(true)}
            onOpenESP32={() => setActiveTab('esp32')}
            t={t}
          />
        )}

        {activeTab === 'insights' && (
          <AIInsightsView
            readings={readings}
            currentReading={currentReading}
            activeAlerts={alerts}
            settings={settings}
            t={t}
          />
        )}

        {activeTab === 'history' && (
          <HistoryExportView
            readings={readings}
            alerts={alerts}
            settings={settings}
            t={t}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsCenterView
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onAcknowledgeAll={handleAcknowledgeAll}
            t={t}
          />
        )}

        {activeTab === 'how-it-works' && (
          <HowItWorksView t={t} />
        )}

        {activeTab === 'esp32' && (
          <ESP32IntegrationView
            deviceId={settings.deviceId}
            isOnline={isHardwareOnline}
            lastSeenSecondsAgo={lastSeenSecondsAgo}
            onSendTestReading={handleSendTestReading}
            t={t}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={setSettings}
            t={t}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb ergonomic zone) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center h-16 pb-safe">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center h-full transition ${
            activeTab === 'dashboard' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t.tabDashboard.split(' ')[0]}</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center justify-center h-full transition ${
            activeTab === 'insights' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Brain className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t.tabInsights.split(' ')[0]}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center h-full transition ${
            activeTab === 'history' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t.tabHistory.split(' ')[0]}</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center justify-center h-full transition relative ${
            activeTab === 'alerts' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t.tabAlerts.split(' ')[0]}</span>
          {unacknowledgedCount > 0 && (
            <span className="absolute top-2 right-4 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unacknowledgedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center h-full transition ${
            activeTab === 'settings' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t.tabSettings}</span>
        </button>
      </div>

      {/* Scripted 60-Second Pitch Mode Modal */}
      <PitchModeModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
        onApplyScenario={setActiveScenario}
        onExportCSV={() => exportSensorReadingsCSV(readings)}
      />

    </div>
  );
}
