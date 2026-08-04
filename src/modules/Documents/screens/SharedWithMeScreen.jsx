import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useSharedWithMe } from '../hooks/useDocumentShares';

export function SharedWithMeScreen() {
  const navigate = useNavigate();
  const { data: shares, isLoading } = useSharedWithMe();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Shared With Me</p>
        </div>

        {!isLoading && (shares ?? []).length === 0 ? (
          <EmptyState icon="people-outline" title="Nothing shared with you yet" description="Documents your family or household shares with you appear here." />
        ) : (
          (shares ?? []).map((share) => (
            <button
              key={share._id}
              type="button"
              onClick={() => navigate(`/documents/${share.document?._id}`)}
              className="mb-3 flex w-full flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
            >
              <Icon name="document-outline" size={22} color="#2563eb" />
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{share.document?.title}</p>
                <p className="mt-0.5 text-xs capitalize text-gray-400 dark:text-gray-500">
                  {share.role} · from {share.owner?.name}
                </p>
              </div>
            </button>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
