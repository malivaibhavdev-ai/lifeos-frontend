import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { SKILL_CATEGORIES, SKILL_CATEGORY_ORDER, SKILL_LEVELS } from '../constants/careerConstants';
import { useCreateSkill, useUpdateSkill, useDeleteSkill } from '../hooks/useSkills';

function defaultFormState(skill) {
  if (!skill) return { name: '', category: 'technical', level: 'beginner', targetLevel: 'advanced', progress: '0' };
  return {
    name: skill.name, category: skill.category, level: skill.level, targetLevel: skill.targetLevel,
    progress: String(skill.progress ?? 0),
  };
}

export function SkillFormSheet({ visible, onClose, skill }) {
  const [form, setForm] = useState(() => defaultFormState(skill));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(skill)); setSaveError(null); }
  }, [visible, skill]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) return setSaveError('Skill name is required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = { ...form, progress: Number(form.progress) || 0 };
      if (skill) await updateSkill.mutateAsync({ id: skill._id, ...payload });
      else await createSkill.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save skill');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={skill ? 'Edit Skill' : 'Add Skill'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Skill name *" aria-label="Skill name" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
      <div className="mb-3 flex flex-row overflow-x-auto">
        {SKILL_CATEGORY_ORDER.map((key) => {
          const isSelected = form.category === key;
          return (
            <button type="button" key={key} onClick={() => setForm({ ...form, category: key })} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{SKILL_CATEGORIES[key].label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-3 flex flex-row">
        <div className="mr-2 flex-1">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Level</p>
          <div className="flex flex-row flex-wrap">
            {SKILL_LEVELS.map((lvl) => (
              <button type="button" key={lvl} onClick={() => setForm({ ...form, level: lvl })} className={`mb-1 mr-1 rounded-full border px-2.5 py-1.5 ${form.level === lvl ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
                <span className={`text-xs font-medium capitalize ${form.level === lvl ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{lvl}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Target</p>
          <div className="flex flex-row flex-wrap">
            {SKILL_LEVELS.map((lvl) => (
              <button type="button" key={lvl} onClick={() => setForm({ ...form, targetLevel: lvl })} className={`mb-1 mr-1 rounded-full border px-2.5 py-1.5 ${form.targetLevel === lvl ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
                <span className={`text-xs font-medium capitalize ${form.targetLevel === lvl ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{lvl}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Progress: {form.progress}%</p>
      <input value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value.replace(/[^0-9]/g, '') })} inputMode="numeric" aria-label="Progress percentage" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      {skill ? (
        <button type="button" onClick={() => deleteSkill.mutate(skill._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
