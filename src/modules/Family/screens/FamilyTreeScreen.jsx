import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyMembers, useFamilyTree, useAddRelationship, useRemoveRelationship } from '../hooks/useFamily';

const RELATIONSHIP_TYPES = [
  'parent', 'child', 'spouse', 'sibling', 'grandparent', 'grandchild',
  'cousin', 'uncle', 'aunt', 'niece', 'nephew', 'in-law', 'guardian',
  'adopted', 'step', 'godparent', 'custom',
];

export function FamilyTreeScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const { data: tree, isLoading } = useFamilyTree(householdId);
  const { data: members } = useFamilyMembers(householdId);
  const addRelationship = useAddRelationship(householdId);
  const removeRelationship = useRemoveRelationship(householdId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [memberA, setMemberA] = useState(null);
  const [memberB, setMemberB] = useState(null);
  const [relationshipType, setRelationshipType] = useState('parent');

  const nodes = tree?.nodes ?? [];
  const edges = tree?.edges ?? [];

  const edgesForMember = (memberId) =>
    edges.filter((e) => (e.memberA?._id ?? e.memberA) === memberId || (e.memberB?._id ?? e.memberB) === memberId);
  const memberName = (id) => nodes.find((n) => n._id === id)?.name ?? 'Unknown';

  const handleAddRelationship = () => {
    if (!memberA || !memberB || memberA === memberB) return;
    addRelationship.mutate({ memberA, memberB, relationshipType }, { onSuccess: () => { setShowAddModal(false); setMemberA(null); setMemberB(null); } });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Family Tree</p>
          <button type="button" onClick={() => setShowAddModal(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {!isLoading && nodes.length === 0 ? (
          <EmptyState icon="git-network-outline" title="No family members yet" description="Add family members first, then connect them here." />
        ) : (
          nodes.map((node) => {
            const relatedEdges = edgesForMember(node._id);
            return (
              <div key={node._id} className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="mb-2 text-base font-semibold text-gray-900 dark:text-white">{node.name}</p>
                {relatedEdges.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500">No relationships added yet</p>
                ) : (
                  relatedEdges.map((edge) => {
                    const otherId = (edge.memberA?._id ?? edge.memberA) === node._id ? (edge.memberB?._id ?? edge.memberB) : (edge.memberA?._id ?? edge.memberA);
                    const isSource = (edge.memberA?._id ?? edge.memberA) === node._id;
                    return (
                      <div key={edge._id} className="mb-1.5 flex flex-row items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {isSource ? edge.relationshipType : `${edge.relationshipType} of`} — {memberName(otherId)}
                        </span>
                        <button type="button" onClick={() => removeRelationship.mutate(edge._id)} aria-label="Remove relationship">
                          <Icon name="close-circle-outline" size={16} color="#94a3b8" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })
        )}
      </PageContainer>

      <Modal visible={showAddModal} onClose={() => setShowAddModal(false)} onDone={handleAddRelationship} title="Add Relationship">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Person</p>
        <div className="mb-3 flex flex-row flex-wrap" style={{ gap: 6 }}>
          {(members ?? []).map((m) => (
            <button
              key={m._id}
              type="button"
              onClick={() => setMemberA(m._id)}
              className={`rounded-full border px-3 py-1.5 ${memberA === m._id ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <span className={`text-xs ${memberA === m._id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{m.name}</span>
            </button>
          ))}
        </div>

        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Relationship type</p>
        <div className="mb-3 flex flex-row flex-wrap" style={{ gap: 6 }}>
          {RELATIONSHIP_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setRelationshipType(type)}
              className={`rounded-full border px-3 py-1.5 ${relationshipType === type ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <span className={`text-xs capitalize ${relationshipType === type ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{type}</span>
            </button>
          ))}
        </div>

        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Of</p>
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
          {(members ?? []).filter((m) => m._id !== memberA).map((m) => (
            <button
              key={m._id}
              type="button"
              onClick={() => setMemberB(m._id)}
              className={`rounded-full border px-3 py-1.5 ${memberB === m._id ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <span className={`text-xs ${memberB === m._id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{m.name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </Screen>
  );
}
