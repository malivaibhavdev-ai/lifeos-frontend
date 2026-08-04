import { useCallback, useMemo, useRef, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import * as Haptics from '../../../services/haptics';
import { useCalendarUiStore } from '../store/calendarUiStore';
import { useCalendarOccurrences } from '../hooks/useCalendarEngine';
import { useCreateTimeBlock } from '../hooks/useTimeBlocks';
import { UnscheduledTaskTray } from '../components/UnscheduledTaskTray';
import { OccurrenceBlock } from '../components/OccurrenceBlock';
import {
  HOUR_HEIGHT,
  MIN_BLOCK_MINUTES,
  assignOverlapColumns,
  minutesFromMidnight,
  minutesToY,
  resolveColor,
  resolveIcon,
  yToSnappedStartTime,
} from '../utils/occurrenceHelpers';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const LABEL_WIDTH = 52;
const CANVAS_DROPPABLE_ID = 'day-canvas';

function formatHourLabel(hour) {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

function AllDayChip({ occurrence, onPress }) {
  const color = resolveColor(occurrence);
  return (
    <button
      type="button"
      onClick={() => onPress(occurrence)}
      className="mr-2 flex flex-row items-center rounded-full px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      style={{ backgroundColor: `${color}26` }}
    >
      <Icon name={resolveIcon(occurrence)} size={12} color={color} />
      <span className="line-clamp-1 ml-1.5 text-xs font-semibold" style={{ color, maxWidth: 140 }}>
        {occurrence.title ?? 'Untitled'}
      </span>
    </button>
  );
}

// The hour canvas is the single droppable target for the whole view — a
// drop's Y position is resolved from the pointer's live clientY at drop
// time, converted to "minutes since midnight" via this element's own
// getBoundingClientRect().top (which already reflects the current scroll
// position, unlike the RN version's manual measureInWindow + scroll-offset
// tracking, needed there because native measurement is otherwise stale).
function DayCanvas({ canvasRef, isToday, nowMinutes, laidOut, dayDate, onOpenOccurrence }) {
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_DROPPABLE_ID });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        canvasRef.current = node;
      }}
      className={isOver ? 'bg-primary-50/40 dark:bg-primary-950/40' : ''}
      style={{ position: 'relative', height: 24 * HOUR_HEIGHT }}
    >
      {HOURS.map((hour) => (
        <div
          key={hour}
          style={{ position: 'absolute', top: hour * HOUR_HEIGHT, left: 0, right: 0, height: HOUR_HEIGHT }}
          className="flex flex-row border-t border-gray-100 dark:border-gray-800"
        >
          <div style={{ width: LABEL_WIDTH }} className="items-end pr-2 pt-0.5 flex flex-col">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatHourLabel(hour)}</span>
          </div>
        </div>
      ))}

      {isToday ? (
        <div
          style={{ position: 'absolute', top: minutesToY(nowMinutes), left: LABEL_WIDTH, right: 8, height: 2, pointerEvents: 'none' }}
          className="bg-danger"
        />
      ) : null}

      <div style={{ position: 'absolute', top: 0, left: LABEL_WIDTH + 4, right: 8, bottom: 0 }}>
        {laidOut.map((o) => (
          <OccurrenceBlock
            key={`${o.entityType}-${o.entityId}`}
            occurrence={o}
            dayDate={dayDate}
            onPress={onOpenOccurrence}
          />
        ))}
      </div>
    </div>
  );
}

