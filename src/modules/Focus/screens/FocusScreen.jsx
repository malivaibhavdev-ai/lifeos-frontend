import { memo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import * as Haptics from '../../../services/haptics';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { FOCUS_MODES, FOCUS_MODE_PRESETS } from '../constants/focusModes';
import { focusAudioService } from '../services/focusAudioService';

const MODE_ORDER = [FOCUS_MODES.POMODORO, FOCUS_MODES.DEEP_FOCUS, FOCUS_MODES.STOPWATCH, FOCUS_MODES.COUNTDOWN];

const PHASE_LABEL = { work: 'Focus', shortBreak: 'Short Break', longBreak: 'Long Break' };

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

// Memoized: FocusScreen's ticking clock (`timer.remainingSeconds`, driven by
// a 1s interval in useFocusTimer) re-renders FocusScreen every second while
// a session is running. These mode/control chips don't depend on the tick —
// only on selection/status, which change far less often — so memoizing them
// keeps that once-a-second re-render limited to the digits that actually
// need it instead of the whole idle/running control surface.
const ModeChip = memo(function ModeChip({ preset, selected, onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`mr-2 flex flex-shrink-0 flex-row items-center rounded-full border px-4 py-2 lg:mr-3 ${
        selected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
      }`}
    >
      <Icon name={preset.icon} size={16} color={selected ? '#ffffff' : '#64748b'} />
      <span className={`ml-1.5 text-sm font-semibold ${selected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
        {preset.label}
      </span>
    </button>
  );
});

const CountdownMinutesStepper = memo(function CountdownMinutesStepper({ minutes, onChange }) {
  return (
    <div className="mt-4 flex flex-row items-center justify-center">
      <button
        type="button"
        onClick={() => onChange(Math.max(5, minutes - 5))}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        aria-label="Decrease countdown minutes"
      >
        <Icon name="remove" size={20} color="#2563eb" />
      </button>
      <span className="mx-5 text-lg font-bold text-gray-900 dark:text-white">{minutes} min</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(180, minutes + 5))}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        aria-label="Increase countdown minutes"
      >
        <Icon name="add" size={20} color="#2563eb" />
      </button>
    </div>
  );
});

const ControlButton = memo(function ControlButton({ label, icon, onPress, variant = 'primary' }) {
  const styles = {
    primary: 'bg-primary-600 hover:bg-primary-700',
    neutral: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800',
  };
  const textStyles = { primary: 'text-white', neutral: 'text-gray-800 dark:text-gray-200' };

  return (
    <button type="button" onClick={onPress} className={`flex flex-row items-center rounded-2xl px-6 py-3.5 lg:px-8 lg:py-4 ${styles[variant]}`}>
      {icon ? <Icon name={icon} size={18} color={variant === 'primary' ? '#ffffff' : '#374151'} /> : null}
      <span className={`text-base font-semibold lg:text-lg ${textStyles[variant]} ${icon ? 'ml-2' : ''}`}>{label}</span>
    </button>
  );
});

// Not wired to real audio playback yet — see focusAudioService for why. The
// picker is fully functional as UI state (selecting/toggling a track), it
// just doesn't make sound. Being upfront about that here rather than
// shipping a silent "play" button that looks broken. Memoized for the same
// reason as the chips above — it owns no props and manages its own
// subscription, so it never needs to re-render on the parent's timer tick.
const AmbientSoundPicker = memo(function AmbientSoundPicker() {
  const [audioState, setAudioState] = useState(focusAudioService.getState());

  useEffect(() => focusAudioService.subscribe(setAudioState), []);

  return (
    <div className="mt-6">
      <div className="flex flex-row items-center justify-between">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Ambient Sound</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">Preview only — coming soon</span>
      </div>
      <div className="mt-2 flex flex-row overflow-x-auto pb-1">
        {focusAudioService.getCatalog().map((track) => {
          const isActive = audioState.currentTrackId === track.id && audioState.isPlaying;
          return (
            <button
              type="button"
              key={track.id}
              onClick={() => (isActive ? focusAudioService.pause() : focusAudioService.play(track.id))}
              className={`mr-2 flex flex-shrink-0 flex-col items-center rounded-2xl border px-4 py-3 ${
                isActive ? 'border-primary-600 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700'
              }`}
              style={{ minWidth: 84 }}
            >
              <Icon name={track.icon} size={20} color={isActive ? '#2563eb' : '#64748b'} />
              <span className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">{track.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export function FocusScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entityType = null, entityId = null, taskTitle = null } = location.state ?? {};

  const [selectedMode, setSelectedMode] = useState(FOCUS_MODES.POMODORO);
  const [countdownMinutes, setCountdownMinutes] = useState(25);

  const timer = useFocusTimer({
    mode: selectedMode,
    entityType,
    entityId,
    customDurationSeconds: countdownMinutes * 60,
  });

  const isIdle = timer.status === 'idle';
  const isCompleted = timer.status === 'completed';
  const isPaused = timer.status === 'paused';
  const isRunning = timer.status === 'running';
  const isWorkPhase = timer.phase === 'work';

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-end pt-2">
          <button
            type="button"
            onClick={() => navigate('/focus/history')}
            className="flex flex-row items-center rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-800"
          >
            <Icon name="time-outline" size={16} color="#2563eb" />
            <span className="ml-1.5 text-sm font-medium text-primary-600">History</span>
          </button>
        </div>

        {entityId ? (
          <div className="mt-3 flex flex-row items-center rounded-xl bg-primary-50 px-3.5 py-2.5 dark:bg-primary-950">
            <Icon name="link-outline" size={16} color="#2563eb" />
            <span className="ml-2 flex-1 truncate text-sm font-medium text-primary-700 dark:text-primary-300">
              Linked to: {taskTitle || 'Task'}
            </span>
          </div>
        ) : null}

        {isIdle ? (
          <div className="mt-6 flex flex-row overflow-x-auto lg:flex-wrap lg:justify-center lg:overflow-visible">
            {MODE_ORDER.map((key) => (
              <ModeChip
                key={key}
                preset={FOCUS_MODE_PRESETS[key]}
                selected={selectedMode === key}
                onPress={() => setSelectedMode(key)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-center text-sm font-semibold uppercase tracking-wide text-primary-600">
            {timer.preset.label} {timer.phase !== 'idle' ? `· ${PHASE_LABEL[timer.phase]}` : ''}
          </p>
        )}

        {isIdle && selectedMode === FOCUS_MODES.COUNTDOWN ? (
          <CountdownMinutesStepper minutes={countdownMinutes} onChange={setCountdownMinutes} />
        ) : null}

        <div className="flex flex-col items-center justify-center py-12 lg:py-20">
          <p className="text-6xl font-bold tabular-nums text-gray-900 dark:text-white lg:text-8xl">
            {formatClock(timer.remainingSeconds)}
          </p>
          {timer.mode === FOCUS_MODES.POMODORO && isWorkPhase && !isIdle ? (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 lg:text-base">Cycle {timer.cycleCount + 1}</p>
          ) : null}
          {isRunning || isPaused ? (
            <div className="mt-3 flex flex-row items-center">
              <Icon name="notifications-off-outline" size={14} color="#94a3b8" />
              <span className="ml-1.5 text-xs text-gray-400">Notifications stay silent until this session ends</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-center">
          {isIdle ? <ControlButton label="Start Focus Session" icon="play" onPress={timer.start} /> : null}

          {isCompleted ? (
            <>
              <Icon name="checkmark-circle" size={40} color="#22c55e" />
              <p className="mb-4 mt-2 text-base font-semibold text-gray-900 dark:text-white">Session complete</p>
              <ControlButton label="Done" icon="checkmark" onPress={timer.stop} />
            </>
          ) : null}

          {isRunning || isPaused ? (
            <div className="w-full">
              <div className="flex flex-row items-center justify-center gap-3">
                {isRunning ? (
                  <ControlButton label="Pause" icon="pause" variant="neutral" onPress={timer.pause} />
                ) : (
                  <ControlButton label="Resume" icon="play" onPress={timer.resume} />
                )}
                <ControlButton
                  label={isWorkPhase ? 'Finish' : 'Skip Break'}
                  icon={isWorkPhase ? 'checkmark' : 'play-skip-forward'}
                  variant={isWorkPhase ? 'primary' : 'neutral'}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    timer.skip();
                  }}
                />
              </div>
              <button type="button" onClick={timer.stop} className="mt-4 flex w-full flex-col items-center">
                <span className="text-sm font-medium text-danger">{isWorkPhase ? 'Cancel Session' : 'End Session'}</span>
              </button>
            </div>
          ) : null}
        </div>

        <AmbientSoundPicker />
      </PageContainer>
    </Screen>
  );
}
