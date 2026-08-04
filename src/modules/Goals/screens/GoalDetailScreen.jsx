import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { ProgressRing } from '../../Habits/components/ProgressRing';
import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useGoal, useDeleteGoal, useRecalculateGoalProgress } from '../hooks/useGoals';
import { useProjectList } from '../hooks/useProjects';
import { useMilestoneList } from '../hooks/useMilestones';
import { useLinksForOwner } from '../hooks/useGoalLinks';
import { GOAL_TYPES, GOAL_STATUS } from '../constants/goalConstants';
import { GoalFormSheet } from '../components/GoalFormSheet';
import { GoalInsightsCard } from '../components/GoalInsightsCard';
import { KeyResultRow } from '../components/KeyResultRow';
import { ProjectCard } from '../components/ProjectCard';
import { MilestoneCard } from '../components/MilestoneCard';
import { MilestoneFormSheet } from '../components/MilestoneFormSheet';
import { ProjectFormSheet } from '../components/ProjectFormSheet';
import { LinkPickerSheet } from '../components/LinkPickerSheet';

function Spinner({ size = 16, color = '#2563eb' }) {
  return (
    <div
      className="animate-spin rounded-full border-2"
      style={{ width: size, height: size, borderColor: `${color}40`, borderTopColor: color }}
    />
  );
}

function SectionHeader({ title, onAdd }) {
  return (
    <div className="mb-1.5 mt-5 flex flex-row items-center justify-between px-4">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{title}</p>
      {onAdd ? (
        <button type="button" onClick={onAdd} className="flex flex-row items-center">
          <Icon name="add-circle-outline" size={16} color="#2563eb" />
          <span className="ml-1 text-xs font-semibold text-primary-600">Add</span>
        </button>
      ) : null}
    </div>
  );
}

