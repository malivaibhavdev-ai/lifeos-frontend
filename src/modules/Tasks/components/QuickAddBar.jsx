import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { ImpactFeedbackStyle, NotificationFeedbackType, impactAsync, notificationAsync } from '../../../services/haptics';
import { useVoiceInput } from '../../../services/voiceInputService';
import { parseQuickAddText } from '../utils/naturalLanguageParser';
import { formatDueDate } from '../utils/dateFormat';
import { PRIORITY, SMART_LISTS } from '../constants/taskConstants';
import { useCreateTask } from '../hooks/useTasks';
import { useTaskUiStore } from '../store/taskUiStore';
import { resolveLandingView, taskMatchesView } from '../utils/viewMatcher';

function PreviewChip({ icon, label, color = '#2563eb' }) {
  return (
    <span className="flex flex-row items-center rounded-full px-2.5 py-1" style={{ backgroundColor: `${color}1A` }}>
      <Icon name={icon} size={12} color={color} />
      <span className="ml-1 text-xs font-medium" style={{ color }}>
        {label}
      </span>
    </span>
  );
}

const LANDING_LABEL = Object.fromEntries(SMART_LISTS.map((l) => [l.key, l.label]));

export const QuickAddBar = forwardRef(function QuickAddBar({ onCreated }, ref) {
  const [text, setText] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const confirmationTimeout = useRef(null);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

  const navigate = useNavigate();
  const createTask = useCreateTask();
  const activeList = useTaskUiStore((s) => s.activeList);
  const setActiveList = useTaskUiStore((s) => s.setActiveList);

  const { isListening, errorMessage: voiceError, start: startListening, stop: stopListening } = useVoiceInput({
    onFinalResult: (transcript) => {
      if (!transcript) return;
      setText((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
      notificationAsync(NotificationFeedbackType.Success);
    },
  });

  const parsed = useMemo(() => (text.trim() ? parseQuickAddText(text) : null), [text]);
  const hasPreview = parsed && (parsed.dueDate || parsed.priority || parsed.category || parsed.tags.length > 0);

  useEffect(() => () => clearTimeout(confirmationTimeout.current), []);

  useEffect(() => {
    if (voiceError) setErrorMessage(voiceError);
  }, [voiceError]);

  const showConfirmation = (message, ms = 2500) => {
    setConfirmation(message);
    clearTimeout(confirmationTimeout.current);
    confirmationTimeout.current = setTimeout(() => setConfirmation(null), ms);
  };

  const announceLanding = (task) => {
    if (!taskMatchesView(task, activeList)) {
      const landingView = resolveLandingView(task);
      setActiveList(landingView);
      showConfirmation(`Added to ${LANDING_LABEL[landingView] ?? landingView}`);
    } else {
      showConfirmation('Task added');
    }
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || createTask.isPending) return;

    const result = parseQuickAddText(trimmed);
    if (!result.title) return;

    setErrorMessage(null);

    try {
      const task = await createTask.mutateAsync({
        title: result.title,
        dueDate: result.dueDate ? result.dueDate.toISOString() : undefined,
        priority: result.priority ?? undefined,
        tags: result.tags,
        category: result.category ?? undefined,
      });
      setText('');
      notificationAsync(NotificationFeedbackType.Success);
      announceLanding(task);
      onCreated?.(task);
    } catch (error) {
      notificationAsync(NotificationFeedbackType.Error);
      setErrorMessage(error?.message ?? 'Could not add task');
    }
  };

  // "Expand" creates the task right away (same parsing as a normal submit,
  // defaulting to "New Task" if the field is empty) and jumps straight into
  // its detail screen — power users get full editing without a separate
  // create-mode screen to maintain.
  const handleExpand = async () => {
    if (createTask.isPending) return;
    const trimmed = text.trim();
    const result = trimmed ? parseQuickAddText(trimmed) : null;

    setErrorMessage(null);
    try {
      const task = await createTask.mutateAsync({
        title: result?.title || 'New Task',
        dueDate: result?.dueDate ? result.dueDate.toISOString() : undefined,
        priority: result?.priority ?? undefined,
        tags: result?.tags ?? [],
        category: result?.category ?? undefined,
      });
      setText('');
      impactAsync(ImpactFeedbackStyle.Light);
      announceLanding(task);
      navigate(`/tasks/${task._id}`);
    } catch (error) {
      notificationAsync(NotificationFeedbackType.Error);
      setErrorMessage(error?.message ?? 'Could not create task');
    }
  };

  const handleVoicePress = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    setErrorMessage(null);
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white px-4 pb-3 pt-2.5 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] dark:border-gray-800 dark:bg-gray-950 dark:shadow-none">
      {confirmation ? (
        <div className="mb-2 flex flex-row items-center">
          <Icon name="checkmark-circle" size={14} color="#22c55e" />
          <span className="ml-1.5 text-xs font-medium text-success">{confirmation}</span>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-2 flex flex-row items-center">
          <Icon name="alert-circle" size={14} color="#ef4444" />
          <span className="ml-1.5 text-xs font-medium text-danger">{errorMessage}</span>
        </div>
      ) : null}

      {hasPreview ? (
        <div className="mb-2 flex flex-row flex-wrap gap-1.5">
          {parsed.dueDate ? <PreviewChip icon="calendar-outline" label={formatDueDate(parsed.dueDate)} /> : null}
          {parsed.priority ? (
            <PreviewChip icon="flag-outline" label={PRIORITY[parsed.priority].label} color={PRIORITY[parsed.priority].color} />
          ) : null}
          {parsed.category ? <PreviewChip icon="folder-outline" label={parsed.category} color="#64748b" /> : null}
          {parsed.tags.map((tag) => (
            <PreviewChip key={tag} icon="pricetag-outline" label={tag} color="#64748b" />
          ))}
        </div>
      ) : null}

      <div className="flex flex-row items-end gap-2">
        <button
          type="button"
          onClick={handleExpand}
          aria-label="Create and open full task editor"
          className="mb-2 h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:bg-gray-900"
        >
          <Icon name="expand-outline" size={16} color="#64748b" />
        </button>

        <div
          className={`flex flex-1 flex-row items-center rounded-3xl pl-4 pr-1.5 ${
            isListening ? 'bg-red-50 dark:bg-red-950' : 'bg-gray-100 dark:bg-gray-900'
          }`}
        >
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            placeholder={isListening ? 'Listening…' : 'Add a task…'}
            aria-label="Add a task"
            disabled={isListening}
            className="flex-1 bg-transparent py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
            style={isListening ? { color: '#ef4444' } : undefined}
          />
          <button
            type="button"
            onClick={handleVoicePress}
            aria-label={isListening ? 'Stop voice input' : 'Add task by voice'}
            aria-pressed={isListening}
            className="mr-1 h-9 w-9 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <span className={isListening ? 'inline-flex animate-mic-pulse' : 'inline-flex'}>
              <Icon name={isListening ? 'mic' : 'mic-outline'} size={19} color={isListening ? '#ef4444' : '#94a3b8'} />
            </span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || createTask.isPending}
            aria-label="Add task"
            className="h-9 w-9 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <Icon name="arrow-up-circle" size={30} color={text.trim() ? '#2563eb' : '#cbd5e1'} />
          </button>
        </div>
      </div>

      <p className="mt-1.5 ml-11 text-[11px] text-gray-400 dark:text-gray-500">
        {isListening ? 'Speak now — tap the mic again to stop' : 'Try "Call mom tomorrow 5pm #family !high"'}
      </p>
    </div>
  );
});
