import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useShoppingLists, useCreateShoppingList } from '../hooks/useShoppingLists';

const CATEGORIES = ['groceries', 'medicines', 'electronics', 'clothing', 'home', 'school', 'wishlist', 'custom'];

export function ShoppingListsScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const { data: lists, isLoading } = useShoppingLists(householdId);
  const createList = useCreateShoppingList(householdId);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('groceries');

  const handleCreate = () => {
    if (!name.trim()) return;
    createList.mutate({ name: name.trim(), category }, { onSuccess: () => { setShowForm(false); setName(''); } });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Shopping Lists</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {!isLoading && (lists ?? []).length === 0 ? (
          <EmptyState icon="cart-outline" title="No shopping lists yet" description="Create a list for groceries, medicines, or anything else." ctaLabel="New list" onCtaPress={() => setShowForm(true)} />
        ) : (
          (lists ?? []).map((list) => (
            <button
              key={list._id}
              type="button"
              onClick={() => navigate(`/family/shopping-lists/${list._id}`)}
              className="mb-3 flex w-full flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{list.name}</p>
                <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{list.category} {list.store ? `· ${list.store}` : ''}</p>
              </div>
              <Icon name="chevron-forward" size={18} color="#94a3b8" />
            </button>
          ))
        )}
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleCreate} title="New Shopping List">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="List name *"
          className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={`rounded-full border px-3 py-1.5 ${category === c ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-xs capitalize ${category === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={handleCreate} disabled={createList.isPending || !name.trim()} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
          {createList.isPending ? 'Creating…' : 'Create List'}
        </button>
      </Modal>
    </Screen>
  );
}
