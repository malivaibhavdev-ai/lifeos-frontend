import dayjs from 'dayjs';
import { dayKey } from '../../../utils/calendarGrid';

// Per-entityType fallback styling — occurrences carry their own `color`
// from the server when the source entity has one (a Task's color, a
// CalendarEvent's color); these are only used when that's null, and for the
// icon, which the server also suggests but the client is free to override.
export const ENTITY_DEFAULTS = {
  task: { color: '#2563eb', icon: 'checkbox-outline', label: 'Task' },
  calendarEvent: { color: '#0ea5e9', icon: 'calendar-outline', label: 'Event' },
  timeBlock: { color: '#2563eb', icon: 'time-outline', label: 'Scheduled' },
  focusSession: { color: '#8b5cf6', icon: 'flame-outline', label: 'Focus' },
};

export function resolveColor(occurrence) {
  return occurrence.color || ENTITY_DEFAULTS[occurrence.entityType]?.color || '#64748b';
}

export function resolveIcon(occurrence) {
  return occurrence.icon || ENTITY_DEFAULTS[occurrence.entityType]?.icon || 'ellipse-outline';
}

// Groups occurrences onto every day they overlap — a multi-day CalendarEvent
// appears on each day it spans, not just the day it starts.
export function groupOccurrencesByDay(occurrences) {
  const map = new Map();
  for (const occurrence of occurrences) {
    const start = dayjs(occurrence.startTime);
    const end = dayjs(occurrence.endTime ?? occurrence.startTime);
    let cursor = start.startOf('day');
    const last = end.startOf('day');
    while (cursor.isBefore(last) || cursor.isSame(last, 'day')) {
      const key = dayKey(cursor);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(occurrence);
      cursor = cursor.add(1, 'day');
    }
  }
  return map;
}

export const HOUR_HEIGHT = 64; // px per hour in the Day/Week time grid
export const SNAP_MINUTES = 15;
export const MIN_BLOCK_MINUTES = 15;

// Minutes since local midnight for `date`, clamped to [0, 1440] — used to
// position a block within a single day's 24-hour column. An occurrence that
// starts the day before (an overnight CalendarEvent) clamps to 0 on this day.
export function minutesFromMidnight(date, dayDate) {
  const start = dayjs(dayDate).startOf('day');
  const diff = dayjs(date).diff(start, 'minute');
  return Math.min(Math.max(diff, 0), 24 * 60);
}

export function minutesToY(minutes) {
  return (minutes / 60) * HOUR_HEIGHT;
}

export function yToMinutes(y) {
  return (y / HOUR_HEIGHT) * 60;
}

export function snapMinutes(minutes) {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

// Converts a raw drop/drag Y offset (within the day column, 0 = midnight)
// into a snapped start Date for `dayDate`, clamped so a block can't start
// before 00:00 or leave less than MIN_BLOCK_MINUTES before midnight.
export function yToSnappedStartTime(y, dayDate) {
  const rawMinutes = snapMinutes(yToMinutes(y));
  const clamped = Math.min(Math.max(rawMinutes, 0), 24 * 60 - MIN_BLOCK_MINUTES);
  return dayjs(dayDate).startOf('day').add(clamped, 'minute').toDate();
}

// Computes an occurrence's { top, height } within a single day's column, in
// pixels, given the day being rendered — heights are floored to
// MIN_BLOCK_MINUTES worth of pixels so a very short (or point-in-time, e.g.
// a task due date rendered in the grid) occurrence stays tappable.
export function getBlockLayout(occurrence, dayDate) {
  const startMinutes = minutesFromMidnight(occurrence.startTime, dayDate);
  const endMinutes = Math.max(
    minutesFromMidnight(occurrence.endTime ?? occurrence.startTime, dayDate),
    startMinutes + MIN_BLOCK_MINUTES
  );
  return {
    top: minutesToY(startMinutes),
    height: minutesToY(endMinutes - startMinutes),
  };
}

function findRoot(parents, i) {
  while (parents[i] !== i) {
    parents[i] = parents[parents[i]]; // path halving
    i = parents[i];
  }
  return i;
}

function union(parents, a, b) {
  const rootA = findRoot(parents, a);
  const rootB = findRoot(parents, b);
  if (rootA !== rootB) parents[rootA] = rootB;
}

// Google-Calendar-style side-by-side layout for occurrences that overlap in
// time. Two passes:
// 1. Union-find groups occurrences into clusters of *transitively*
//    overlapping items (A overlaps B, B overlaps C -> all three share one
//    cluster, even if A and C don't directly overlap) — a plain pairwise
//    check would under-widen items like C in that chain.
// 2. Within each cluster, greedy column assignment (place each item in the
//    first column whose last-placed item has already ended) determines how
//    many side-by-side slots that cluster needs; every item in the cluster
//    renders at that same width.
export function assignOverlapColumns(occurrences, dayDate) {
  const items = occurrences.map((o, originalIndex) => ({ occurrence: o, originalIndex, ...getBlockLayout(o, dayDate) }));
  const parents = items.map((_, i) => i);

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const overlaps = items[i].top < items[j].top + items[j].height && items[j].top < items[i].top + items[i].height;
      if (overlaps) union(parents, i, j);
    }
  }

  const clusters = new Map(); // root index -> item indices
  items.forEach((_, i) => {
    const root = findRoot(parents, i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(i);
  });

  const result = new Array(items.length);
  for (const memberIndices of clusters.values()) {
    const members = memberIndices.map((i) => items[i]).sort((a, b) => a.top - b.top || a.height - b.height);
    const columnEnds = [];

    for (const member of members) {
      let columnIndex = columnEnds.findIndex((endY) => endY <= member.top);
      if (columnIndex === -1) {
        columnIndex = columnEnds.length;
        columnEnds.push(member.top + member.height);
      } else {
        columnEnds[columnIndex] = member.top + member.height;
      }
      result[member.originalIndex] = { ...member.occurrence, column: columnIndex, columnCount: 0 };
    }

    const columnCount = columnEnds.length;
    for (const member of members) {
      result[member.originalIndex].columnCount = columnCount;
    }
  }

  return result;
}
