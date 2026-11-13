export type StorageModule = 'grains' | 'onion_potato';
export type AlertSeverity = 'normal' | 'early_warning' | 'alert';
export type SpoilageType = 'insect' | 'fungus' | 'rot' | 'humidity' | 'temperature';

export interface SensorReading {
  id: string;
  ts: number;                  // Epoch ms
  temperature: number;         // °C (DHT22)
  humidity: number;            // % RH (DHT22)
  distanceCm: number;          // Distance from sensor to grain surface (HC-SR04)
  grainLevelPct: number;       // Level fill percentage (0-100%)
  gasRaw: number;              // Raw ADC (0-4095)
  gasIndex: number;            // Normalized index relative to baseline (0.8 - 2.5)
  acousticRaw: number;         // Raw amplitude (0-4095)
  insectEventsPerMin: number;  // Detected sound threshold crossings per minute
  module: StorageModule;
  gasScore: number;            // Clamped 0-100
  acousticScore: number;       // Clamped 0-100
  humidityRisk: number;        // Clamped 0-100
  tempRisk: number;            // Clamped 0-100
  riskScore: number;           // Composite 0-100
  status: AlertSeverity;       // Evaluated status
  isSimulated: boolean;
  statusReason?: string;
  rateOfChange30m?: number;    // Risk points change per hour
  isAnomaly?: boolean;         // Z-score deviation flag
}

export interface AlertItem {
  id: string;
  ts: number;
  severity: AlertSeverity;
  type: SpoilageType;
  message: string;
  recommendedAction: string;
  acknowledged: boolean;
  module: StorageModule;
  riskScore: number;
}

export interface StorageSettings {
  deviceId: string;
  module: StorageModule;
  binHeightCm: number;
  gasThreshold: number;        // Gas index threshold (e.g. 1.4)
  gasBaseline: number;         // Baseline gas index (e.g. 1.0)
  acousticThreshold: number;   // Insect events/min threshold (e.g. 35)
  humidityThreshold: number;   // % RH threshold (e.g. 65%)
  tempThreshold: number;       // °C threshold (e.g. 30°C)
  refreshSeconds: number;
  language: 'en' | 'hi' | 'mr';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  quantityQuintal: number;     // For economic calculation
  pricePerQuintal: number;     // ₹ INR
}

export interface AIAdvisorResult {
  summary: string;
  riskLevel: string;
  likelyCause: string;
  actions: string[];
  confidence: number;
  whatToCheckNext: string;
}

export interface ForecastPoint {
  ts: number;
  timeLabel: string;
  riskScore: number;
  upperBand: number;
  lowerBand: number;
  status: AlertSeverity;
}

export interface ForecastResult {
  points: ForecastPoint[];
  trend: 'Rising' | 'Falling' | 'Stable';
  estimatedHoursToWarning: number | null;
  estimatedHoursToAlert: number | null;
  summaryText: string;
}

export type ScenarioType = 'normal' | 'humidity_rising' | 'fungal_spoilage' | 'insect_infestation' | 'confirmed_alert';
