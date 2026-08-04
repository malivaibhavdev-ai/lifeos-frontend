import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Modal } from '../../../components/ui/Modal';
import { DateField } from '../../../components/ui/DateField';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Icon } from '../../../components/ui/Icon';
import { RecurrencePicker } from '../../Tasks/components/RecurrencePicker';
import { ReminderPicker } from '../../Tasks/components/ReminderPicker';
import { TASK_COLORS } from '../../Tasks/constants/taskConstants';
import { useCreateCalendarEvent, useDeleteCalendarEvent, useUpdateCalendarEvent } from '../hooks/useCalendarEvents';

function defaultFormState(prefillStart) {
  const start = prefillStart ? dayjs(prefillStart) : dayjs().add(1, 'hour').minute(0);
  return {
    title: '',
    startTime: start.toDate(),
    endTime: start.add(1, 'hour').toDate(),
    allDay: false,
    color: null,
    category: '',
    location: '',
    notes: '',
    recurrence: null,
    reminders: [],
  };
}

function eventToFormState(event) {
  return {
    title: event.title,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
    allDay: event.allDay ?? false,
    color: event.color ?? null,
    category: event.category ?? '',
    location: event.location ?? '',
    notes: event.notes ?? '',
    recurrence: event.recurrence ?? null,
    reminders: event.reminders ?? [],
  };
}

// Every required-field rule the form enforces, in one place, so the Save
// button's disabled state and Done's validate-on-press path (see
// handleSubmit) can never drift out of sync with each other.
function validateForm(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Title is required';
  if (form.endTime.getTime() <= form.startTime.getTime()) errors.endTime = 'End time must be after the start time';
  return errors;
}

