import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as Haptics from '../../../services/haptics';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { ProgressRing } from '../../Habits/components/ProgressRing';
import { Modal } from '../../../components/ui/Modal';
import { useAddWaterEntry, useRemoveLastWaterEntry, useSetWaterTarget, useWaterForDate, useWaterSettings, useUpdateWaterSettings } from '../hooks/useWater';

export function WaterScreen() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: waterLog, isLoading } = useWaterForDate(today);
  const { data: settings } = useWaterSettings();
  const addEntry = useAddWaterEntry();
  const removeLast = useRemoveLastWaterEntry();
  const setTarget = useSetWaterTarget();
  const updateSettings = useUpdateWaterSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const totalMl = waterLog?.entries?.reduce((s, e) => s + e.amountMl, 0) ?? 0;
  const targetMl = waterLog?.targetMl ?? 2000;
  const ratio = targetMl > 0 ? Math.min(totalMl / targetMl, 1) : 0;
  const presets = settings?.bottlePresetsMl ?? [250, 500, 750];

  const handleAdd = (amountMl) => {
    Haptics.impactAsync();
    addEntry.mutate({ date: today, amountMl });
  };

  if (isLoading) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-gray-400">Loading…</span>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Water</p>
        <button type="button" aria-label="Water settings" onClick={() => setShowSettings(true)}>
          <Icon name="settings-outline" size={20} color="#64748b" />
        </button>
      </div>

      <div className="flex items-center justify-center py-6">
        <ProgressRing size={140} strokeWidth={10} progress={ratio} color="#3b82f6">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMl}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">of {targetMl}ml</p>
        </ProgressRing>
      </div>

      <div className="flex flex-row flex-wrap justify-center gap-3 px-4">
        {presets.map((amount) => (
          <button
            type="button"
            key={amount}
            onClick={() => handleAdd(amount)}
            className="flex w-24 flex-col items-center rounded-2xl border border-primary-200 bg-primary-50 py-3 dark:border-primary-800 dark:bg-primary-950"
          >
            <Icon name="water" size={20} color="#3b82f6" />
            <span className="mt-1 text-sm font-semibold text-primary-700 dark:text-primary-300">+{amount}ml</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-row items-center px-4">
        <input
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Custom amount (ml)"
          inputMode="numeric"
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
        />
        <button
          type="button"
          aria-label="Add custom amount"
          onClick={() => {
            const amount = Number(customAmount);
            if (amount > 0) {
              handleAdd(amount);
              setCustomAmount('');
            }
          }}
          className="ml-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600"
        >
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      {waterLog?.entries?.length > 0 ? (
        <button type="button" onClick={() => removeLast.mutate(today)} className="mt-4 flex w-full items-center justify-center py-2">
          <span className="text-sm font-medium text-danger">Undo last entry</span>
        </button>
      ) : null}
      </PageContainer>

      <Modal visible={showSettings} onClose={() => setShowSettings(false)} title="Water Settings">
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Daily target (ml)</p>
          <input
            defaultValue={String(targetMl)}
            onBlur={(e) => {
              const value = Number(e.target.value);
              if (value > 0) setTarget.mutate({ date: today, targetMl: value });
            }}
            inputMode="numeric"
            className="rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>
        <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">
          Reminder times can be added from the More {'>'} Notifications settings in a future update.
        </p>
        <button
          type="button"
          onClick={() => updateSettings.mutate({ defaultTargetMl: targetMl })}
          className="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3"
        >
          <span className="text-base font-semibold text-white">Save as default</span>
        </button>
      </Modal>
    </Screen>
  );
}
