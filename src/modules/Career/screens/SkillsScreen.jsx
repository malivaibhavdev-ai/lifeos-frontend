import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useSkillList } from '../hooks/useSkills';
import { useRecommendedSkills } from '../hooks/useCareerHub';
import { SKILL_CATEGORIES } from '../constants/careerConstants';
import { SkillFormSheet } from '../components/SkillFormSheet';

export function SkillsScreen() {
  const navigate = useNavigate();
  const { data: skills } = useSkillList();
  const { data: recommended } = useRecommendedSkills();
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const items = skills ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Skills</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600" aria-label="Add skill">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 pt-2">
          {recommended?.length ? (
            <div className="mb-4 rounded-xl bg-amber-50 p-3 dark:bg-amber-950">
              <p className="mb-1 text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">Focus On Next</p>
              {recommended.map((r) => (
                <p key={r.skillId} className="text-xs text-amber-800 dark:text-amber-200">• {r.name}: {r.reason}</p>
              ))}
            </div>
          ) : null}

          {items.length === 0 ? (
            <EmptyState icon="flash-outline" title="No skills tracked yet" description="Add a skill to track your progress toward your target level." ctaLabel="Add Skill" onCtaPress={() => setShowForm(true)} />
          ) : (
            <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {items.map((skill) => (
                <button type="button" key={skill._id} onClick={() => setEditingSkill(skill)} className="mb-2 flex w-full flex-col rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 sm:mb-0">
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{skill.name}</span>
                    <span className="text-xs text-gray-400">{SKILL_CATEGORIES[skill.category]?.label}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${skill.progress}%` }} />
                  </div>
                  <span className="mt-1 text-xs capitalize text-gray-400 dark:text-gray-500">{skill.level} → {skill.targetLevel}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <SkillFormSheet visible={showForm || Boolean(editingSkill)} onClose={() => { setShowForm(false); setEditingSkill(null); }} skill={editingSkill} />
      </PageContainer>
    </Screen>
  );
}
