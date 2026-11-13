import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Volume2,
  VolumeX,
  Bell,
  RotateCcw,
  Save,
  Check,
  Building2,
  Coins,
} from 'lucide-react';
import { StorageSettings } from '../types';
import { TranslationStrings } from '../services/i18n';
import { DEFAULT_SETTINGS } from '../services/simulator';

interface SettingsViewProps {
  settings: StorageSettings;
  onSaveSettings: (newSettings: StorageSettings) => void;
  t: TranslationStrings;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  t,
}) => {
  const [formData, setFormData] = useState<StorageSettings>({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleChange = (key: keyof StorageSettings, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    onSaveSettings(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_SETTINGS, language: settings.language });
    onSaveSettings({ ...DEFAULT_SETTINGS, language: settings.language });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        handleChange('notificationsEnabled', true);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header and Save Buttons */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.settingsTitle}
            </h3>
            <span className="text-xs text-slate-500">
              Customize scientific thresholds, bin geometry, and regional economics
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.btnResetDefaults}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition"
          >
            {savedNotice ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedNotice ? 'Saved!' : t.btnSaveSettings}</span>
          </button>
        </div>
      </div>

      {/* 1. Sensor Safety Thresholds */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-600" />
          {t.thresholdsTitle}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gas Threshold */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
              <span>MQ-135 Gas Alert Threshold (Index vs baseline)</span>
              <span className="font-mono font-bold text-orange-600">{formData.gasThreshold}x</span>
            </div>
            <input
              type="range"
              min="1.1"
              max="2.5"
              step="0.05"
              value={formData.gasThreshold}
              onChange={e => handleChange('gasThreshold', parseFloat(e.target.value))}
              className="w-full accent-teal-600"
            />
            <span className="text-[10px] text-slate-400">Baseline clean air = 1.0. Critical alert triggers above this ratio.</span>
          </div>

          {/* Acoustic Threshold (Grains only) */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
              <span>Acoustic Insect Event Threshold</span>
              <span className="font-mono font-bold text-teal-600">{formData.acousticThreshold} events/min</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="1"
              value={formData.acousticThreshold}
              onChange={e => handleChange('acousticThreshold', parseInt(e.target.value))}
              className="w-full accent-teal-600"
            />
            <span className="text-[10px] text-slate-400">Chewing clicks & vibration frequency detected inside bulk.</span>
          </div>

          {/* Humidity Threshold */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
              <span>Safe Humidity Cap</span>
              <span className="font-mono font-bold text-blue-600">{formData.humidityThreshold}% RH</span>
            </div>
            <input
              type="range"
              min="50"
              max="85"
              step="1"
              value={formData.humidityThreshold}
              onChange={e => handleChange('humidityThreshold', parseInt(e.target.value))}
              className="w-full accent-teal-600"
            />
            <span className="text-[10px] text-slate-400">Standard grain equilibrium moisture threshold is 65% RH.</span>
          </div>

          {/* Temperature Threshold */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
              <span>Core Temperature Limit</span>
              <span className="font-mono font-bold text-amber-600">{formData.tempThreshold}°C</span>
            </div>
            <input
              type="range"
              min="22"
              max="42"
              step="0.5"
              value={formData.tempThreshold}
              onChange={e => handleChange('tempThreshold', parseFloat(e.target.value))}
              className="w-full accent-teal-600"
            />
            <span className="text-[10px] text-slate-400">Temperatures above 30°C accelerate insect life cycles exponentially.</span>
          </div>
        </div>
      </div>

      {/* 2. Bin Geometry & Economic Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Physical Silo Dimensions */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            Storage Bin Geometry
          </h4>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-300 font-medium block">
              Total Bin Height (cm)
            </label>
            <input
              type="number"
              value={formData.binHeightCm}
              onChange={e => handleChange('binHeightCm', Math.max(50, parseInt(e.target.value) || 250))}
              className="mt-1 w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Distance from top HC-SR04 sensor to hopper bottom.
            </span>
          </div>
        </div>

        {/* Economic Calculation Inputs */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Coins className="w-4 h-4 text-teal-600" />
            Regional Crop Economics
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-300 font-medium block">
                Quantity (Quintals)
              </label>
              <input
                type="number"
                value={formData.quantityQuintal}
                onChange={e => handleChange('quantityQuintal', Math.max(1, parseInt(e.target.value) || 100))}
                className="mt-1 w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-300 font-medium block">
                Price / Quintal (₹)
              </label>
              <input
                type="number"
                value={formData.pricePerQuintal}
                onChange={e => handleChange('pricePerQuintal', Math.max(100, parseInt(e.target.value) || 2000))}
                className="mt-1 w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Audio & Notifications Preferences */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
          Alert Tones & Browser Notifications
        </h4>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div className="flex items-center gap-2.5">
              {formData.soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{t.audioAlarmLabel}</span>
                <span className="text-[10px] text-slate-400">Plays a soft, dignified chime when both sensors confirm spoilage</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.soundEnabled}
              onChange={e => handleChange('soundEnabled', e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded"
            />
          </label>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-teal-600" />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Desktop & Mobile Web Notifications</span>
                <span className="text-[10px] text-slate-400">Receive background push notifications on state transition</span>
              </div>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
            >
              {formData.notificationsEnabled ? 'Enabled' : 'Enable in Browser'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
