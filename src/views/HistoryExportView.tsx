import React, { useState } from 'react';
import {
  Download,
  Printer,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { SensorReading, AlertItem, StorageSettings } from '../types';
import { TranslationStrings } from '../services/i18n';
import { exportSensorReadingsCSV, exportAlertsCSV } from '../services/exportData';

interface HistoryExportViewProps {
  readings: SensorReading[];
  alerts: AlertItem[];
  settings: StorageSettings;
  t: TranslationStrings;
}

export const HistoryExportView: React.FC<HistoryExportViewProps> = ({
  readings,
  alerts,
  settings,
  t,
}) => {
  const [rangeFilter, setRangeFilter] = useState<'24h' | '7d' | 'all'>('7d');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  // Filter readings by time range
  const now = Date.now();
  const filteredReadings = readings.filter(r => {
    if (rangeFilter === '24h') return now - r.ts <= 24 * 3600 * 1000;
    if (rangeFilter === '7d') return now - r.ts <= 7 * 24 * 3600 * 1000;
    return true;
  });

  // Downsample for the history chart if too many points
  const step = Math.max(1, Math.floor(filteredReadings.length / 100));
  const downsampledChartData = filteredReadings.filter((_, idx) => idx % step === 0).map(r => ({
    time: new Date(r.ts).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
    riskScore: r.riskScore,
    temperature: r.temperature,
    humidity: r.humidity,
    gasIndex: r.gasIndex,
    insectEvents: r.insectEventsPerMin,
  }));

  // Pagination for table (newest first)
  const sortedReadings = [...filteredReadings].reverse();
  const totalPages = Math.ceil(sortedReadings.length / rowsPerPage);
  const paginatedRows = sortedReadings.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">

      {/* Action Header: Date range + Export buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" />
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => { setRangeFilter('24h'); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                rangeFilter === '24h'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.filter24h}
            </button>
            <button
              onClick={() => { setRangeFilter('7d'); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                rangeFilter === '7d'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.filter7d}
            </button>
            <button
              onClick={() => { setRangeFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                rangeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.filterAll}
            </button>
          </div>
        </div>

        {/* Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportSensorReadingsCSV(filteredReadings)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.btnDownloadCSV}</span>
          </button>

          <button
            onClick={() => exportAlertsCSV(alerts)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.btnDownloadAlertsCSV}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.btnPrintReport}</span>
          </button>
        </div>
      </div>

      {/* Multi-Series Historical Trend Chart */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Historical Spoilage Trajectory & Sensor Trends ({filteredReadings.length} records)
        </h3>

        <div className="w-full h-72 sm:h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={downsampledChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} fontFamily="monospace" />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} fontFamily="monospace" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              <Line type="monotone" dataKey="riskScore" name="Risk Score (0-100)" stroke="#DC2626" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidity" name="Humidity %" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="temperature" name="Temp °C" stroke="#EAB308" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="gasIndex" name="Gas Index" stroke="#F97316" strokeWidth={1.5} dot={false} />
              {settings.module === 'grains' && (
                <Line type="monotone" dataKey="insectEvents" name="Acoustic Events" stroke="#0D9488" strokeWidth={1.5} dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Paginated Historical Data Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Sensor Telemetry Log
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-mono border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold text-right">Temp (°C)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Hum (%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Level (%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Gas Index</th>
                {settings.module === 'grains' && (
                  <th className="py-2.5 px-3 font-semibold text-right">Acoustic</th>
                )}
                <th className="py-2.5 px-3 font-semibold text-right">Risk</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedRows.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {new Date(row.ts).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {row.temperature.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {row.humidity.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {row.grainLevelPct}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-orange-600 dark:text-orange-400">
                    {row.gasIndex.toFixed(2)}x
                  </td>
                  {settings.module === 'grains' && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-teal-600 dark:text-teal-400">
                      {row.insectEventsPerMin}
                    </td>
                  )}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                    <span className={row.riskScore >= 60 ? 'text-red-600' : row.riskScore >= 40 ? 'text-amber-600' : 'text-emerald-600'}>
                      {row.riskScore}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      row.status === 'alert'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : row.status === 'early_warning'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {row.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, sortedReadings.length)} of {sortedReadings.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