// The flagship interaction of the Calendar workspace: drag a chip from the
// Unscheduled tray onto the hour grid below, release to create a TimeBlock
// at the snapped drop time. @dnd-kit/core's DndContext wraps both the
// draggable tray (see UnscheduledTaskTray) and the droppable canvas (see
// DayCanvas above); DragOverlay renders the floating "ghost" chip following
// the pointer, replacing the RN version's manual reanimated shared-value
// tracking (ghostX/ghostY + measureInWindow) — dnd-kit already solves that
// positioning problem internally.
export function DayView({ onOpenOccurrence }) {
  const visibleDate = useCalendarUiStore((s) => s.visibleDate);
  const setVisibleDate = useCalendarUiStore((s) => s.setVisibleDate);
  const goToToday = useCalendarUiStore((s) => s.goToToday);

  const day = useMemo(() => dayjs(visibleDate), [visibleDate]);
  const isToday = day.isSame(dayjs(), 'day');
  // Memoized so every OccurrenceBlock on this grid gets the *same* Date
  // reference across renders (not a fresh `new Date()` per block, per
  // render) — required for OccurrenceBlock's React.memo to actually bail
  // out instead of re-rendering every block whenever DayView re-renders.
  const dayDate = useMemo(() => day.toDate(), [day]);

  const { from, to } = useMemo(
    () => ({ from: day.startOf('day').toISOString(), to: day.endOf('day').toISOString() }),
    [day]
  );

  const { data } = useCalendarOccurrences(from, to);
  const occurrences = data ?? EMPTY_ARRAY;

  const timedOccurrences = useMemo(() => occurrences.filter((o) => !o.allDay), [occurrences]);
  const allDayOccurrences = useMemo(() => occurrences.filter((o) => o.allDay), [occurrences]);
  const laidOut = useMemo(() => assignOverlapColumns(timedOccurrences, dayDate), [timedOccurrences, dayDate]);

  const blockedTaskIdsToday = useMemo(
    () => occurrences.filter((o) => o.entityType === 'timeBlock').map((o) => o.meta?.sourceEntityId).filter(Boolean),
    [occurrences]
  );

  const createTimeBlock = useCreateTimeBlock();
  const canvasRef = useRef(null);
  const [draggingTask, setDraggingTask] = useState(null);

  // A short hold-and-move disambiguates "pick up this chip" from "scroll the
  // tray beneath it" — the same reason the RN version used
  // `.activateAfterLongPress(180)`.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 180, tolerance: 8 } }));

  const handleDragStart = useCallback((event) => {
    setDraggingTask(event.active.data.current?.task ?? null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleDragCancel = useCallback(() => setDraggingTask(null), []);

  const handleDragEnd = useCallback(
    (event) => {
      const task = event.active.data.current?.task;
      setDraggingTask(null);
      if (!task || event.over?.id !== CANVAS_DROPPABLE_ID || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const pointerY = (event.activatorEvent?.clientY ?? 0) + event.delta.y;
      const contentY = pointerY - canvasRect.top;
      if (contentY < 0 || contentY > canvasRect.height) return; // dropped outside the grid

      const startTime = yToSnappedStartTime(contentY, dayDate);
      const durationMinutes = Math.max(task.estimatedMinutes || 30, MIN_BLOCK_MINUTES);
      const endTime = dayjs(startTime).add(durationMinutes, 'minute').toDate();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      createTimeBlock.mutate({
        entityType: 'task',
        entityId: task._id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    },
    [dayDate, createTimeBlock]
  );

  const goPrevDay = () => setVisibleDate(day.subtract(1, 'day').toISOString());
  const goNextDay = () => setVisibleDate(day.add(1, 'day').toISOString());

  const nowMinutes = minutesFromMidnight(new Date(), dayDate);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex flex-row items-center justify-between px-4 pb-2">
          <button
            type="button"
            onClick={goPrevDay}
            aria-label="Previous day"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
          >
            <Icon name="chevron-back" size={20} color="#64748b" />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
          >
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {isToday ? 'Today' : day.format('dddd, MMM D')}
            </span>
          </button>
          <button
            type="button"
            onClick={goNextDay}
            aria-label="Next day"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
          >
            <Icon name="chevron-forward" size={20} color="#64748b" />
          </button>
        </div>

        {allDayOccurrences.length > 0 ? (
          <div className="flex flex-row overflow-x-auto" style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 8 }}>
            {allDayOccurrences.map((o) => (
              <AllDayChip key={`${o.entityType}-${o.entityId}`} occurrence={o} onPress={onOpenOccurrence} />
            ))}
          </div>
        ) : null}

        <UnscheduledTaskTray excludeTaskIds={blockedTaskIdsToday} />

        <div className="flex-1 min-h-0 overflow-y-auto">
          <DayCanvas
            canvasRef={canvasRef}
            isToday={isToday}
            nowMinutes={nowMinutes}
            laidOut={laidOut}
            dayDate={dayDate}
            onOpenOccurrence={onOpenOccurrence}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {draggingTask ? (
          <div className="flex flex-row items-center rounded-xl bg-primary-600 px-3 py-2 shadow-lg" style={{ width: 150 }}>
            <Icon name="move-outline" size={14} color="#fff" />
            <span className="line-clamp-1 ml-1.5 flex-1 text-xs font-semibold text-white">{draggingTask.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
