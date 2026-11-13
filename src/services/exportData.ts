import { SensorReading, AlertItem } from '../types';

export function exportSensorReadingsCSV(readings: SensorReading[], filename = 'grain_guardian_telemetry.csv') {
  if (!readings || readings.length === 0) return;

  const headers = [
    'Timestamp (Epoch ms)',
    'ISO Time',
    'Temperature (C)',
    'Humidity (%)',
    'Grain Level (%)',
    'Distance (cm)',
    'Gas Raw (0-4095)',
    'Gas Index (vs Baseline)',
    'Gas Score (0-100)',
    'Acoustic Raw (0-4095)',
    'Insect Events / min',
    'Acoustic Score (0-100)',
    'Composite Risk Score (0-100)',
    'Status',
    'Module',
    'Is Simulated',
  ];

  const rows = readings.map(r => [
    r.ts,
    new Date(r.ts).toISOString(),
    r.temperature,
    r.humidity,
    r.grainLevelPct,
    r.distanceCm,
    r.gasRaw,
    r.gasIndex,
    r.gasScore,
    r.acousticRaw,
    r.insectEventsPerMin,
    r.acousticScore,
    r.riskScore,
    r.status,
    r.module,
    r.isSimulated ? 'YES' : 'NO',
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAlertsCSV(alerts: AlertItem[], filename = 'grain_guardian_alerts.csv') {
  if (!alerts || alerts.length === 0) return;

  const headers = [
    'Alert ID',
    'Timestamp (Epoch ms)',
    'ISO Time',
    'Severity',
    'Type',
    'Risk Score',
    'Message',
    'Recommended Action',
    'Acknowledged',
    'Module',
  ];

  const rows = alerts.map(a => [
    a.id,
    a.ts,
    new Date(a.ts).toISOString(),
    a.severity,
    a.type,
    a.riskScore,
    a.message,
    a.recommendedAction,
    a.acknowledged ? 'YES' : 'NO',
    a.module,
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
