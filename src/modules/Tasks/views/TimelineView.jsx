import { EmptyState } from '../../../components/ui/EmptyState';
import { useTimelineData } from '../hooks/useTimelineData';

// Architecture-ready, rendering deferred (per the Phase 3 scope). The data
// layer (useTimelineData) is already wired up and pulls real task rows with
// resolved start/end dates — a future pass only needs to build the
// proportional-scaling visual layer on top of `rows`, not re-derive the data.
export function TimelineView() {
  const { rows } = useTimelineData();

  return (
    <div className="flex flex-1 flex-col">
      <EmptyState
        icon="git-commit-outline"
        title="Timeline view is coming soon"
        description={`${rows.length} task${rows.length === 1 ? '' : 's'} ready to plot once this view is built — the data layer is already wired up.`}
      />
    </div>
  );
}
