import { useEffect, useRef } from 'react';
import { AlertSeverity } from '../types';

export function useSoundAlarm(status: AlertSeverity, soundEnabled: boolean, notificationsEnabled: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== 'alert' || !soundEnabled) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const playChime = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        // Two-tone warning chime: 659.25Hz (E5) fading to 880Hz (A5)
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.65);
      } catch (e) {
        // Audio might be blocked until user gesture
      }
    };

    // Play initial chime
    playChime();
    // Repeat every 8 seconds while alert is active
    intervalRef.current = window.setInterval(playChime, 8000);

    // Browser Notification if enabled
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Smart Grain Guardian Alert!', {
          body: 'Critical: Acoustic & Gas sensors cross-validated active grain spoilage!',
          icon: '/icon.svg',
        });
      } catch (e) {
        // Notification error catch
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, soundEnabled, notificationsEnabled]);
}
