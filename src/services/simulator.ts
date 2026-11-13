import { SensorReading, StorageSettings, StorageModule, ScenarioType } from '../types';
import { calculateReadingScores } from './spoilageLogic';

export const DEFAULT_SETTINGS: StorageSettings = {
  deviceId: 'ESP32-GRAIN-01',
  module: 'grains',
  binHeightCm: 250,
  gasThreshold: 1.4,        // Relative to baseline 1.0
  gasBaseline: 1.0,
  acousticThreshold: 35,    // events/min
  humidityThreshold: 65,    // % RH
  tempThreshold: 30,        // °C
  refreshSeconds: 3,
  language: 'en',
  soundEnabled: true,
  notificationsEnabled: false,
  quantityQuintal: 500,     // 50 metric tons
  pricePerQuintal: 2450,    // ₹2,450 per quintal (wheat MSP benchmark)
};

/**
 * Generate 7 days of realistic 10-minute sensor telemetry
 * (1008 readings total)
 * Features:
 * - Natural 24h sinusoidal temperature cycle (peaks at 14:00, coolest at 04:00)
 * - Anti-correlated humidity cycle + slow regional weather drift
 * - Day 2.5 - 3.5: Fungal VOC spike episode (humidity rises to 78%, gas index climbs to 1.7)
 * - Day 5.0 - 6.0: Insect infestation episode (acoustic chewing surges to 55-70 events/min)
 */
export function generate7DaySeedData(settings: StorageSettings = DEFAULT_SETTINGS): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = Date.now();
  const stepMs = 10 * 60 * 1000; // 10 minutes
  const totalSteps = 7 * 24 * 6;  // 1008 steps
  const startTime = now - totalSteps * stepMs;

  for (let i = 0; i < totalSteps; i++) {
    const ts = startTime + i * stepMs;
    const date = new Date(ts);
    const hourOfDay = date.getHours() + date.getMinutes() / 60;
    const dayProgress = i / totalSteps; // 0 to 1 over 7 days

    // Diurnal temperature cycle: peak around 14:00, trough around 04:00
    // Ambient oscillates between 21°C and 31°C; bulk grain inside bin dampens variation
    const diurnalTemp = 24.5 + 4.5 * Math.sin(((hourOfDay - 8) / 24) * 2 * Math.PI);
    const noiseTemp = (Math.sin(i * 13.7) + Math.cos(i * 2.3)) * 0.4;
    let temperature = Math.round((diurnalTemp + noiseTemp) * 10) / 10;

    // Diurnal humidity cycle (often inverse of temperature) + weather trend
    const baseHumidity = 56 + 6 * Math.sin(((hourOfDay + 4) / 24) * 2 * Math.PI);
    const weatherDrift = Math.sin(dayProgress * 3 * Math.PI) * 4;
    let humidity = Math.round((baseHumidity + weatherDrift + (Math.sin(i * 7.1) * 1.2)) * 10) / 10;

    // Grain depth (HC-SR04 distance 40-50 cm, fill 80-84%)
    const distanceCm = Math.round(45 + Math.sin(i * 0.05) * 1.5);
    const grainLevelPct = Math.min(Math.max(Math.round(((settings.binHeightCm - distanceCm) / settings.binHeightCm) * 100), 10), 100);

    // Baseline gas and acoustic
    let gasIndex = 1.0 + Math.sin(i * 5.3) * 0.04;
    let insectEventsPerMin = Math.max(0, Math.round(2 + Math.sin(i * 3.1) * 2));
    let gasRaw = Math.round(620 * gasIndex);
    let acousticRaw = Math.round(180 + insectEventsPerMin * 8);

    // Episode 1 (Day 2.8 - 3.8): Humidity & Fungal VOC Spike
    if (dayProgress >= 0.38 && dayProgress <= 0.52) {
      const epCenter = 0.45;
      const epFactor = Math.max(0, 1 - Math.abs(dayProgress - epCenter) / 0.07);
      humidity += epFactor * 18; // Climbs into 74-78% range
      gasIndex += epFactor * 0.65; // Climbs to 1.65+
      gasRaw = Math.round(620 * gasIndex);
    }

    // Episode 2 (Day 5.2 - 6.2): Insect Acoustic Chewing Surge
    if (dayProgress >= 0.72 && dayProgress <= 0.88) {
      const epCenter = 0.80;
      const epFactor = Math.max(0, 1 - Math.abs(dayProgress - epCenter) / 0.08);
      insectEventsPerMin += Math.round(epFactor * 48); // Peaks around 50-55 events/min
      acousticRaw = Math.round(180 + insectEventsPerMin * 9);
      // Slight temperature rise due to insect metabolic respiration
      temperature += epFactor * 2.2;
    }

    // Calculate evaluated scores
    const calculated = calculateReadingScores({
      temperature,
      humidity,
      gasIndex: Math.round(gasIndex * 100) / 100,
      insectEventsPerMin,
      module: settings.module,
      settings,
      recentReadings: readings.slice(-6),
    });

    readings.push({
      id: `seed-${ts}`,
      ts,
      temperature,
      humidity,
      distanceCm,
      grainLevelPct,
      gasRaw,
      gasIndex: Math.round(gasIndex * 100) / 100,
      acousticRaw,
      insectEventsPerMin,
      module: settings.module,
      gasScore: calculated.gasScore,
      acousticScore: calculated.acousticScore,
      humidityRisk: calculated.humidityRisk,
      tempRisk: calculated.tempRisk,
      riskScore: calculated.riskScore,
      status: calculated.status,
      statusReason: calculated.statusReason,
      rateOfChange30m: calculated.rateOfChange30m,
      isSimulated: true,
    });
  }

  return readings;
}

