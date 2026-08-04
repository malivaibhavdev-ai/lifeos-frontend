import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ProductivityDashboardStrip } from '../components/ProductivityDashboardStrip';
import { SmartListTabs } from '../components/SmartListTabs';
import { QuickAddBar } from '../components/QuickAddBar';
import { FilterSheet } from '../components/FilterSheet';
import { SortMenu } from '../components/SortMenu';
import { ViewSwitcherSheet } from '../components/ViewSwitcherSheet';
import { getViewConfig } from '../navigation/viewRegistry';
import { useBulkCompleteTasks, useBulkDeleteTasks, useTaskCounts } from '../hooks/useTasks';
import { useTaskUiStore } from '../store/taskUiStore';
import { registerQuickAddFocus } from '../utils/quickAddFocusRegistry';

export function TaskWorkspaceScreen() {
  const quickAddRef = useRef(null);

  const viewMode = useTaskUiStore((s) => s.viewMode);
  const setViewMode = useTaskUiStore((s) => s.setViewMode);
  const activeList = useTaskUiStore((s) => s.activeList);
  const setActiveList = useTaskUiStore((s) => s.setActiveList);
  const searchQuery = useTaskUiStore((s) => s.searchQuery);
  const setSearchQuery = useTaskUiStore((s) => s.setSearchQuery);
  const filters = useTaskUiStore((s) => s.filters);
  const selectedIds = useTaskUiStore((s) => s.selectedIds);
  const isSelectionMode = useTaskUiStore((s) => s.isSelectionMode);
  const clearSelection = useTaskUiStore((s) => s.clearSelection);

  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showViewSwitcher, setShowViewSwitcher] = useState(false);

  const { data: counts } = useTaskCounts();
  const bulkComplete = useBulkCompleteTasks();
  const bulkDelete = useBulkDeleteTasks();

  useEffect(() => {
    registerQuickAddFocus(() => quickAddRef.current?.focus());
  }, []);

  const hasActiveFilters = Boolean(filters.priority || filters.energyLevel || filters.category || filters.tags.length);
  const activeView = getViewConfig(viewMode);
  const ActiveViewComponent = activeView.component;

  return (
    <Screen>
      {isSelectionMode ? (
        <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
          <div className="flex flex-row items-center gap-3">
            <button
              type="button"
              onClick={clearSelection}
              aria-label="Cancel selection"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
            >
              <Icon name="close" size={24} color="#64748b" />
            </button>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedIds.length} selected</p>
          </div>
          <div className="flex flex-row items-center gap-5">
            <button
              type="button"
              onClick={() => {
                bulkComplete.mutate(selectedIds);
                clearSelection();
              }}
              aria-label="Complete selected tasks"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
            >
              <Icon name="checkmark-done" size={22} color="#2563eb" />
            </button>
            <button
              type="button"
              onClick={() => {
                bulkDelete.mutate(selectedIds);
                clearSelection();
              }}
              aria-label="Delete selected tasks"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
            >
              <Icon name="trash" size={22} color="#ef4444" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
          <button
            type="button"
            onClick={() => setShowViewSwitcher(true)}
            className="flex flex-row items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
            aria-label="Switch view"
          >
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{activeView.label}</span>
            <Icon name="chevron-down" size={18} color="#94a3b8" style={{ marginLeft: 4, marginTop: 4 }} />
          </button>
          <div className="flex flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => setShowSearch((v) => !v)}
              aria-label="Search tasks"
              aria-pressed={showSearch}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
            >
              <Icon name="search" size={22} color={showSearch ? '#2563eb' : '#64748b'} />
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              aria-label="Filter tasks"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
            >
              <Icon name="filter" size={22} color={hasActiveFilters ? '#2563eb' : '#64748b'} />
            </button>
            <button
              type="button"
              onClick={() => setShowSort(true)}
              aria-label="Sort tasks"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
            >
              <Icon name="swap-vertical" size={22} color="#64748b" />
            </button>
          </div>
        </div>
      )}

      {!isSelectionMode ? <ProductivityDashboardStrip /> : null}

      {activeView.showSmartLists ? <SmartListTabs activeKey={activeList} onChange={setActiveList} counts={counts} /> : null}

      {showSearch && !isSelectionMode ? (
        <div className="mx-4 mb-2 mt-1 flex flex-row items-center rounded-xl bg-gray-100 px-3 dark:bg-gray-900">
          <Icon name="search" size={16} color="#94a3b8" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks"
            aria-label="Search tasks"
            autoFocus
            className="ml-2 flex-1 bg-transparent py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
            >
              <Icon name="close-circle" size={16} color="#94a3b8" />
            </button>
          ) : null}
        </div>
      ) : null}

      {/* The active view is the only flex:1 claimant between the header
          stack and the quick-add bar — same explicit-flex discipline as
          the rest of the workspace, so no view can introduce the "large
          empty gap" bug class that showed up earlier in this project. */}
      <div className="flex min-h-0 flex-1 flex-col">
        <ActiveViewComponent />
      </div>

      <QuickAddBar ref={quickAddRef} />

      <FilterSheet visible={showFilters} onClose={() => setShowFilters(false)} />
      <SortMenu visible={showSort} onClose={() => setShowSort(false)} />
      <ViewSwitcherSheet
        visible={showViewSwitcher}
        activeKey={viewMode}
        onSelect={setViewMode}
        onClose={() => setShowViewSwitcher(false)}
      />
    </Screen>
  );
}
