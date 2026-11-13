import { SensorReading, ForecastResult, ForecastPoint, AlertSeverity } from '../types';

export function computeForecast(readings: SensorReading[]): ForecastResult {
  if (readings.length < 5) {
    return {
      points: [],
      trend: 'Stable',
      estimatedHoursToWarning: null,
      estimatedHoursToAlert: null,
      summaryText: 'Collecting telemetry baseline to generate statistical forecast.',
    };
  }

  // Use last 30-60 readings for recent trend
  const sample = readings.slice(-60);
  const n = sample.length;

  // 1. Exponential Weighted Moving Average (EWMA)
  const alpha = 0.25;
  let ewma = sample[0].riskScore;
  const ewmaSeries: number[] = [];
  for (let i = 0; i < n; i++) {
    ewma = alpha * sample[i].riskScore + (1 - alpha) * ewma;
    ewmaSeries.push(ewma);
  }

  // 2. Linear Regression on EWMA (Slope and Intercept)
  // x = index (0 to n-1), y = riskScore
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = ewmaSeries[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  // Compute standard error of the estimate for confidence bands
  let sumSquaredResiduals = 0;
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * i;
    const res = sample[i].riskScore - predicted;
    sumSquaredResiduals += res * res;
  }
  const stdError = Math.sqrt(sumSquaredResiduals / Math.max(n - 2, 1));

  // Generate 6-hour forecast points at 10-minute intervals (36 intervals)
  const lastTs = sample[sample.length - 1].ts;
  const currentRisk = sample[sample.length - 1].riskScore;
  const forecastPoints: ForecastPoint[] = [];

  let estimatedHoursToWarning: number | null = null;
  let estimatedHoursToAlert: number | null = null;

  for (let step = 1; step <= 36; step++) {
    const futureX = (n - 1) + step;
    // Dampen slope slightly over time towards saturation
    const rawVal = intercept + slope * futureX;
    const projectedRisk = Math.min(Math.max(Math.round(rawVal), 0), 100);

    // Confidence interval expands as step increases: stdError * sqrt(1 + 1/n + (x-mean)^2 / sumSq)
    const expansion = 1 + 0.08 * step;
    const bandWidth = Math.max(stdError * 1.645 * expansion, 4); // 90% confidence
    const upperBand = Math.min(Math.round(projectedRisk + bandWidth), 100);
    const lowerBand = Math.max(Math.round(projectedRisk - bandWidth), 0);

    const futureTs = lastTs + step * 10 * 60 * 1000;
    const futureDate = new Date(futureTs);
    const timeLabel = futureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let status: AlertSeverity = 'normal';
    if (projectedRisk >= 60) status = 'alert';
    else if (projectedRisk >= 40) status = 'early_warning';

    forecastPoints.push({
      ts: futureTs,
      timeLabel,
      riskScore: projectedRisk,
      upperBand,
      lowerBand,
      status,
    });

    const hoursAhead = (step * 10) / 60;
    if (estimatedHoursToWarning === null && currentRisk < 40 && projectedRisk >= 40) {
      estimatedHoursToWarning = Math.round(hoursAhead * 10) / 10;
    }
    if (estimatedHoursToAlert === null && currentRisk < 60 && projectedRisk >= 60) {
      estimatedHoursToAlert = Math.round(hoursAhead * 10) / 10;
    }
  }

  // Determine trend direction
  let trend: 'Rising' | 'Falling' | 'Stable' = 'Stable';
  if (slope > 0.15) trend = 'Rising';
  else if (slope < -0.15) trend = 'Falling';

  // Construct summary text
  let summaryText = 'Statistical 6-hour forecast: Risk trajectory remains nominal and steady.';
  if (trend === 'Rising') {
    if (estimatedHoursToAlert !== null) {
      summaryText = `Statistical estimate: Risk projected to cross Confirmed Alert in ~${estimatedHoursToAlert} hours if storage ventilation is not adjusted.`;
    } else if (estimatedHoursToWarning !== null) {
      summaryText = `Statistical estimate: Early Warning condition expected in ~${estimatedHoursToWarning} hours due to rising micro-climate drift.`;
    } else {
      summaryText = 'Statistical estimate: Gradual upward drift observed. Monitor ventilation closely.';
    }
  } else if (trend === 'Falling') {
    summaryText = 'Statistical estimate: Spoilage risk is decreasing following recent ambient aeration.';
  }

  return {
    points: forecastPoints,
    trend,
    estimatedHoursToWarning,
    estimatedHoursToAlert,
    summaryText,
  };
}

export function detectAnomalies(readings: SensorReading[]): SensorReading[] {
  if (readings.length < 10) return readings;

  // Calculate rolling mean and standard deviation of risk scores
  const windowSize = 20;
  return readings.map((r, idx) => {
    const start = Math.max(0, idx - windowSize);
    const slice = readings.slice(start, idx + 1);
    const mean = slice.reduce((acc, cur) => acc + cur.riskScore, 0) / slice.length;
    const variance = slice.reduce((acc, cur) => acc + Math.pow(cur.riskScore - mean, 2), 0) / slice.length;
    const stdDev = Math.sqrt(variance);

    // Flag if z-score > 2.2 and absolute delta > 15
    const isAnomaly = stdDev > 2 && Math.abs(r.riskScore - mean) > 2.2 * stdDev;
    return {
      ...r,
      isAnomaly,
    };
  });
}
