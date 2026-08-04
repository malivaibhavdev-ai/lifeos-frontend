import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Icon } from '../../../components/ui/Icon';
import { MEDICINE_FORMS, MEDICINE_FORMS_ORDER } from '../constants/healthConstants';
import { useCreateMedicine, useDeleteMedicine, useUpdateMedicine } from '../hooks/useMedicine';

function defaultFormState() {
  return {
    name: '',
    dosage: '',
    form: 'tablet',
    instructions: '',
    startDate: dayjs().format('YYYY-MM-DD'),
    doseTimes: ['09:00'],
  };
}

function medicineToFormState(medicine) {
  return {
    name: medicine.name,
    dosage: medicine.dosage ?? '',
    form: medicine.form ?? 'tablet',
    instructions: medicine.instructions ?? '',
    startDate: medicine.startDate,
    doseTimes: medicine.doseTimes?.length ? medicine.doseTimes : ['09:00'],
  };
}

export function MedicineFormSheet({ visible, onClose, medicine }) {
  const [form, setForm] = useState(() => (medicine ? medicineToFormState(medicine) : defaultFormState()));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const nameInputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setForm(medicine ? medicineToFormState(medicine) : defaultFormState());
      setSubmitAttempted(false);
      setSaveError(null);
      isSubmittingRef.current = false;
      setTimeout(() => nameInputRef.current?.focus(), 350);
    }
  }, [visible, medicine]);

  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();
  const deleteMedicine = useDeleteMedicine();
  const isSaving = createMedicine.isPending || updateMedicine.isPending;

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    if (saveError) setSaveError(null);
  };

  const updateDoseTime = (index, value) => set({ doseTimes: form.doseTimes.map((t, i) => (i === index ? value : t)) });
  const addDoseTime = () => set({ doseTimes: [...form.doseTimes, '20:00'] });
  const removeDoseTime = (index) => set({ doseTimes: form.doseTimes.filter((_, i) => i !== index) });

  const showNameError = submitAttempted && !form.name.trim();

  const handleSubmit = () => {
    if (isSubmittingRef.current || isSaving) return;
    setSubmitAttempted(true);
    if (!form.name.trim()) {
      nameInputRef.current?.focus();
      return;
    }

    isSubmittingRef.current = true;
    setSaveError(null);

    const payload = { ...form, doseTimes: form.doseTimes.filter(Boolean) };
    const handleSuccess = () => {
      isSubmittingRef.current = false;
      onClose();
    };
    const handleError = (error) => {
      isSubmittingRef.current = false;
      setSaveError(error?.message ?? 'Could not save this medicine. Please try again.');
    };

    if (medicine) {
      updateMedicine.mutate({ id: medicine._id, payload }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createMedicine.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!medicine) return;
    deleteMedicine.mutate(medicine._id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={medicine ? 'Edit Medicine' : 'New Medicine'}>
      <div className="overflow-y-auto">
        <ErrorBanner message={saveError} />

        <div className="mb-4">
          <input
            ref={nameInputRef}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Medicine name *"
            className={`w-full bg-transparent text-xl font-bold text-gray-900 outline-none dark:text-white ${showNameError ? 'border-b-2 border-danger pb-1' : ''}`}
          />
          {showNameError ? <p className="mt-2 text-xs font-medium text-danger">Name is required</p> : null}
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Dosage</p>
          <input
            value={form.dosage}
            onChange={(e) => set({ dosage: e.target.value })}
            placeholder="e.g. 500mg"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Form</p>
          <div className="flex flex-row overflow-x-auto">
            {MEDICINE_FORMS_ORDER.map((key) => {
              const meta = MEDICINE_FORMS[key];
              const isSelected = form.form === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => set({ form: key })}
                  className={`mr-2 flex flex-row items-center whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <Icon name={meta.icon} size={14} color={isSelected ? '#fff' : '#64748b'} />
                  <span className={`ml-1.5 text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-1.5 flex flex-row items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dose times</p>
            <button type="button" onClick={addDoseTime} className="flex flex-row items-center">
              <Icon name="add-circle-outline" size={16} color="#2563eb" />
              <span className="ml-1 text-xs font-semibold text-primary-600">Add time</span>
            </button>
          </div>
          {form.doseTimes.map((time, i) => (
            <div key={i} className="mb-2 flex flex-row items-center">
              <input
                type="time"
                value={time}
                onChange={(e) => updateDoseTime(i, e.target.value)}
                placeholder="HH:mm"
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
              />
              {form.doseTimes.length > 1 ? (
                <button type="button" aria-label="Remove dose time" onClick={() => removeDoseTime(i)} className="ml-2">
                  <Icon name="close-circle" size={20} color="#cbd5e1" />
                </button>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Instructions</p>
          <textarea
            value={form.instructions}
            onChange={(e) => set({ instructions: e.target.value })}
            placeholder="e.g. Take with food"
            className="min-h-[60px] w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !form.name.trim()}
          className={`flex h-12 w-full items-center justify-center rounded-xl bg-primary-600 ${isSaving || !form.name.trim() ? 'opacity-50' : ''}`}
        >
          <span className="text-base font-semibold text-white">{isSaving ? '…' : 'Save'}</span>
        </button>

        {medicine ? (
          <button type="button" onClick={handleDelete} disabled={deleteMedicine.isPending} className="mb-4 mt-3 flex w-full items-center justify-center py-2">
            <span className="text-sm font-medium text-danger">{deleteMedicine.isPending ? '…' : 'Delete Medicine'}</span>
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
