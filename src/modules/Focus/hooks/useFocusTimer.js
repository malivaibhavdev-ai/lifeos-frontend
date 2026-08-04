import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from '../../../services/haptics';
import { getFocusPreset } from '../constants/focusModes';
import {
  useActiveFocusSession,
  useCompleteFocusSession,
  useInterruptFocusSession,
  usePauseFocusSession,
  useResumeFocusSession,
  useStartFocusSession,
} from './useFocusSessions';
import { cancelFocusEndNotification, scheduleFocusEndNotification } from '../services/focusNotifications';
import { setFocusSessionActive } from '../services/focusDndService';

// Timestamp-based by design: every "how much time is left" calculation is
// `phaseEndAt - now` using real Date.now() values, never a naive decrement-
// once-per-second counter. That's what makes it correct after backgrounding
// or a slow JS thread — a decrementing counter drifts (or freezes) exactly
// in those cases; comparing two real timestamps can't. Pomodoro's
// work/break cycling is a client-side state machine wrapping this — only
// 'work' phases create a backend FocusSession (breaks aren't focus time).
export function useFocusTimer({ mode, entityType, entityId, customDurationSeconds } = {}) {
  // `activeMode` (not the raw `mode` prop) drives the preset lookup, because
  // rehydrating a session that survived an app restart (see below) can
  // discover it was actually a different mode than whatever the UI's mode
  // selector currently shows.
  const [activeMode, setActiveMode] = useState(mode);
  const preset = getFocusPreset(activeMode);

  const [phase, setPhase] = useState('idle'); // idle | work | shortBreak | longBreak
  const [status, setStatus] = useState('idle'); // idle | running | paused | completed
  const [cycleCount, setCycleCount] = useState(0);
  const [now, setNow] = useState(Date.now());

  const sessionIdRef = useRef(null);
  const phaseEndAtRef = useRef(null);
  const phaseStartAtRef = useRef(null);
  const pausedAtRef = useRef(null);
  const totalPausedMsRef = useRef(0);
  const isAdvancingRef = useRef(false);

  const startSession = useStartFocusSession();
  const pauseSession = usePauseFocusSession();
  const resumeSession = useResumeFocusSession();
  const completeSession = useCompleteFocusSession();
  const interruptSession = useInterruptFocusSession();
  const activeSessionQuery = useActiveFocusSession();

  useEffect(() => {
    if (status === 'idle') setActiveMode(mode);
  }, [mode, status]);

  // Recovers a work-phase session that outlived the JS process — a killed
  // or crashed app, not just a background/sleep — by reconstructing the
  // same start/end timestamps a live session would have from the backend
  // record, which is the only state that survived. Breaks are intentionally
  // not recoverable this way: they never create a backend session (they
  // aren't focus time), so a break in progress at the moment of a restart
  // is simply lost — acceptable, since resuming lands the user back at a
  // fresh work phase rather than mid-break.
  useEffect(() => {
    if (status !== 'idle') return;
    const active = activeSessionQuery.data;
    if (!active) return;

    sessionIdRef.current = active._id;
    setActiveMode(active.mode);
    phaseStartAtRef.current = new Date(active.startedAt).getTime();
    totalPausedMsRef.current = (active.totalPausedSeconds || 0) * 1000;
    pausedAtRef.current = active.pausedAt ? new Date(active.pausedAt).getTime() : null;
    phaseEndAtRef.current = active.plannedDurationSeconds
      ? phaseStartAtRef.current + active.plannedDurationSeconds * 1000 + totalPausedMsRef.current
      : null;

    setPhase('work');
    setCycleCount(0);
    setStatus(pausedAtRef.current ? 'paused' : 'running');
    setNow(Date.now());
  }, [activeSessionQuery.data, status]);

  useEffect(() => {
    if (status !== 'running') return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const phaseDurationSeconds = useCallback(
    (targetPhase) => {
      if (targetPhase === 'work') return preset.isCustomDuration ? customDurationSeconds : preset.workSeconds;
      if (targetPhase === 'shortBreak') return preset.shortBreakSeconds;
      if (targetPhase === 'longBreak') return preset.longBreakSeconds;
      return null;
    },
    [preset, customDurationSeconds]
  );

  const beginPhase = useCallback(
    async (nextPhase, nextCycleCount) => {
      setPhase(nextPhase);
      setCycleCount(nextCycleCount);
      setStatus('running');
      pausedAtRef.current = null;
      totalPausedMsRef.current = 0;
      phaseStartAtRef.current = Date.now();

      const durationSeconds = phaseDurationSeconds(nextPhase);
      phaseEndAtRef.current = durationSeconds ? Date.now() + durationSeconds * 1000 : null;

      if (nextPhase === 'work') {
        const session = await startSession.mutateAsync({
          entityType: entityType ?? null,
          entityId: entityId ?? null,
          mode: activeMode,
          plannedDurationSeconds: durationSeconds ?? null,
        });
        sessionIdRef.current = session._id;
      } else {
        sessionIdRef.current = null; // breaks aren't backend-tracked focus time
      }

      if (phaseEndAtRef.current) {
        scheduleFocusEndNotification({ phase: nextPhase, endAt: new Date(phaseEndAtRef.current) });
      }
      setFocusSessionActive(true);
    },
    [activeMode, entityType, entityId, startSession, phaseDurationSeconds]
  );

  const start = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    beginPhase('work', 0);
  }, [beginPhase]);

  const pause = useCallback(async () => {
    if (status !== 'running') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pausedAtRef.current = Date.now();
    setStatus('paused');
    await cancelFocusEndNotification();
    if (phase === 'work' && sessionIdRef.current) {
      await pauseSession.mutateAsync(sessionIdRef.current);
    }
  }, [status, phase, pauseSession]);

  const resume = useCallback(async () => {
    if (status !== 'paused') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const pausedMs = Date.now() - pausedAtRef.current;
    totalPausedMsRef.current += pausedMs;
    if (phaseEndAtRef.current) phaseEndAtRef.current += pausedMs;
    pausedAtRef.current = null;
    setStatus('running');
    if (phaseEndAtRef.current) {
      scheduleFocusEndNotification({ phase, endAt: new Date(phaseEndAtRef.current) });
    }
    if (phase === 'work' && sessionIdRef.current) {
      await resumeSession.mutateAsync(sessionIdRef.current);
    }
  }, [status, phase, resumeSession]);

  const advanceAfterWork = useCallback(async () => {
    const nextCycle = cycleCount + 1;
    if (!preset.hasBreaks) {
      setStatus('completed');
      setPhase('idle');
      setFocusSessionActive(false);
      return;
    }
    const isLongBreak = nextCycle % preset.cyclesBeforeLongBreak === 0;
    await beginPhase(isLongBreak ? 'longBreak' : 'shortBreak', nextCycle);
  }, [cycleCount, preset, beginPhase]);

  const completeWorkPhase = useCallback(async () => {
    await cancelFocusEndNotification();
    if (sessionIdRef.current) {
      await completeSession.mutateAsync({ id: sessionIdRef.current });
      sessionIdRef.current = null;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await advanceAfterWork();
  }, [completeSession, advanceAfterWork]);

  const finishBreak = useCallback(async () => {
    await cancelFocusEndNotification();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await beginPhase('work', cycleCount);
  }, [beginPhase, cycleCount]);

  // Ends the current phase early — same downstream effect as it completing
  // naturally (work logs + advances; break just advances).
  const skip = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (phase === 'work') await completeWorkPhase();
    else await finishBreak();
  }, [phase, completeWorkPhase, finishBreak]);

  const stop = useCallback(async () => {
    await cancelFocusEndNotification();
    if (sessionIdRef.current) {
      await interruptSession.mutateAsync({ id: sessionIdRef.current });
      sessionIdRef.current = null;
    }
    setStatus('idle');
    setPhase('idle');
    setCycleCount(0);
    setFocusSessionActive(false);
  }, [interruptSession]);

  // Auto-advance once a countdown phase's remaining time reaches zero.
  // isAdvancingRef guards against a slow network response for the previous
  // phase's completion overlapping with a fresh tick re-triggering this
  // effect before `status`/`phase` have updated — without it, a laggy
  // completeSession() call could fire twice for the same phase transition.
  useEffect(() => {
    if (status !== 'running' || !phaseEndAtRef.current || isAdvancingRef.current) return;
    if (now < phaseEndAtRef.current) return;

    isAdvancingRef.current = true;
    const advance = phase === 'work' ? completeWorkPhase : finishBreak;
    advance().finally(() => {
      isAdvancingRef.current = false;
    });
  }, [now, status, phase, completeWorkPhase, finishBreak]);

  let remainingSeconds = 0;
  if (status === 'idle') {
    remainingSeconds = phaseDurationSeconds('work') ?? 0;
  } else if (preset.isCountUp) {
    const elapsedMs = (status === 'paused' ? pausedAtRef.current : now) - phaseStartAtRef.current - totalPausedMsRef.current;
    remainingSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  } else if (phaseEndAtRef.current) {
    const effectiveNow = status === 'paused' ? pausedAtRef.current : now;
    remainingSeconds = Math.max(0, Math.ceil((phaseEndAtRef.current - effectiveNow) / 1000));
  }

  return {
    mode: activeMode,
    preset,
    phase,
    status,
    cycleCount,
    remainingSeconds,
    isCountUp: preset.isCountUp,
    start,
    pause,
    resume,
    skip,
    stop,
  };
}
