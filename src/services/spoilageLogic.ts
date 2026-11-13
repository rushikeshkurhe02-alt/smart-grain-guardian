import { SensorReading, StorageSettings, AlertSeverity, StorageModule, AlertItem, SpoilageType } from '../types';

export function clamp(val: number, min = 0, max = 100): number {
  return Math.min(Math.max(val, min), max);
}

export interface CalculateScoresInput {
  temperature: number;
  humidity: number;
  gasIndex: number;
  insectEventsPerMin: number;
  module: StorageModule;
  settings: StorageSettings;
  recentReadings?: SensorReading[];
}

export interface CalculatedScores {
  gasScore: number;
  acousticScore: number;
  humidityRisk: number;
  tempRisk: number;
  riskScore: number;
  status: AlertSeverity;
  statusReason: string;
  rateOfChange30m: number;
}

export function calculateReadingScores(input: CalculateScoresInput): CalculatedScores {
  const { temperature, humidity, gasIndex, insectEventsPerMin, module, settings, recentReadings = [] } = input;

  // 1. Gas Score: clamp((gasIndex - baseline) / (gasThreshold - baseline)) * 100
  const baseline = settings.gasBaseline || 1.0;
  const gasThreshold = Math.max(settings.gasThreshold, baseline + 0.05);
  const gasRatio = (gasIndex - baseline) / (gasThreshold - baseline);
  const gasScore = clamp(gasRatio * 100);

  // 2. Acoustic Score: insectEventsPerMin scaled to acoustic threshold
  const acousticThreshold = Math.max(settings.acousticThreshold || 35, 1);
  const acousticScore = clamp((insectEventsPerMin / acousticThreshold) * 100);

  // 3. Humidity Risk: risk rises above 65% (settings.humidityThreshold)
  const humThreshold = settings.humidityThreshold || 65;
  const humidityRisk = humidity > humThreshold
    ? clamp(((humidity - humThreshold) / 20) * 100)
    : 0;

  // 4. Temperature Risk: risk rises above 30°C (settings.tempThreshold)
  const tempThreshold = settings.tempThreshold || 30;
  const tempRisk = temperature > tempThreshold
    ? clamp(((temperature - tempThreshold) / 12) * 100)
    : 0;

  // 5. Composite Risk Score
  let riskScore = 0;
  if (module === 'grains') {
    riskScore = clamp(
      0.40 * gasScore +
      0.35 * acousticScore +
      0.15 * humidityRisk +
      0.10 * tempRisk
    );
  } else {
    // Onion + Potato module (gas-heavy biochemical spoilage / ethylene / rot)
    riskScore = clamp(
      0.70 * gasScore +
      0.15 * humidityRisk +
      0.15 * tempRisk
    );
  }

  // 6. Rate of change over last 30 minutes
  let rateOfChange30m = 0;
  if (recentReadings.length > 0) {
    const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;
    const oldReading = recentReadings.find(r => r.ts <= thirtyMinsAgo) || recentReadings[0];
    if (oldReading) {
      const deltaRisk = riskScore - oldReading.riskScore;
      const deltaTimeHours = Math.max((Date.now() - oldReading.ts) / (3600 * 1000), 0.1);
      rateOfChange30m = deltaRisk / deltaTimeHours; // points per hour
    }
  }

  // 7. Status evaluation
  let status: AlertSeverity = 'normal';
  let statusReason = 'Storage parameters nominal. No active spoilage signals detected.';

  const isRateOfChangeHigh = rateOfChange30m >= 15; // >15 risk points per hour rise

  // Confirmed Alert checks:
  if (module === 'grains') {
    // Both sensors must agree for grains: acousticScore >= 60 AND gasScore >= 60
    if (gasScore >= 60 && acousticScore >= 60) {
      status = 'alert';
      statusReason = 'CRITICAL ALERT: Acoustic chewing activity and VOC gas emissions have cross-validated! Active insect & fungal spoilage.';
    }
  } else {
    // Onion & Potato: gasScore >= 60 for 3 consecutive readings (or current + last 2)
    const consecutiveGasSpikes = recentReadings.slice(-2).every(r => r.gasScore >= 60);
    if (gasScore >= 60 && (consecutiveGasSpikes || recentReadings.length < 2)) {
      status = 'alert';
      statusReason = 'CRITICAL ALERT: Sustained elevated ethylene/VOC rotten gases detected across consecutive cycles. Soft rot or sprouting underway.';
    }
  }

  // If not confirmed alert, check for early warning
  if (status !== 'alert') {
    const singleSignalHigh =
      gasScore >= 60 ||
      (module === 'grains' && acousticScore >= 60) ||
      humidityRisk >= 60 ||
      tempRisk >= 60;

    if (singleSignalHigh || isRateOfChangeHigh || riskScore >= 40) {
      status = 'early_warning';
      if (gasScore >= 60 && module === 'grains') {
        statusReason = 'EARLY WARNING: Elevated VOC gas (musty odor). Acoustic signal still quiet; awaiting cross-validation.';
      } else if (acousticScore >= 60 && module === 'grains') {
        statusReason = 'EARLY WARNING: Acoustic insect activity detected. Gas sensor still nominal; monitoring closely.';
      } else if (humidityRisk >= 60) {
        statusReason = `EARLY WARNING: High humidity (${humidity.toFixed(1)}%) creates ideal incubation condition for Aspergillus/Penicillium.`;
      } else if (isRateOfChangeHigh) {
        statusReason = `EARLY WARNING: Rapid rate-of-change detected (+${rateOfChange30m.toFixed(1)} pts/hr). Micro-climate shifting quickly.`;
      } else {
        statusReason = 'EARLY WARNING: Storage risk metrics elevated above standard safety threshold.';
      }
    }
  }

  return {
    gasScore: Math.round(gasScore),
    acousticScore: Math.round(acousticScore),
    humidityRisk: Math.round(humidityRisk),
    tempRisk: Math.round(tempRisk),
    riskScore: Math.round(riskScore),
    status,
    statusReason,
    rateOfChange30m: Math.round(rateOfChange30m * 10) / 10,
  };
}

