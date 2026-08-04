import { useQuery } from '@tanstack/react-query';
import { knowledgeGraphApi } from '../api/knowledgeGraph.api';

export function useKnowledgeGraph() {
  return useQuery({ queryKey: ['knowledgeGraph'], queryFn: () => knowledgeGraphApi.getGraph() });
}
