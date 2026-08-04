import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { DateField } from '../../../components/ui/DateField';
import { PROJECT_STATUS, GOAL_COLORS } from '../constants/goalConstants';
import { useGoalList } from '../hooks/useGoals';
import { useCreateProject, useDeleteProject, useUpdateProject } from '../hooks/useProjects';

function defaultFormState(goalId) {
  return { name: '', description: '', goal: goalId ?? null, status: 'not_started', startDate: null, targetDate: null, color: null, emoji: null };
}

function projectToFormState(project) {
  return {
    name: project.name,
    description: project.description ?? '',
    goal: project.goal ?? null,
    status: project.status ?? 'not_started',
    startDate: project.startDate ? new Date(project.startDate) : null,
    targetDate: project.targetDate ? new Date(project.targetDate) : null,
    color: project.color ?? null,
    emoji: project.emoji ?? null,
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

export function ProjectFormSheet({ visible, onClose, project, defaultGoalId }) {
  const [form, setForm] = useState(() => (project ? projectToFormState(project) : defaultFormState(defaultGoalId)));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const nameInputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setForm(project ? projectToFormState(project) : defaultFormState(defaultGoalId));
      setSubmitAttempted(false);
      setSaveError(null);
      isSubmittingRef.current = false;
      setTimeout(() => nameInputRef.current?.focus(), 350);
    }
  }, [visible, project, defaultGoalId]);

  const { data: goalsData } = useGoalList({});
  const goals = goalsData ?? [];

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const isSaving = createProject.isPending || updateProject.isPending;

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    if (saveError) setSaveError(null);
  };

  const showNameError = submitAttempted && !form.name.trim();

  const handleSubmit = () => {
    if (isSubmittingRef.current || isSaving) return;
    setSubmitAttempted(true);
    if (!form.name.trim()) {
      nameInputRef.current?.focus();
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
      setSaveError(error?.message ?? 'Could not save this project. Please try again.');
    };

    if (project) {
      updateProject.mutate({ id: project._id, payload }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createProject.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!project) return;
    deleteProject.mutate(project._id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={project ? 'Edit Project' : 'New Project'}>
      <div>
        <ErrorBanner message={saveError} />

        <div className="mb-4 flex flex-row items-center">
          <input
            value={form.emoji ?? ''}
            onChange={(e) => set({ emoji: e.target.value.slice(0, 2) || null })}
            placeholder="📁"
            aria-label="Project emoji"
            className="mr-3 h-12 w-12 rounded-xl border border-gray-300 bg-transparent text-center text-xl outline-none placeholder:text-gray-400 dark:border-gray-700"
          />
          <input
            ref={nameInputRef}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Project name *"
            aria-label="Project name"
            className={`flex-1 bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white ${
              showNameError ? 'border-b-2 border-danger pb-1 placeholder:text-danger' : ''
            }`}
          />
        </div>
        {showNameError ? <p className="mb-3 -mt-2 text-xs font-medium text-danger">Name is required</p> : null}

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
          <textarea
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="What is this project about?"
            aria-label="Description"
            className="min-h-[60px] w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
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

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
          <div className="flex flex-row flex-wrap gap-1.5">
            {Object.keys(PROJECT_STATUS).map((key) => {
              const meta = PROJECT_STATUS[key];
              const isSelected = form.status === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => set({ status: key })}
                  className={`rounded-full border px-3 py-1.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'}`}
                >
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <DateField label="Start date" value={form.startDate} onChange={(startDate) => set({ startDate })} mode="date" />
        <DateField label="Target date" value={form.targetDate} onChange={(targetDate) => set({ targetDate })} mode="date" />

        <div className="mb-6">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Color</p>
          <div className="flex flex-row flex-wrap items-center">
            {GOAL_COLORS.map((swatch) => (
              <button
                type="button"
                key={swatch}
                onClick={() => set({ color: form.color === swatch ? null : swatch })}
                aria-label={`Color ${swatch}`}
                aria-pressed={form.color === swatch}
                className="mb-2 mr-2 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: swatch, opacity: form.color && form.color !== swatch ? 0.4 : 1 }}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !form.name.trim()}
          className={`flex h-12 w-full flex-row items-center justify-center rounded-xl bg-primary-600 ${
            isSaving || !form.name.trim() ? 'opacity-50' : ''
          }`}
        >
          {isSaving ? <Spinner /> : <span className="text-base font-semibold text-white">Save</span>}
        </button>

        {project ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteProject.isPending}
            className="mb-4 mt-3 flex w-full items-center justify-center py-2"
          >
            {deleteProject.isPending ? <Spinner color="#ef4444" /> : <span className="text-sm font-medium text-danger">Delete Project</span>}
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
