import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { DateField } from '../../../components/ui/DateField';
import { getFocusPreset } from '../../Focus/constants/focusModes';
import { useDeleteTimeBlock, useUpdateTimeBlock } from '../hooks/useTimeBlocks';
import { resolveColor } from '../utils/occurrenceHelpers';

function InfoRow({ icon, label }) {
  return (
    <div className="mb-3 flex flex-row items-center">
      <Icon name={icon} size={16} color="#94a3b8" />
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
}

function OpenTaskButton({ taskId, onClose }) {
  const navigate = useNavigate();
  if (!taskId) return null;
  return (
    <button
      type="button"
      onClick={() => {
        onClose();
        navigate(`/tasks/${taskId}`);
      }}
      className="mb-3 flex flex-row items-center justify-center rounded-xl bg-primary-50 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:bg-primary-950 w-full"
    >
      <Icon name="checkbox-outline" size={16} color="#2563eb" />
      <span className="ml-2 text-sm font-semibold text-primary-600">Open Task</span>
    </button>
  );
}

function StartFocusButton({ entityType, entityId, taskTitle, onClose }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        onClose();
        navigate('/focus', { state: { entityType, entityId, taskTitle } });
      }}
      className="mb-3 flex flex-row items-center justify-center rounded-xl bg-primary-600 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 w-full"
    >
      <Icon name="timer-outline" size={16} color="#fff" />
      <span className="ml-2 text-sm font-semibold text-white">Start Focus Session</span>
    </button>
  );
}

function TaskOccurrenceContent({ occurrence, onClose }) {
  return (
    <div>
      <InfoRow icon="calendar-outline" label={`Due ${dayjs(occurrence.startTime).format('MMM D, YYYY')}`} />
      {occurrence.status ? <InfoRow icon="flag-outline" label={`Status: ${occurrence.status.replace('_', ' ')}`} /> : null}
      <OpenTaskButton taskId={occurrence.entityId} onClose={onClose} />
    </div>
  );
}

function TimeBlockContent({ occurrence, onClose }) {
  const [startTime, setStartTime] = useState(new Date(occurrence.startTime));
  const [endTime, setEndTime] = useState(new Date(occurrence.endTime));

  useEffect(() => {
    setStartTime(new Date(occurrence.startTime));
    setEndTime(new Date(occurrence.endTime));
  }, [occurrence]);

  const updateTimeBlock = useUpdateTimeBlock();
  const deleteTimeBlock = useDeleteTimeBlock();

  const hasChanges = startTime.getTime() !== new Date(occurrence.startTime).getTime() || endTime.getTime() !== new Date(occurrence.endTime).getTime();

  const taskId = occurrence.meta?.sourceEntityId;

  return (
    <div>
      <DateField label="Starts" value={startTime} onChange={(d) => d && setStartTime(d)} mode="datetime" />
      <DateField label="Ends" value={endTime} onChange={(d) => d && setEndTime(d)} mode="datetime" />

      {hasChanges ? (
        <button
          type="button"
          onClick={() =>
            updateTimeBlock.mutate(
              { id: occurrence.entityId, payload: { startTime: startTime.toISOString(), endTime: endTime.toISOString() } },
              { onSuccess: onClose }
            )
          }
          className="mb-3 flex flex-col items-center rounded-xl bg-primary-600 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 w-full"
        >
          <span className="text-sm font-semibold text-white">Save Reschedule</span>
        </button>
      ) : null}

      <StartFocusButton entityType="task" entityId={taskId} taskTitle={occurrence.title} onClose={onClose} />
      <OpenTaskButton taskId={taskId} onClose={onClose} />

      <button
        type="button"
        onClick={() => deleteTimeBlock.mutate(occurrence.entityId, { onSuccess: onClose })}
        className="flex flex-col items-center py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 w-full"
      >
        <span className="text-sm font-medium text-danger">Unschedule (keeps the task)</span>
      </button>
    </div>
  );
}

function FocusSessionContent({ occurrence }) {
  const preset = getFocusPreset(occurrence.meta?.mode);
  const durationMinutes = Math.round((new Date(occurrence.endTime) - new Date(occurrence.startTime)) / 60000);
  return (
    <div>
      <InfoRow icon={preset.icon} label={preset.label} />
      <InfoRow icon="hourglass-outline" label={`${durationMinutes} min`} />
      <InfoRow icon="flag-outline" label={`Status: ${occurrence.status}`} />
    </div>
  );
}

const TITLES = { task: 'Task', timeBlock: 'Scheduled Block', focusSession: 'Focus Session' };

// Handles every occurrence entityType except 'calendarEvent' — that one
// opens CalendarEventFormSheet directly instead (it needs the full document
// for editing, not just the occurrence's display-weight fields).
export function OccurrenceDetailSheet({ occurrence, onClose }) {
  const [sticky, setSticky] = useState(null);
  useEffect(() => {
    if (occurrence) setSticky(occurrence);
  }, [occurrence]);

  const display = occurrence ?? sticky;

  return (
    <Modal visible={Boolean(occurrence)} onClose={onClose} onDone={onClose} title={display ? TITLES[display.entityType] ?? 'Details' : ''}>
      {display ? (
        <>
          <p className="mb-4 text-lg font-bold text-gray-900 dark:text-white" style={{ color: resolveColor(display) }}>
            {display.title ?? TITLES[display.entityType]}
          </p>
          {display.entityType === 'task' ? <TaskOccurrenceContent occurrence={display} onClose={onClose} /> : null}
          {display.entityType === 'timeBlock' ? <TimeBlockContent occurrence={display} onClose={onClose} /> : null}
          {display.entityType === 'focusSession' ? <FocusSessionContent occurrence={display} /> : null}
        </>
      ) : null}
    </Modal>
  );
}
