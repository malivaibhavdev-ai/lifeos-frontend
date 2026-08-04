import { ListView } from '../views/ListView';
import { BoardView } from '../views/BoardView';
import { CalendarView } from '../views/CalendarView';
import { MatrixView } from '../views/MatrixView';
import { TimelineView } from '../views/TimelineView';

// Adding a new view (e.g. a future "Gantt" or user-defined custom view) is
// exactly one entry here — the workspace shell (TaskWorkspaceScreen) and the
// view-switcher menu both derive entirely from this array, so neither needs
// to change. `showSmartLists` controls whether the smart-list chip row makes
// sense for a given view — Calendar/Matrix/Timeline organize *all* tasks
// their own way, so the chip row would be redundant there.
export const VIEW_REGISTRY = [
  { key: 'list', label: 'List', icon: 'list-outline', component: ListView, showSmartLists: true },
  { key: 'board', label: 'Board', icon: 'albums-outline', component: BoardView, showSmartLists: false },
  { key: 'calendar', label: 'Calendar', icon: 'calendar-outline', component: CalendarView, showSmartLists: false },
  { key: 'matrix', label: 'Matrix', icon: 'grid-outline', component: MatrixView, showSmartLists: false },
  { key: 'timeline', label: 'Timeline', icon: 'git-commit-outline', component: TimelineView, showSmartLists: false },
];

export function getViewConfig(key) {
  return VIEW_REGISTRY.find((v) => v.key === key) ?? VIEW_REGISTRY[0];
}