export function GoalDetailScreen() {
  const navigate = useNavigate();
  const { goalId } = useParams();

  const [showEdit, setShowEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);

  const { data: goal, isLoading } = useGoal(goalId);
  const { data: projectsData } = useProjectList({ goal: goalId });
  const projects = projectsData ?? EMPTY_ARRAY;
  const { data: milestonesData } = useMilestoneList({ goal: goalId });
  const milestones = milestonesData ?? EMPTY_ARRAY;
  const { data: links } = useLinksForOwner('goal', goalId);

  const deleteGoal = useDeleteGoal();
  const recalculate = useRecalculateGoalProgress();

  const handleOpenProject = useCallback((project) => navigate(`/goals/projects/${project._id}`), [navigate]);
  const noop = useCallback(() => {}, []);

  if (isLoading || !goal) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <Spinner size={24} />
        </div>
      </Screen>
    );
  }

  const typeMeta = GOAL_TYPES[goal.type] ?? GOAL_TYPES.custom;
  const statusMeta = GOAL_STATUS[goal.status] ?? GOAL_STATUS.not_started;
  const color = goal.color ?? '#2563eb';

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-5xl">
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <div className="flex flex-row items-center">
          <button type="button" onClick={() => setShowEdit(true)} aria-label="Edit goal" className="mr-4">
            <Icon name="create-outline" size={22} color="#64748b" />
          </button>
          <button type="button" onClick={() => setShowMenu(true)} aria-label="Goal actions">
            <Icon name="ellipsis-horizontal" size={22} color="#64748b" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center px-6 pb-4 pt-2">
        <ProgressRing size={104} strokeWidth={8} progress={(goal.progress ?? 0) / 100} color={color}>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(goal.progress ?? 0)}%</span>
        </ProgressRing>

        <div className="mt-3 flex flex-row items-center">
          {goal.emoji ? <span className="mr-1.5 text-xl">{goal.emoji}</span> : <Icon name={goal.icon || typeMeta.icon} size={20} color={color} />}
          <p className="text-center text-xl font-bold text-gray-900 dark:text-white">{goal.title}</p>
        </div>

        <div className="mt-1.5 flex flex-row items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">{typeMeta.label}</span>
          <div className="mx-1.5 h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="rounded-full px-1.5 py-0.5" style={{ backgroundColor: `${statusMeta.color}20` }}>
            <span className="text-[10px] font-semibold" style={{ color: statusMeta.color }}>{statusMeta.label}</span>
          </div>
        </div>

        {goal.targetDate ? (
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">Target: {dayjs(goal.targetDate).format('MMM D, YYYY')}</p>
        ) : null}

        {goal.description ? (
          <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
        ) : null}
      </div>

      <div className="px-4">
        <GoalInsightsCard goalId={goalId} />
      </div>

      {goal.keyResults?.length > 0 ? (
        <>
          <SectionHeader title="Key Results" />
          <div className="px-4">
            {goal.keyResults.map((kr) => (
              <KeyResultRow key={kr._id} goalId={goalId} keyResult={kr} />
            ))}
          </div>
        </>
      ) : null}

      <SectionHeader title="Milestones" onAdd={() => setShowMilestoneForm(true)} />
      {milestones.length === 0 ? (
        <p className="px-4 text-xs text-gray-400 dark:text-gray-500">No milestones yet.</p>
      ) : (
        milestones.map((m) => <MilestoneCard key={m._id} milestone={m} onPress={noop} />)
      )}

      <SectionHeader title="Projects" onAdd={() => setShowProjectForm(true)} />
      {projects.length === 0 ? (
        <p className="px-4 text-xs text-gray-400 dark:text-gray-500">No projects yet.</p>
      ) : (
        projects.map((p) => <ProjectCard key={p._id} project={p} onPress={handleOpenProject} />)
      )}

      <SectionHeader title="Linked Tasks & Habits" onAdd={() => setShowLinkPicker(true)} />
      {(!links || links.length === 0) ? (
        <p className="px-4 pb-6 text-xs text-gray-400 dark:text-gray-500">Link tasks or habits to drive task/habit-based progress.</p>
      ) : (
        <div className="px-4 pb-6">
          {links.map((link) => (
            <div key={link._id} className="mb-1.5 flex flex-row items-center rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
              <Icon name={link.linkedType === 'task' ? 'checkbox-outline' : 'repeat-outline'} size={16} color="#64748b" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{link.linkedType === 'task' ? 'Task' : 'Habit'} linked</span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => recalculate.mutate({ id: goalId })}
        disabled={recalculate.isPending}
        className="mx-4 mb-8 flex flex-row items-center justify-center rounded-xl border border-gray-200 py-3 dark:border-gray-700"
      >
        {recalculate.isPending ? (
          <Spinner size={16} />
        ) : (
          <>
            <Icon name="refresh-outline" size={16} color="#2563eb" />
            <span className="ml-2 text-sm font-semibold text-primary-600">Recalculate Progress</span>
          </>
        )}
      </button>
      </div>
      </PageContainer>

      <GoalFormSheet visible={showEdit} goal={goal} onClose={() => setShowEdit(false)} />
      <MilestoneFormSheet visible={showMilestoneForm} milestone={null} defaultGoalId={goalId} onClose={() => setShowMilestoneForm(false)} />
      <ProjectFormSheet visible={showProjectForm} project={null} defaultGoalId={goalId} onClose={() => setShowProjectForm(false)} />
      <LinkPickerSheet visible={showLinkPicker} ownerType="goal" ownerId={goalId} onClose={() => setShowLinkPicker(false)} />

      <Modal visible={showMenu} onClose={() => setShowMenu(false)} title={goal.title}>
        <button
          type="button"
          onClick={() => {
            setShowMenu(false);
            deleteGoal.mutate(goalId, { onSuccess: () => navigate(-1) });
          }}
          className="flex w-full flex-row items-center py-3.5 text-left"
        >
          <Icon name="trash-outline" size={19} color="#ef4444" />
          <span className="ml-3 text-base text-danger">Delete Goal</span>
        </button>
      </Modal>
    </Screen>
  );
}
