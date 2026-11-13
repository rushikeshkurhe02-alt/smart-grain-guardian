import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, X, CheckCircle, ShieldAlert, Sparkles, Download, Volume2, Wind } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScenarioType } from '../types';

interface PitchStep {
  id: number;
  title: string;
  scenario: ScenarioType;
  speaker: string;
  script: string;
  statBadge: string;
  durationMs: number;
}

const PITCH_STEPS: PitchStep[] = [
  {
    id: 1,
    title: '1. Baseline Harvest Storage',
    scenario: 'normal',
    speaker: 'Problem Framing',
    script: '10–20% of harvested grain is lost silently each year. In this bin, 500 Quintals of wheat are loaded. Initial temperature (24°C) and humidity (54%) are nominal.',
    statBadge: 'STATUS: SAFE (Risk: 18/100)',
    durationMs: 7000,
  },
  {
    id: 2,
    title: '2. Environmental Micro-Climate Drift',
    scenario: 'humidity_rising',
    speaker: 'Environmental Sensor (DHT22)',
    script: 'Monsoon humidity penetrates storage vents. Bin relative humidity rises toward 75%. Moisture creates an invisible incubation pocket deep inside the bulk.',
    statBadge: 'HUMIDITY RISING: 74.5%',
    durationMs: 7000,
  },
  {
    id: 3,
    title: '3. Incipient Fungal VOC Spoilage',
    scenario: 'fungal_spoilage',
    speaker: 'Gas Sensor (MQ-135 - The Nose)',
    script: 'Aspergillus fungi begin colonizing warm, damp grain, emitting volatile gases. Gas index surges to 1.62x! System flags an Early Warning.',
    statBadge: 'EARLY WARNING: Gas Index 1.62x',
    durationMs: 8000,
  },
  {
    id: 4,
    title: '4. Insect Acoustic Activity Emerges',
    scenario: 'insect_infestation',
    speaker: 'Acoustic Transducer (The Ear)',
    script: 'Grain weevil larvae chew inside wheat kernels. Acoustic sensor registers 48 chewing events/min. Under conventional systems, this would be a single unconfirmed alert.',
    statBadge: 'ACOUSTIC SPIKE: 48 events/min',
    durationMs: 8000,
  },
  {
    id: 5,
    title: '5. The Breakthrough: Ear + Nose Cross-Validation',
    scenario: 'confirmed_alert',
    speaker: 'Signal Fusion Engine',
    script: 'CORE NOVELTY: Both the acoustic sensor (Ear) AND gas sensor (Nose) simultaneously exceed threshold 60! False alarms are filtered out, triggering a CONFIRMED CRITICAL ALERT.',
    statBadge: 'CONFIRMED ALERT: Both Sensors Agree!',
    durationMs: 9000,
  },
  {
    id: 6,
    title: '6. Gemini-Powered Grounded Advisory',
    scenario: 'confirmed_alert',
    speaker: 'AI Storage Scientist (Gemini 3.8 Flash)',
    script: 'Gemini evaluates live telemetry: Identifies combined insect and Aspergillus infestation, prescribes immediate night aeration, and flags hot-spot quadrant.',
    statBadge: 'AI ADVISORY: 92% Confidence',
    durationMs: 8000,
  },
  {
    id: 7,
    title: '7. Statistical Forecast & Loss Prevention',
    scenario: 'confirmed_alert',
    speaker: 'Economic Impact Engine',
    script: 'Linear EWMA regression calculates the damage curve. Early detection protects ₹2.4 Lakh of grain value before irreversible rot occurs!',
    statBadge: 'SAVED: ₹2,45,000 Crop Value',
    durationMs: 8000,
  },
];

interface PitchModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (scenario: ScenarioType) => void;
  onExportCSV: () => void;
}

export const PitchModeModal: React.FC<PitchModeModalProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
  onExportCSV,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressPct, setProgressPct] = useState(0);
  const stepTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const step = PITCH_STEPS[currentStepIdx];

  // Apply scenario when step changes
  useEffect(() => {
    if (!isOpen) return;
    onApplyScenario(step.scenario);
    setProgressPct(0);

    if (currentStepIdx === 4 || currentStepIdx === 6) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  }, [currentStepIdx, isOpen]);

  // Handle auto-playback
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const duration = step.durationMs;
    const intervalMs = 100;
    let elapsed = 0;

    progressTimerRef.current = window.setInterval(() => {
      elapsed += intervalMs;
      setProgressPct(Math.min((elapsed / duration) * 100, 100));
    }, intervalMs);

    stepTimerRef.current = window.setTimeout(() => {
      if (currentStepIdx < PITCH_STEPS.length - 1) {
        setCurrentStepIdx(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, duration);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isOpen, isPlaying, currentStepIdx]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIdx < PITCH_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-teal-500/30 text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Pitch Navigation Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 font-bold text-xs">
              PITCH MODE
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Hackathon Walkthrough (60 Seconds)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              {currentStepIdx + 1} / {PITCH_STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Pitch Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-amber-400 to-red-500 transition-all duration-100 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Slide Body */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              {step.speaker}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-amber-300">
              {step.statBadge}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black mt-2 text-white tracking-tight">
            {step.title}
          </h3>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed min-h-[72px]">
            {step.script}
          </p>

          {/* Interactive Cue Callout */}
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-slate-300">
                Dashboard live telemetry synchronized to <strong className="text-white capitalize">{step.scenario.replace('_', ' ')}</strong>
              </span>
            </div>

            {currentStepIdx === PITCH_STEPS.length - 1 && (
              <button
                onClick={onExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download Audit CSV
              </button>
            )}
          </div>
        </div>

        {/* Bottom Playback Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
            >
              Prev
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition shadow-lg shadow-teal-900/30"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIdx === PITCH_STEPS.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white disabled:opacity-40 transition"
            >
              Next
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-white transition"
          >
            Exit Pitch
          </button>
        </div>

      </div>
    </div>
  );
};
