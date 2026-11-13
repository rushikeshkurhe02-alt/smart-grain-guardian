import React from 'react';
import { SensorReading, AlertItem, StorageSettings } from '../types';

interface PrintableReportProps {
  currentReading: SensorReading;
  readings: SensorReading[];
  alerts: AlertItem[];
  settings: StorageSettings;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  currentReading,
  readings,
  alerts,
  settings,
}) => {
  const isGrains = settings.module === 'grains';
  const recentSlice = readings.slice(-144); // 24h
  const avgTemp = (recentSlice.reduce((a, b) => a + b.temperature, 0) / (recentSlice.length || 1)).toFixed(1);
  const avgHum = (recentSlice.reduce((a, b) => a + b.humidity, 0) / (recentSlice.length || 1)).toFixed(1);

  return (
    <div className="hidden print:block p-8 bg-white text-black font-sans leading-relaxed">
      {/* Official Header */}
      <div className="border-b-2 border-black pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SMART GRAIN GUARDIAN</h1>
          <p className="text-xs uppercase tracking-widest text-gray-600">
            Post-Harvest IoT Micro-Climate Audit & Spoilage Report
          </p>
        </div>
        <div className="text-right text-xs font-mono">
          <p>Date: {new Date().toLocaleDateString()}</p>
          <p>Time: {new Date().toLocaleTimeString()}</p>
          <p>Device ID: {settings.deviceId}</p>
        </div>
      </div>

      {/* Storage Bin Details */}
      <div className="grid grid-cols-4 gap-4 py-4 border-b border-gray-300 text-xs">
        <div>
          <span className="text-gray-500 block">Commodity:</span>
          <strong className="text-sm">{isGrains ? 'Wheat & Cereals' : 'Onion & Potato'}</strong>
        </div>
        <div>
          <span className="text-gray-500 block">Stored Quantity:</span>
          <strong className="text-sm">{settings.quantityQuintal} Quintals</strong>
        </div>
        <div>
          <span className="text-gray-500 block">Bin Fill Level:</span>
          <strong className="text-sm">{currentReading.grainLevelPct}% ({currentReading.distanceCm}cm headspace)</strong>
        </div>
        <div>
          <span className="text-gray-500 block">System State:</span>
          <strong className="text-sm uppercase font-mono">{currentReading.status.replace('_', ' ')}</strong>
        </div>
      </div>

      {/* Current Telemetry Readings */}
      <div className="py-4">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
          Current Sensor Telemetry
        </h2>
        <table className="w-full text-xs text-left border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-r border-gray-300">Core Temp</th>
              <th className="p-2 border-r border-gray-300">Relative Humidity</th>
              <th className="p-2 border-r border-gray-300">Gas Index (MQ-135)</th>
              {isGrains && <th className="p-2 border-r border-gray-300">Insect Acoustics</th>}
              <th className="p-2">Composite Risk Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-r border-gray-300 font-mono">{currentReading.temperature.toFixed(1)}°C (Avg: {avgTemp}°C)</td>
              <td className="p-2 border-r border-gray-300 font-mono">{currentReading.humidity.toFixed(1)}% (Avg: {avgHum}%)</td>
              <td className="p-2 border-r border-gray-300 font-mono">{currentReading.gasIndex.toFixed(2)}x (Score: {currentReading.gasScore}/100)</td>
              {isGrains && <td className="p-2 border-r border-gray-300 font-mono">{currentReading.insectEventsPerMin} events/min</td>}
              <td className="p-2 font-mono font-bold text-sm">{currentReading.riskScore} / 100</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signal Fusion Statement */}
      <div className="p-3 my-2 border border-gray-400 bg-gray-50 text-xs">
        <strong>Acoustic & Gas Cross-Validation Status: </strong>
        {isGrains ? (
          currentReading.gasScore >= 60 && currentReading.acousticScore >= 60
            ? 'CRITICAL ALERT: Both acoustic chewing and VOC gas signals cross-validated! Immediate fumigation / aeration required.'
            : currentReading.gasScore >= 60 || currentReading.acousticScore >= 60
            ? 'EARLY WARNING: Single sensor elevated. System is actively cross-validating to avoid false alarms.'
            : 'NORMAL: Both acoustic and gas sensors report healthy, stable grain micro-climate.'
        ) : (
          currentReading.gasScore >= 60
            ? 'CRITICAL ALERT: Elevated volatile ethylene / decay gas detected in onion/potato batch.'
            : 'NORMAL: No rotten gas emissions detected.'
        )}
      </div>

      {/* Recent Alerts Log */}
      <div className="py-3">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
          Recent Incident & Safety Log
        </h2>
        {alerts.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No critical incidents logged during this audit cycle.</p>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {alerts.slice(-4).map(a => (
              <li key={a.id} className="p-2 border border-gray-200">
                <span className="font-mono text-gray-500">[{new Date(a.ts).toLocaleTimeString()}]</span>{' '}
                <strong className="uppercase">{a.severity}: </strong>
                <span>{a.message}</span> — <em>Action: {a.recommendedAction}</em>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sign-off Box */}
      <div className="mt-8 pt-6 border-t-2 border-black grid grid-cols-2 gap-8 text-xs">
        <div>
          <p className="font-bold">Warehouse Inspector / Agronomist Signature:</p>
          <div className="mt-8 border-b border-black w-48" />
          <p className="text-gray-500 text-[10px] mt-1">Certified Storage Quality Officer</p>
        </div>
        <div>
          <p className="font-bold">Farmer / Facility Supervisor Acknowledgment:</p>
          <div className="mt-8 border-b border-black w-48" />
          <p className="text-gray-500 text-[10px] mt-1">Batch Custodian</p>
        </div>
      </div>
    </div>
  );
};
