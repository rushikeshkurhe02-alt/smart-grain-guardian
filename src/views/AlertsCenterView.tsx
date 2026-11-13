import React, { useState } from 'react';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  Check,
  CheckCheck,
  Filter,
  Bug,
  Wind,
  Droplets,
  Thermometer,
} from 'lucide-react';
import { AlertItem, AlertSeverity } from '../types';
import { TranslationStrings } from '../services/i18n';

interface AlertsCenterViewProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onAcknowledgeAll: () => void;
  t: TranslationStrings;
}

export const AlertsCenterView: React.FC<AlertsCenterViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onAcknowledgeAll,
  t,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'alert' | 'early_warning'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unack' | 'ack'>('all');

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterStatus === 'unack' && a.acknowledged) return false;
    if (filterStatus === 'ack' && !a.acknowledged) return false;
    return true;
  });

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  const getTypeIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'insect':
        return <Bug className="w-4 h-4 text-red-500" />;
      case 'rot':
      case 'fungus':
        return <Wind className="w-4 h-4 text-orange-500" />;
      case 'humidity':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'temperature':
        return <Thermometer className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">

      {/* Header and Filter Controls */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {t.alertsCenterTitle}
              {unacknowledgedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                  {unacknowledgedCount} Unread
                </span>
              )}
            </h3>
            <span className="text-xs text-slate-500">
              Cross-validated incidents and transition triggers
            </span>
          </div>
        </div>

        {/* Severity & Ack Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterSeverity === 'all' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterSeverity('alert')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterSeverity === 'alert' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setFilterSeverity('early_warning')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterSeverity === 'early_warning' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Warnings
            </button>
          </div>

          {unacknowledgedCount > 0 && (
            <button
              onClick={onAcknowledgeAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Ack All</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {t.noActiveAlerts}
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                alert.severity === 'alert'
                  ? 'border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20'
                  : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
              } ${alert.acknowledged ? 'opacity-70' : 'shadow-xs'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs mt-0.5">
                    {getTypeIcon(alert.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        alert.severity === 'alert'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {alert.severity.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(alert.ts).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        · Risk: {alert.riskScore}/100
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                      {alert.message}
                    </h4>

                    {/* Plain Language Action Checklist */}
                    <div className="mt-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Recommended Action:
                      </span>{' '}
                      <span className="text-slate-600 dark:text-slate-300">
                        {alert.recommendedAction}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acknowledge Button */}
                <div className="sm:self-center shrink-0">
                  {alert.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium font-mono">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      {t.acknowledgedStatus}
                    </span>
                  ) : (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.btnAcknowledge}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
