import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { ProgressRing } from '../../Habits/components/ProgressRing';
import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useProject, useDeleteProject, useRecalculateProjectProgress } from '../hooks/useProjects';
import { useMilestoneList } from '../hooks/useMilestones';
import { useLinksForOwner } from '../hooks/useGoalLinks';
import { PROJECT_STATUS } from '../constants/goalConstants';
import { ProjectFormSheet } from '../components/ProjectFormSheet';
import { MilestoneCard } from '../components/MilestoneCard';
import { MilestoneFormSheet } from '../components/MilestoneFormSheet';
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

export function ProjectDetailScreen() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [showEdit, setShowEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [showLinkPicker, setShowLinkPicker] = useState(false);

  const { data: project, isLoading } = useProject(projectId);
  const { data: milestonesData } = useMilestoneList({ project: projectId });
  const milestones = milestonesData ?? EMPTY_ARRAY;
  const { data: links } = useLinksForOwner('project', projectId);

  const deleteProject = useDeleteProject();
  const recalculate = useRecalculateProjectProgress();

  if (isLoading || !project) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <Spinner size={24} />
        </div>
      </Screen>
    );
  }

  const statusMeta = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.not_started;
  const color = project.color ?? '#2563eb';

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-5xl">
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <div className="flex flex-row items-center">
          <button type="button" onClick={() => setShowEdit(true)} aria-label="Edit project" className="mr-4">
            <Icon name="create-outline" size={22} color="#64748b" />
          </button>
          <button type="button" onClick={() => setShowMenu(true)} aria-label="Project actions">
            <Icon name="ellipsis-horizontal" size={22} color="#64748b" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center px-6 pb-4 pt-2">
        <ProgressRing size={96} strokeWidth={7} progress={(project.progress ?? 0) / 100} color={color}>
          <span className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(project.progress ?? 0)}%</span>
        </ProgressRing>

        <div className="mt-3 flex flex-row items-center">
          {project.emoji ? <span className="mr-1.5 text-lg">{project.emoji}</span> : <Icon name={project.icon || 'folder-outline'} size={18} color={color} />}
          <p className="text-center text-xl font-bold text-gray-900 dark:text-white">{project.name}</p>
        </div>

        <div className="mt-1.5 flex flex-row items-center">
          <div className="rounded-full px-1.5 py-0.5" style={{ backgroundColor: `${statusMeta.color}20` }}>
            <span className="text-[10px] font-semibold" style={{ color: statusMeta.color }}>{statusMeta.label}</span>
          </div>
        </div>

        {project.targetDate ? (
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">Target: {dayjs(project.targetDate).format('MMM D, YYYY')}</p>
        ) : null}

        {project.description ? (
          <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
        ) : null}
      </div>

      <SectionHeader title="Milestones" onAdd={() => setShowMilestoneForm(true)} />
      {milestones.length === 0 ? (
        <p className="px-4 text-xs text-gray-400 dark:text-gray-500">No milestones yet.</p>
      ) : (
        milestones.map((m) => <MilestoneCard key={m._id} milestone={m} onPress={setEditingMilestone} />)
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
        onClick={() => recalculate.mutate({ id: projectId })}
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

      <ProjectFormSheet visible={showEdit} project={project} onClose={() => setShowEdit(false)} />
      <MilestoneFormSheet
        visible={showMilestoneForm || Boolean(editingMilestone)}
        milestone={editingMilestone}
        defaultProjectId={projectId}
        onClose={() => {
          setShowMilestoneForm(false);
          setEditingMilestone(null);
        }}
      />
      <LinkPickerSheet visible={showLinkPicker} ownerType="project" ownerId={projectId} onClose={() => setShowLinkPicker(false)} />

      <Modal visible={showMenu} onClose={() => setShowMenu(false)} title={project.name}>
        <button
          type="button"
          onClick={() => {
            setShowMenu(false);
            deleteProject.mutate(projectId, { onSuccess: () => navigate(-1) });
          }}
          className="flex w-full flex-row items-center py-3.5 text-left"
        >
          <Icon name="trash-outline" size={19} color="#ef4444" />
          <span className="ml-3 text-base text-danger">Delete Project</span>
        </button>
      </Modal>
    </Screen>
  );
}
