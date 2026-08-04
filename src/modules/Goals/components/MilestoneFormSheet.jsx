import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Icon } from '../../../components/ui/Icon';
import { DateField } from '../../../components/ui/DateField';
import { COMPLETION_RULES } from '../constants/goalConstants';
import { useGoalList } from '../hooks/useGoals';
import { useProjectList } from '../hooks/useProjects';
import { useCreateMilestone, useDeleteMilestone, useMilestoneList, useUpdateMilestone } from '../hooks/useMilestones';

function defaultFormState({ projectId, goalId }) {
  return {
    title: '',
    description: '',
    project: projectId ?? null,
    goal: goalId ?? null,
    dueDate: null,
    completionRule: 'manual',
    dependsOn: [],
  };
}

function milestoneToFormState(milestone) {
  return {
    title: milestone.title,
    description: milestone.description ?? '',
    project: milestone.project ?? null,
    goal: milestone.goal ?? null,
    dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
    completionRule: milestone.completionRule ?? 'manual',
    dependsOn: milestone.dependsOn ?? [],
  };
}

function Spinner({ size = 16, color = '#fff' }) {
  return (
    <div
      className="animate-spin rounded-full border-2"
      style={{ width: size, height: size, borderColor: `${color}40`, borderTopColor: color }}
    />
  );
}

export function MilestoneFormSheet({ visible, onClose, milestone, defaultProjectId, defaultGoalId }) {
  const [form, setForm] = useState(() =>
    milestone ? milestoneToFormState(milestone) : defaultFormState({ projectId: defaultProjectId, goalId: defaultGoalId })
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const titleInputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setForm(milestone ? milestoneToFormState(milestone) : defaultFormState({ projectId: defaultProjectId, goalId: defaultGoalId }));
      setSubmitAttempted(false);
      setSaveError(null);
      isSubmittingRef.current = false;
      setTimeout(() => titleInputRef.current?.focus(), 350);
    }
  }, [visible, milestone, defaultProjectId, defaultGoalId]);

  const { data: goalsData } = useGoalList({});
  const goals = goalsData ?? [];
  const { data: projectsData } = useProjectList(form.goal ? { goal: form.goal } : {});
  const projects = projectsData ?? [];

  const { data: siblingsData } = useMilestoneList(form.project ? { project: form.project } : form.goal ? { goal: form.goal } : {});
  const siblings = (siblingsData ?? []).filter((m) => m._id !== milestone?._id);

  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();
  const isSaving = createMilestone.isPending || updateMilestone.isPending;

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    if (saveError) setSaveError(null);
  };

  const toggleDependsOn = (id) =>
    set({ dependsOn: form.dependsOn.includes(id) ? form.dependsOn.filter((d) => d !== id) : [...form.dependsOn, id] });

  const showTitleError = submitAttempted && !form.title.trim();

  const handleSubmit = () => {
    if (isSubmittingRef.current || isSaving) return;
    setSubmitAttempted(true);
    if (!form.title.trim()) {
      titleInputRef.current?.focus();
      return;
    }

    isSubmittingRef.current = true;
    setSaveError(null);

    const payload = { ...form, description: form.description.trim() || null };
    const handleSuccess = () => {
      isSubmittingRef.current = false;
      onClose();
    };
    const handleError = (error) => {
      isSubmittingRef.current = false;
      setSaveError(error?.message ?? 'Could not save this milestone. Please try again.');
    };

    if (milestone) {
      updateMilestone.mutate({ id: milestone._id, payload }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createMilestone.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!milestone) return;
    deleteMilestone.mutate(milestone._id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={milestone ? 'Edit Milestone' : 'New Milestone'}>
      <div>
        <ErrorBanner message={saveError} />

        <div className="mb-4">
          <input
            ref={titleInputRef}
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Milestone title *"
            aria-label="Milestone title"
            className={`w-full bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white ${
              showTitleError ? 'border-b-2 border-danger pb-1 placeholder:text-danger' : ''
            }`}
          />
          {showTitleError ? <p className="mt-2 text-xs font-medium text-danger">Title is required</p> : null}
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
          <textarea
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Optional notes"
            aria-label="Description"
            className="min-h-[50px] w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
          />
        </div>

        {goals.length > 0 ? (
          <div className="mb-4">
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Goal</p>
            <div className="flex flex-row gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => set({ goal: null })}
                className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${!form.goal ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${!form.goal ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>None</span>
              </button>
              {goals.map((g) => {
                const isSelected = form.goal === g._id;
                return (
                  <button
                    type="button"
                    key={g._id}
                    onClick={() => set({ goal: g._id })}
                    className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{g.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {projects.length > 0 ? (
          <div className="mb-4">
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Project</p>
            <div className="flex flex-row gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => set({ project: null })}
                className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${!form.project ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${!form.project ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>None</span>
              </button>
              {projects.map((p) => {
                const isSelected = form.project === p._id;
                return (
                  <button
                    type="button"
                    key={p._id}
                    onClick={() => set({ project: p._id })}
                    className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <DateField label="Due date" value={form.dueDate} onChange={(dueDate) => set({ dueDate })} mode="date" />

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Completion rule</p>
          <div className="flex flex-row flex-wrap gap-1.5">
            {Object.keys(COMPLETION_RULES).map((key) => {
              const isSelected = form.completionRule === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => set({ completionRule: key })}
                  className={`rounded-full border px-3 py-1.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'}`}
                >
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{COMPLETION_RULES[key].label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {siblings.length > 0 ? (
          <div className="mb-6">
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Depends on</p>
            {siblings.map((s) => {
              const isSelected = form.dependsOn.includes(s._id);
              return (
                <button
                  type="button"
                  key={s._id}
                  onClick={() => toggleDependsOn(s._id)}
                  className="flex w-full flex-row items-center py-2 text-left"
                >
                  <Icon name={isSelected ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={isSelected ? '#2563eb' : '#cbd5e1'} />
                  <span className="ml-2.5 truncate text-sm text-gray-900 dark:text-white">{s.title}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !form.title.trim()}
          className={`flex h-12 w-full flex-row items-center justify-center rounded-xl bg-primary-600 ${
            isSaving || !form.title.trim() ? 'opacity-50' : ''
          }`}
        >
          {isSaving ? <Spinner /> : <span className="text-base font-semibold text-white">Save</span>}
        </button>

        {milestone ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMilestone.isPending}
            className="mb-4 mt-3 flex w-full items-center justify-center py-2"
          >
            {deleteMilestone.isPending ? <Spinner color="#ef4444" /> : <span className="text-sm font-medium text-danger">Delete Milestone</span>}
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