// Simple pill switch — no shared Switch component exists yet in the web
// component library, so this is a self-contained inline replacement for
// RN's <Switch>, same visual affordance (track + sliding knob).
function ToggleSwitch({ value, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 ${value ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

// Create when `event` is null, edit when it's a CalendarEvent (with
// reminders already attached by the server, same shape as Task). Recurrence
// and Reminders reuse Tasks' pickers directly — both already operate on the
// shared {freq/interval/byweekday/until/count} and
// {offsetMinutes/remindAt/escalation} shapes with no task-specific logic.
export function CalendarEventFormSheet({ visible, onClose, event, prefillStart }) {
  const [form, setForm] = useState(() => (event ? eventToFormState(event) : defaultFormState(prefillStart)));
  const [formErrors, setFormErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const titleInputRef = useRef(null);
  // Synchronous re-entrancy guard — createEvent.isPending/updateEvent.isPending
  // only flips true after React commits the next render, which leaves a
  // narrow window where a very fast double-click on Save (or Save then Done)
  // could fire the mutation twice before the button's disabled state
  // catches up. This ref is set the instant a submit starts, no render
  // required, so a second click in that window is a guaranteed no-op.
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setForm(event ? eventToFormState(event) : defaultFormState(prefillStart));
      setFormErrors({});
      setSubmitAttempted(false);
      setSaveError(null);
      isSubmittingRef.current = false;
      // The sheet's slide-in animation needs a beat before the input can
      // actually take focus — matches the platform's own modal-focus timing.
      setTimeout(() => titleInputRef.current?.focus(), 350);
    }
  }, [visible, event, prefillStart]);

  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const isSaving = createEvent.isPending || updateEvent.isPending;
  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    if (saveError) setSaveError(null);
  };

  // The single entry point for both "Save" and "Done" — see Modal's onDone
  // prop below. Keeping one function means the two buttons can never
  // validate or submit differently from each other.
  const handleSubmit = () => {
    if (isSubmittingRef.current || isSaving) return;

    const errors = validateForm(form);
    setFormErrors(errors);
    setSubmitAttempted(true);
    if (errors.title) {
      titleInputRef.current?.focus();
      return;
    }
    if (Object.keys(errors).length > 0) return;

    isSubmittingRef.current = true;
    setSaveError(null);

    const payload = {
      ...form,
      startTime: form.startTime.toISOString(),
      endTime: form.endTime.toISOString(),
      color: form.color,
      category: form.category.trim() || null,
    };

    const handleSuccess = () => {
      isSubmittingRef.current = false;
      onClose();
    };
    const handleError = (error) => {
      isSubmittingRef.current = false;
      setSaveError(error?.message ?? 'Could not save this event. Please try again.');
    };

    if (event) {
      updateEvent.mutate({ id: event._id, payload }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createEvent.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!event) return;
    deleteEvent.mutate(event._id, {
      onSuccess: onClose,
      onError: (error) => setSaveError(error?.message ?? 'Could not delete this event. Please try again.'),
    });
  };

  const showTitleError = submitAttempted && Boolean(formErrors.title);
  const showEndTimeError = submitAttempted && Boolean(formErrors.endTime);

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={event ? 'Edit Event' : 'New Event'}>
      <div>
        <ErrorBanner message={saveError} />

        <input
          ref={titleInputRef}
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Event title *"
          aria-label="Event title"
          className={`w-full bg-transparent text-xl font-bold text-gray-900 dark:text-white outline-none placeholder:text-gray-400 ${
            showTitleError ? 'border-b-2 border-danger pb-1 placeholder:text-danger' : ''
          }`}
        />
        {showTitleError ? <p className="mb-2 mt-1 text-xs font-medium text-danger">{formErrors.title}</p> : null}
        <div className="mb-4" />

        <div className="mb-4 flex flex-row items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">All day</span>
          <ToggleSwitch value={form.allDay} onChange={(allDay) => set({ allDay })} />
        </div>

        <DateField label="Starts" value={form.startTime} onChange={(startTime) => startTime && set({ startTime })} mode={form.allDay ? 'date' : 'datetime'} />
        <DateField label="Ends" value={form.endTime} onChange={(endTime) => endTime && set({ endTime })} mode={form.allDay ? 'date' : 'datetime'} />
        {showEndTimeError ? <p className="-mt-2 mb-4 text-xs font-medium text-danger">{formErrors.endTime}</p> : null}

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Color</p>
          <div className="flex flex-row items-center">
            {TASK_COLORS.map((swatch) => (
              <button
                type="button"
                key={swatch}
                onClick={() => set({ color: form.color === swatch ? null : swatch })}
                aria-label={`Color ${swatch}`}
                aria-pressed={form.color === swatch}
                className="mr-2 h-8 w-8 items-center justify-center rounded-full flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
                style={{ backgroundColor: swatch }}
              >
                {form.color === swatch ? <Icon name="checkmark" size={16} color="#fff" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
          <input
            value={form.location}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="Add a location"
            aria-label="Location"
            className="h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:text-white bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
          <input
            value={form.category}
            onChange={(e) => set({ category: e.target.value })}
            placeholder="e.g. Work, Personal"
            aria-label="Category"
            className="h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:text-white bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Repeat</p>
          <RecurrencePicker value={form.recurrence} onChange={(recurrence) => set({ recurrence })} />
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Reminders</p>
          <ReminderPicker value={form.reminders} onChange={(reminders) => set({ reminders })} dueDate={form.startTime} />
        </div>

        <div className="mb-6">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Notes</p>
          <textarea
            value={form.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Add notes…"
            aria-label="Notes"
            className="min-h-[80px] w-full rounded-xl border border-gray-300 px-3 py-2 text-base text-gray-900 dark:border-gray-700 dark:text-white bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !form.title.trim()}
          className={`h-12 w-full flex flex-row items-center justify-center rounded-xl bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ${isSaving || !form.title.trim() ? 'opacity-50' : ''}`}
        >
          <span className="text-base font-semibold text-white">{isSaving ? '…' : 'Save'}</span>
        </button>

        {event ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteEvent.isPending}
            className="mb-4 mt-3 w-full flex flex-row items-center justify-center py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <span className="text-sm font-medium text-danger">{deleteEvent.isPending ? '…' : 'Delete Event'}</span>
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
