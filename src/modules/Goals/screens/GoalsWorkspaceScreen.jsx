import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useGoalList, useArchiveGoal } from '../hooks/useGoals';
import { useProjectList, useArchiveProject } from '../hooks/useProjects';
import { useVisionList } from '../hooks/useVisions';
import { useLifeAreaList } from '../hooks/useLifeAreas';
import { useGoalUiStore } from '../store/goalUiStore';
import { GoalCard } from '../components/GoalCard';
import { ProjectCard } from '../components/ProjectCard';
import { GoalFormSheet } from '../components/GoalFormSheet';
import { ProjectFormSheet } from '../components/ProjectFormSheet';
import { VisionFormSheet } from '../components/VisionFormSheet';
import { LifeAreaFormSheet } from '../components/LifeAreaFormSheet';

const TABS = [
  { key: 'goals', label: 'Goals' },
  { key: 'projects', label: 'Projects' },
];

export function GoalsWorkspaceScreen() {
  const navigate = useNavigate();
  const workspaceTab = useGoalUiStore((s) => s.workspaceTab);
  const setWorkspaceTab = useGoalUiStore((s) => s.setWorkspaceTab);
  const lifeAreaFilter = useGoalUiStore((s) => s.lifeAreaFilter);
  const setLifeAreaFilter = useGoalUiStore((s) => s.setLifeAreaFilter);

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [actionGoal, setActionGoal] = useState(null);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [actionProject, setActionProject] = useState(null);

  const [visionSheet, setVisionSheet] = useState(null); // { vision } | { new: true } | null
  const [lifeAreaSheet, setLifeAreaSheet] = useState(null); // { lifeArea } | { new: true } | null

  const { data: goalsData, isLoading: goalsLoading } = useGoalList({ includeArchived: false });
  const goals = goalsData ?? EMPTY_ARRAY;
  const { data: projectsData, isLoading: projectsLoading } = useProjectList({ includeArchived: false });
  const projects = projectsData ?? EMPTY_ARRAY;
  const { data: visionsData } = useVisionList({});
  const visions = visionsData ?? EMPTY_ARRAY;
  const { data: lifeAreasData } = useLifeAreaList({});
  const lifeAreas = lifeAreasData ?? EMPTY_ARRAY;

  const archiveGoal = useArchiveGoal();
  const archiveProject = useArchiveProject();

  const visibleVisions = useMemo(
    () => (lifeAreaFilter ? visions.filter((v) => v.lifeArea === lifeAreaFilter) : visions),
    [visions, lifeAreaFilter]
  );

  const goalsByVision = useMemo(() => {
    const map = new Map();
    for (const v of visibleVisions) map.set(v._id, []);
    const unsorted = [];
    for (const g of goals) {
      if (g.vision && map.has(g.vision)) map.get(g.vision).push(g);
      else if (!g.vision && !lifeAreaFilter) unsorted.push(g);
    }
    return { map, unsorted };
  }, [goals, visibleVisions, lifeAreaFilter]);

  const handleOpenGoal = useCallback((goal) => navigate(`/goals/${goal._id}`), [navigate]);
  const handleOpenProject = useCallback((project) => navigate(`/goals/projects/${project._id}`), [navigate]);

  const renderGoalsTab = () => {
    const hasAnything = goals.length > 0;
    if (!goalsLoading && !hasAnything) {
      return (
        <EmptyState
          icon="flag-outline"
          title="No goals yet"
          description="Set a goal and break it down into projects and milestones."
          ctaLabel="New Goal"
          onCtaPress={() => setShowGoalForm(true)}
        />
      );
    }

    return (
      <div className="flex-1 min-h-0 overflow-y-auto pb-6">
        {lifeAreas.length > 0 ? (
          <div className="mb-3 flex flex-row gap-2 overflow-x-auto px-4 pb-1">
            <button
              type="button"
              onClick={() => setLifeAreaFilter(null)}
              className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${!lifeAreaFilter ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <span className={`text-sm font-medium ${!lifeAreaFilter ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>All</span>
            </button>
            {lifeAreas.map((la) => {
              const isSelected = lifeAreaFilter === la._id;
              return (
                <button
                  type="button"
                  key={la._id}
                  onClick={() => setLifeAreaFilter(la._id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setLifeAreaSheet({ lifeArea: la });
                  }}
                  className={`flex flex-shrink-0 flex-row items-center rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                  style={la.color && !isSelected ? { borderColor: la.color } : undefined}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{la.name}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setLifeAreaSheet({ new: true })}
              className="flex flex-shrink-0 flex-row items-center rounded-full border border-dashed border-gray-300 px-3 py-2 dark:border-gray-600"
            >
              <Icon name="add" size={14} color="#94a3b8" />
              <span className="ml-1 text-sm text-gray-400">Life Area</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLifeAreaSheet({ new: true })}
            className="mx-4 mb-3 flex flex-row items-center"
          >
            <Icon name="add-circle-outline" size={16} color="#94a3b8" />
            <span className="ml-1.5 text-xs text-gray-400">Organize goals into Life Areas</span>
          </button>
        )}

        {visibleVisions.map((vision) => {
          const visionGoals = goalsByVision.map.get(vision._id) ?? EMPTY_ARRAY;
          return (
            <div key={vision._id} className="mb-4">
              <div
                onContextMenu={(e) => {
                  e.preventDefault();
                  setVisionSheet({ vision });
                }}
                className="mb-1.5 flex w-full flex-row items-center px-4"
              >
                <Icon name="telescope-outline" size={14} color={vision.color ?? '#2563eb'} />
                <span className="ml-1.5 flex-1 truncate text-sm font-bold text-gray-700 dark:text-gray-300">
                  {vision.title}
                </span>
                <button
                  type="button"
                  onClick={() => setVisionSheet({ vision })}
                  aria-label={`Edit ${vision.title}`}
                  className="p-1"
                >
                  <Icon name="create-outline" size={14} color="#94a3b8" />
                </button>
              </div>
              {visionGoals.length === 0 ? (
                <p className="mb-1 px-4 text-xs text-gray-400 dark:text-gray-500">No goals under this vision yet.</p>
              ) : (
                visionGoals.map((goal) => (
                  <GoalCard key={goal._id} goal={goal} onPress={handleOpenGoal} onLongPress={setActionGoal} />
                ))
              )}
            </div>
          );
        })}

        <button type="button" onClick={() => setVisionSheet({ new: true })} className="mx-4 mb-4 flex flex-row items-center">
          <Icon name="add-circle-outline" size={16} color="#94a3b8" />
          <span className="ml-1.5 text-xs text-gray-400">Add a Vision</span>
        </button>

        {goalsByVision.unsorted.length > 0 ? (
          <div className="mb-4">
            <p className="mb-1.5 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Unsorted</p>
            {goalsByVision.unsorted.map((goal) => (
              <GoalCard key={goal._id} goal={goal} onPress={handleOpenGoal} onLongPress={setActionGoal} />
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderProjectsTab = () => {
    if (!projectsLoading && projects.length === 0) {
      return (
        <EmptyState
          icon="folder-outline"
          title="No projects yet"
          description="Break a goal down into concrete projects with milestones."
          ctaLabel="New Project"
          onCtaPress={() => setShowProjectForm(true)}
        />
      );
    }
    return (
      <div className="flex-1 min-h-0 overflow-y-auto pb-6 pt-1">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} onPress={handleOpenProject} onLongPress={setActionProject} />
        ))}
      </div>
    );
  };

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
      <div className="-mx-4 flex flex-1 min-h-0 flex-col sm:-mx-6 lg:-mx-8">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">Goals</p>
        <div className="flex flex-row items-center">
          <button
            type="button"
            onClick={() => navigate('/goals/roadmap')}
            aria-label="View roadmap"
            className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900"
          >
            <Icon name="map-outline" size={18} color="#2563eb" />
          </button>
          <button
            type="button"
            onClick={() => (workspaceTab === 'projects' ? setShowProjectForm(true) : setShowGoalForm(true))}
            aria-label={workspaceTab === 'projects' ? 'New project' : 'New goal'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600"
          >
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>
      </div>

      <div className="mx-4 mb-3 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setWorkspaceTab(tab.key)}
            className={`flex-1 rounded-lg py-1.5 text-center ${workspaceTab === tab.key ? 'bg-white dark:bg-gray-800' : ''}`}
          >
            <span className={`text-xs font-semibold ${workspaceTab === tab.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0 flex-col">{workspaceTab === 'projects' ? renderProjectsTab() : renderGoalsTab()}</div>
      </div>
      </PageContainer>

      <GoalFormSheet
        visible={showGoalForm || Boolean(editingGoal)}
        goal={editingGoal}
        onClose={() => {
          setShowGoalForm(false);
          setEditingGoal(null);
        }}
      />
      <ProjectFormSheet
        visible={showProjectForm || Boolean(editingProject)}
        project={editingProject}
        onClose={() => {
          setShowProjectForm(false);
          setEditingProject(null);
        }}
      />
      <VisionFormSheet
        visible={Boolean(visionSheet)}
        vision={visionSheet?.vision ?? null}
        defaultLifeAreaId={lifeAreaFilter}
        onClose={() => setVisionSheet(null)}
      />
      <LifeAreaFormSheet
        visible={Boolean(lifeAreaSheet)}
        lifeArea={lifeAreaSheet?.lifeArea ?? null}
        onClose={() => setLifeAreaSheet(null)}
      />

      <Modal visible={Boolean(actionGoal)} onClose={() => setActionGoal(null)} title={actionGoal?.title ?? ''}>
        <button
          type="button"
          onClick={() => {
            setEditingGoal(actionGoal);
            setActionGoal(null);
          }}
          className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 text-left dark:border-gray-800"
        >
          <Icon name="create-outline" size={19} color="#64748b" />
          <span className="ml-3 text-base text-gray-900 dark:text-white">Edit</span>
        </button>
        <button
          type="button"
          onClick={() => {
            archiveGoal.mutate({ id: actionGoal._id, isArchived: true });
            setActionGoal(null);
          }}
          className="flex w-full flex-row items-center py-3.5 text-left"
        >
          <Icon name="archive-outline" size={19} color="#64748b" />
          <span className="ml-3 text-base text-gray-900 dark:text-white">Archive</span>
        </button>
      </Modal>

      <Modal visible={Boolean(actionProject)} onClose={() => setActionProject(null)} title={actionProject?.name ?? ''}>
        <button
          type="button"
          onClick={() => {
            setEditingProject(actionProject);
            setActionProject(null);
          }}
          className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 text-left dark:border-gray-800"
        >
          <Icon name="create-outline" size={19} color="#64748b" />
          <span className="ml-3 text-base text-gray-900 dark:text-white">Edit</span>
        </button>
        <button
          type="button"
          onClick={() => {
            archiveProject.mutate({ id: actionProject._id, isArchived: true });
            setActionProject(null);
          }}
          className="flex w-full flex-row items-center py-3.5 text-left"
        >
          <Icon name="archive-outline" size={19} color="#64748b" />
          <span className="ml-3 text-base text-gray-900 dark:text-white">Archive</span>
        </button>
      </Modal>
    </Screen>
  );
}