export function generateAlertOnTransition(
  prevStatus: AlertSeverity,
  newReading: SensorReading
): AlertItem | null {
  // Only trigger alerts on escalation to early_warning or alert
  if (prevStatus === newReading.status) {
    return null;
  }

  if (newReading.status === 'normal') {
    return null;
  }

  let type: SpoilageType = 'fungus';
  let message = newReading.statusReason || 'Storage condition changed.';
  let recommendedAction = 'Check ventilation and inspect grain surface.';

  if (newReading.status === 'alert') {
    if (newReading.module === 'grains') {
      type = 'insect';
      message = 'Dual-sensor agreement: Insect chewing activity confirmed by elevated fungal VOCs.';
      recommendedAction = 'IMMEDIATE ACTION: Activate aeration fans, inspect grain temperature core, prepare targeted fumigation or dispatch batch.';
    } else {
      type = 'rot';
      message = 'Consecutive ethylene/VOC surges: Bacterial soft rot spreading in onion/potato batch.';
      recommendedAction = 'IMMEDIATE ACTION: Sort and physically isolate spoiled bags/crates. Increase dry air circulation immediately.';
    }
  } else if (newReading.status === 'early_warning') {
    if (newReading.acousticScore >= 60) {
      type = 'insect';
      message = 'Early insect acoustic chewing pulses registered in grain bulk.';
      recommendedAction = 'Perform acoustic probe inspection at bin quadrant 2 and verify grain moisture levels.';
    } else if (newReading.gasScore >= 60) {
      type = 'fungus';
      message = 'Volatile organic compound (VOC) spike detected: incipient fungal growth.';
      recommendedAction = 'Engage low-speed aeration fans during dry ambient window (typically 10 AM to 4 PM).';
    } else if (newReading.humidityRisk >= 60) {
      type = 'humidity';
      message = `Storage humidity at ${newReading.humidity}% exceeds safe maximum for bulk storage.`;
      recommendedAction = 'Seal external vents if outdoor air is rain-soaked, or activate exhaust fans if outdoor air is dry.';
    } else {
      type = 'temperature';
      message = `Internal bin temperature (${newReading.temperature}°C) indicates thermal hot-spot buildup.`;
      recommendedAction = 'Cycle bottom-to-top aeration cooling and check for moisture migration.';
    }
  }

  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    ts: newReading.ts,
    severity: newReading.status,
    type,
    message,
    recommendedAction,
    acknowledged: false,
    module: newReading.module,
    riskScore: newReading.riskScore,
  };
}
