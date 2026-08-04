import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { usePerformanceReviewList } from '../hooks/usePerformanceReviews';
import { PerformanceReviewFormSheet } from '../components/PerformanceReviewFormSheet';

export function PerformanceReviewsScreen() {
  const navigate = useNavigate();
  const { data: reviews } = usePerformanceReviewList();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const items = reviews ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Performance Reviews</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600" aria-label="Add performance review">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 pt-2">
          {items.length === 0 ? (
            <EmptyState icon="clipboard-outline" title="No reviews yet" description="Track review cycles, feedback, and ratings." ctaLabel="Add Review" onCtaPress={() => setShowForm(true)} />
          ) : (
            <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {items.map((review) => (
                <button type="button" key={review._id} onClick={() => setEditingReview(review)} className="mb-2 flex w-full flex-col rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 sm:mb-0">
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{review.reviewCycle}</span>
                    {review.rating ? <span className="text-xs font-semibold text-amber-500">★ {review.rating}</span> : null}
                  </div>
                  <span className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{review.reviewDate?.slice(0, 10)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <PerformanceReviewFormSheet visible={showForm || Boolean(editingReview)} onClose={() => { setShowForm(false); setEditingReview(null); }} review={editingReview} />
      </PageContainer>
    </Screen>
  );
}
