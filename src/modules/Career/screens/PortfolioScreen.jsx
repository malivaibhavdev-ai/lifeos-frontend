import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { usePortfolioProjectList } from '../hooks/usePortfolioProjects';
import { PortfolioProjectFormSheet } from '../components/PortfolioProjectFormSheet';

export function PortfolioScreen() {
  const navigate = useNavigate();
  const { data: projects } = usePortfolioProjectList();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const items = projects ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Portfolio</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600" aria-label="Add portfolio project">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 pt-2">
          {items.length === 0 ? (
            <EmptyState icon="images-outline" title="No projects yet" description="Showcase your work with live links and technologies used." ctaLabel="Add Project" onCtaPress={() => setShowForm(true)} />
          ) : (
            <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {items.map((project) => (
                <div key={project._id} className="mb-2 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 sm:mb-0">
                  <button type="button" onClick={() => setEditingProject(project)} className="flex w-full flex-col text-left">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{project.name}</span>
                    {project.technologies?.length ? (
                      <span className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{project.technologies.join(' · ')}</span>
                    ) : null}
                  </button>
                  <div className="mt-2 flex flex-row">
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open live project (opens in new tab)"
                        className="mr-4 flex flex-row items-center"
                      >
                        <Icon name="globe-outline" size={14} color="#2563eb" />
                        <span className="ml-1 text-xs font-semibold text-primary-600">Live</span>
                      </a>
                    ) : null}
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open project code on GitHub (opens in new tab)"
                        className="flex flex-row items-center"
                      >
                        <Icon name="logo-github" size={14} color="#2563eb" />
                        <span className="ml-1 text-xs font-semibold text-primary-600">Code</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <PortfolioProjectFormSheet visible={showForm || Boolean(editingProject)} onClose={() => { setShowForm(false); setEditingProject(null); }} project={editingProject} />
      </PageContainer>
    </Screen>
  );
}
