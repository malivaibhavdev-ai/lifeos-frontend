import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';

// No node-link graph-rendering library exists in this app (same
// "documented, not silently dropped" scope note as the mobile port) —
// this is a real, useful list view over the exact same nodes/edges the
// backend returns.
export function KnowledgeGraphScreen() {
  const navigate = useNavigate();
  const { data: graph, isLoading } = useKnowledgeGraph();
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const byType = useMemo(() => {
    const groups = {};
    for (const node of graph?.nodes ?? []) (groups[node.type] ??= []).push(node);
    return groups;
  }, [graph]);

  const connections = useMemo(() => {
    if (!selectedNodeId || !graph) return [];
    return graph.edges
      .filter((e) => e.source === selectedNodeId || e.target === selectedNodeId)
      .map((e) => {
        const otherId = e.source === selectedNodeId ? e.target : e.source;
        return graph.nodes.find((n) => n.id === otherId);
      })
      .filter(Boolean);
  }, [selectedNodeId, graph]);

  const selectedNode = graph?.nodes.find((n) => n.id === selectedNodeId);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => (selectedNodeId ? setSelectedNodeId(null) : navigate(-1))} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">
            {selectedNode ? selectedNode.label : 'Knowledge Graph'}
          </p>
        </div>

        {selectedNodeId ? (
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Connected to ({connections.length})
            </p>
            {connections.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className="mb-2 flex w-full flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-left dark:bg-gray-900"
              >
                <span className="text-sm text-gray-900 dark:text-white">{node.label}</span>
                <span className="text-xs capitalize text-gray-400 dark:text-gray-500">{node.type}</span>
              </button>
            ))}
          </div>
        ) : !isLoading && (graph?.nodes ?? []).length === 0 ? (
          <EmptyState icon="git-commit-outline" title="Nothing linked yet" description="Link notes, goals, tasks, and other items to see them connected here." />
        ) : (
          Object.entries(byType).map(([type, nodes]) => (
            <div key={type} className="mb-5">
              <p className="mb-2 text-sm font-semibold capitalize uppercase tracking-wide text-gray-400 dark:text-gray-500">{type} ({nodes.length})</p>
              {nodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className="mb-2 flex w-full flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
                >
                  <span className="text-sm text-gray-900 dark:text-white">{node.label}</span>
                  <Icon name="chevron-forward" size={16} color="#94a3b8" />
                </button>
              ))}
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
