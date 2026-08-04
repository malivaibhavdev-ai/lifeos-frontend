import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useLearningItemList, useTotalLearningHours } from '../hooks/useLearningItems';
import { LEARNING_PLATFORMS } from '../constants/careerConstants';
import { LearningItemFormSheet } from '../components/LearningItemFormSheet';

export function LearningScreen() {
  const navigate = useNavigate();
  const { data: items } = useLearningItemList();
  const { data: totalHours } = useTotalLearningHours();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const list = items ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Learning</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600" aria-label="Add learning item">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {totalHours != null ? (
          <div className="mb-3 rounded-xl bg-primary-50 px-4 py-3 dark:bg-primary-950">
            <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">{totalHours.totalHours ?? totalHours} hours logged total</p>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto pb-6">
          {list.length === 0 ? (
            <EmptyState icon="book-outline" title="No learning items yet" description="Track courses, books, and training." ctaLabel="Add Learning Item" onCtaPress={() => setShowForm(true)} />
          ) : (
            <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {list.map((item) => (
                <button type="button" key={item._id} onClick={() => setEditingItem(item)} className="mb-2 flex w-full flex-col rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 sm:mb-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</span>
                  <span className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    {LEARNING_PLATFORMS[item.platform]} · {item.hoursCompleted}h{item.totalHours ? `/${item.totalHours}h` : ''} · {item.status.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <LearningItemFormSheet visible={showForm || Boolean(editingItem)} onClose={() => { setShowForm(false); setEditingItem(null); }} item={editingItem} />
      </PageContainer>
    </Screen>
  );
}
