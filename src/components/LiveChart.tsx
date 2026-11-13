import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SensorReading, StorageSettings } from '../types';

interface LiveChartProps {
  readings: SensorReading[];
  settings: StorageSettings;
}

export const LiveChart: React.FC<LiveChartProps> = ({ readings, settings }) => {
  const isGrains = settings.module === 'grains';
  const [visibleMetrics, setVisibleMetrics] = useState({
    riskScore: true,
    gasScore: true,
    acousticScore: isGrains,
    humidity: true,
    temperature: false,
  });

  // Prepare chart data (slice last 30 readings for crisp real-time visualization)
  const chartData = readings.slice(-30).map(r => ({
    time: new Date(r.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    riskScore: r.riskScore,
    gasScore: r.gasScore,
    acousticScore: r.acousticScore,
    humidity: r.humidity,
    temperature: r.temperature,
    gasIndex: r.gasIndex,
    insectEvents: r.insectEventsPerMin,
  }));

  const toggleMetric = (key: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Live Micro-Climate Telemetry (Last 30 Cycles)
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            Safety threshold reference lines at 40 (Warning) & 60 (Alert)
          </span>
        </div>

        {/* Metric Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => toggleMetric('riskScore')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              visibleMetrics.riskScore
                ? 'bg-red-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Risk Score
          </button>
          <button
            onClick={() => toggleMetric('gasScore')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              visibleMetrics.gasScore
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Gas (MQ-135)
          </button>
          {isGrains && (
            <button
              onClick={() => toggleMetric('acousticScore')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                visibleMetrics.acousticScore
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Acoustic
            </button>
          )}
          <button
            onClick={() => toggleMetric('humidity')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              visibleMetrics.humidity
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Humidity %
          </button>
          <button
            onClick={() => toggleMetric('temperature')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              visibleMetrics.temperature
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Temp °C
          </button>
        </div>
      </div>

      <div className="w-full h-64 sm:h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              fontFamily="monospace"
            />
            <YAxis
              domain={[0, 100]}
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              fontFamily="monospace"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#F8FAFC',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

            {/* Threshold References */}
            <ReferenceLine y={40} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Warning (40)', fill: '#F59E0B', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={60} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Critical (60)', fill: '#EF4444', fontSize: 10, position: 'right' }} />

            {visibleMetrics.riskScore && (
              <Line
                type="monotone"
                dataKey="riskScore"
                name="Risk Score (0-100)"
                stroke="#DC2626"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {visibleMetrics.gasScore && (
              <Line
                type="monotone"
                dataKey="gasScore"
                name="Gas Score"
                stroke="#F97316"
                strokeWidth={1.8}
                dot={false}
              />
            )}
            {visibleMetrics.acousticScore && isGrains && (
              <Line
                type="monotone"
                dataKey="acousticScore"
                name="Acoustic Score"
                stroke="#0D9488"
                strokeWidth={1.8}
                dot={false}
              />
            )}
            {visibleMetrics.humidity && (
              <Line
                type="monotone"
                dataKey="humidity"
                name="Humidity %"
                stroke="#3B82F6"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
              />
            )}
            {visibleMetrics.temperature && (
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temp °C"
                stroke="#EAB308"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
