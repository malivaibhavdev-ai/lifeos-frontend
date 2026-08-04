import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useCreatePerformanceReview, useUpdatePerformanceReview, useDeletePerformanceReview } from '../hooks/usePerformanceReviews';

function defaultFormState(review) {
  if (!review) return { reviewCycle: '', reviewDate: '', managerFeedback: '', selfReview: '', rating: '', promotionChance: '' };
  return {
    reviewCycle: review.reviewCycle, reviewDate: review.reviewDate?.slice(0, 10) ?? '',
    managerFeedback: review.managerFeedback ?? '', selfReview: review.selfReview ?? '',
    rating: review.rating != null ? String(review.rating) : '', promotionChance: review.promotionChance ?? '',
  };
}

const PROMOTION_CHANCE = ['low', 'medium', 'high'];

export function PerformanceReviewFormSheet({ visible, onClose, review }) {
  const [form, setForm] = useState(() => defaultFormState(review));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createReview = useCreatePerformanceReview();
  const updateReview = useUpdatePerformanceReview();
  const deleteReview = useDeletePerformanceReview();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(review)); setSaveError(null); }
  }, [visible, review]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.reviewCycle.trim() || !form.reviewDate) return setSaveError('Cycle and date are required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = { ...form, rating: form.rating ? Number(form.rating) : undefined, promotionChance: form.promotionChance || undefined };
      if (review) await updateReview.mutateAsync({ id: review._id, ...payload });
      else await createReview.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save review');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={review ? 'Edit Review' : 'Add Review'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.reviewCycle} onChange={(e) => setForm({ ...form, reviewCycle: e.target.value })} placeholder="Review cycle (e.g. H1 2026) *" aria-label="Review cycle (e.g. H1 2026)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} placeholder="Review date (YYYY-MM-DD) *" aria-label="Review date (YYYY-MM-DD)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value.replace(/[^0-9]/g, '') })} placeholder="Rating (1-5)" aria-label="Rating (1-5)" inputMode="numeric" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      <div className="mb-3 flex flex-row overflow-x-auto">
        {PROMOTION_CHANCE.map((chance) => {
          const isSelected = form.promotionChance === chance;
          return (
            <button type="button" key={chance} onClick={() => setForm({ ...form, promotionChance: chance })} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium capitalize ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{chance} promotion chance</span>
            </button>
          );
        })}
      </div>

      <textarea value={form.selfReview} onChange={(e) => setForm({ ...form, selfReview: e.target.value })} placeholder="Self review" aria-label="Self review" className="mb-3 h-20 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <textarea value={form.managerFeedback} onChange={(e) => setForm({ ...form, managerFeedback: e.target.value })} placeholder="Manager feedback" aria-label="Manager feedback" className="mb-3 h-20 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      {review ? (
        <button type="button" onClick={() => deleteReview.mutate(review._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
