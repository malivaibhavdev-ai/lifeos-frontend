import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useCreatePortfolioProject, useUpdatePortfolioProject, useDeletePortfolioProject } from '../hooks/usePortfolioProjects';

function defaultFormState(project) {
  if (!project) return { name: '', liveUrl: '', githubUrl: '', description: '', technologies: '' };
  return {
    name: project.name, liveUrl: project.liveUrl ?? '', githubUrl: project.githubUrl ?? '',
    description: project.description ?? '', technologies: (project.technologies ?? []).join(', '),
  };
}

export function PortfolioProjectFormSheet({ visible, onClose, project }) {
  const [form, setForm] = useState(() => defaultFormState(project));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createProject = useCreatePortfolioProject();
  const updateProject = useUpdatePortfolioProject();
  const deleteProject = useDeletePortfolioProject();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(project)); setSaveError(null); }
  }, [visible, project]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) return setSaveError('Project name is required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = { ...form, technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean) };
      if (project) await updateProject.mutateAsync({ id: project._id, ...payload });
      else await createProject.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save project');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={project ? 'Edit Project' : 'Add Project'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project name *" aria-label="Project name" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="Live URL" aria-label="Live URL" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="GitHub URL" aria-label="GitHub URL" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="Technologies (comma separated)" aria-label="Technologies (comma separated)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" aria-label="Description" className="mb-3 h-24 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      {project ? (
        <button type="button" onClick={() => deleteProject.mutate(project._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