/**
 * Scenario target metrics definition
 */
export interface ScenarioTargets {
  temperature: number;
  humidity: number;
  gasIndex: number;
  insectEventsPerMin: number;
  grainLevelPct: number;
}

export const SCENARIO_PRESETS: Record<ScenarioType, ScenarioTargets> = {
  normal: {
    temperature: 24.5,
    humidity: 54.0,
    gasIndex: 1.02,
    insectEventsPerMin: 2,
    grainLevelPct: 82,
  },
  humidity_rising: {
    temperature: 28.0,
    humidity: 74.5,
    gasIndex: 1.15,
    insectEventsPerMin: 4,
    grainLevelPct: 82,
  },
  fungal_spoilage: {
    temperature: 30.5,
    humidity: 76.0,
    gasIndex: 1.62,
    insectEventsPerMin: 6,
    grainLevelPct: 81,
  },
  insect_infestation: {
    temperature: 31.0,
    humidity: 61.0,
    gasIndex: 1.12,
    insectEventsPerMin: 48,
    grainLevelPct: 80,
  },
  confirmed_alert: {
    temperature: 33.5,
    humidity: 78.5,
    gasIndex: 1.72,
    insectEventsPerMin: 54,
    grainLevelPct: 79,
  },
};

/**
 * Smooth interpolation helper for simulator transition steps
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Generate next simulated live reading smoothly drifting towards target
 */
export function stepSimulatedReading(
  current: SensorReading,
  target: ScenarioTargets,
  settings: StorageSettings,
  recentReadings: SensorReading[],
  alpha = 0.08
): SensorReading {
  // Add small micro-jitter
  const jitterTemp = (Math.random() - 0.5) * 0.1;
  const jitterHum = (Math.random() - 0.5) * 0.2;
  const jitterGas = (Math.random() - 0.5) * 0.01;
  const jitterAcoustic = Math.round((Math.random() - 0.5) * 2);

  const newTemp = Math.round((lerp(current.temperature, target.temperature, alpha) + jitterTemp) * 10) / 10;
  const newHum = Math.round((lerp(current.humidity, target.humidity, alpha) + jitterHum) * 10) / 10;
  const newGasIndex = Math.round((lerp(current.gasIndex, target.gasIndex, alpha) + jitterGas) * 100) / 100;
  const newInsectEvents = Math.max(0, Math.round(lerp(current.insectEventsPerMin, target.insectEventsPerMin, alpha) + jitterAcoustic));
  const newGrainPct = Math.round(lerp(current.grainLevelPct, target.grainLevelPct, alpha));

  const gasRaw = Math.round(600 * newGasIndex);
  const acousticRaw = Math.round(200 + newInsectEvents * 10);
  const distanceCm = Math.round(settings.binHeightCm * (1 - newGrainPct / 100));

  const calculated = calculateReadingScores({
    temperature: newTemp,
    humidity: newHum,
    gasIndex: newGasIndex,
    insectEventsPerMin: newInsectEvents,
    module: settings.module,
    settings,
    recentReadings,
  });

  return {
    id: `sim-${Date.now()}`,
    ts: Date.now(),
    temperature: newTemp,
    humidity: newHum,
    distanceCm,
    grainLevelPct: newGrainPct,
    gasRaw,
    gasIndex: newGasIndex,
    acousticRaw,
    insectEventsPerMin: newInsectEvents,
    module: settings.module,
    gasScore: calculated.gasScore,
    acousticScore: calculated.acousticScore,
    humidityRisk: calculated.humidityRisk,
    tempRisk: calculated.tempRisk,
    riskScore: calculated.riskScore,
    status: calculated.status,
    statusReason: calculated.statusReason,
    rateOfChange30m: calculated.rateOfChange30m,
    isSimulated: true,
  };
}
