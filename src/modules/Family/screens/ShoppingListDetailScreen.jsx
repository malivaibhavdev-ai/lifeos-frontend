import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useShoppingList, useAddShoppingItem, useUpdateShoppingItem, useDeleteShoppingItem, useDeleteShoppingList } from '../hooks/useShoppingLists';

const PRIORITY_COLOR = { low: '#94a3b8', medium: '#f59e0b', high: '#ef4444' };

export function ShoppingListDetailScreen() {
  const navigate = useNavigate();
  const { listId } = useParams();
  const { householdId } = useActiveHousehold();
  const { data, isLoading } = useShoppingList(householdId, listId);
  const addItem = useAddShoppingItem(householdId);
  const updateItem = useUpdateShoppingItem(householdId);
  const deleteItem = useDeleteShoppingItem(householdId);
  const deleteList = useDeleteShoppingList(householdId);
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    if (!draft.trim()) return;
    addItem.mutate({ listId, payload: { name: draft.trim() } }, { onSuccess: () => setDraft('') });
  };

  const togglePurchased = (item) => {
    updateItem.mutate({ listId, itemId: item._id, payload: { status: item.status === 'purchased' ? 'pending' : 'purchased' } });
  };

  if (isLoading || !data) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        </div>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{data.list.name}</p>
          <button type="button" onClick={() => deleteList.mutate(listId, { onSuccess: () => navigate(-1) })} aria-label="Delete list">
            <Icon name="trash-outline" size={20} color="#94a3b8" />
          </button>
        </div>

        <div className="mb-4 flex flex-row items-center">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add an item..."
            className="mr-2 h-11 flex-1 rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
          />
          <button type="button" onClick={handleAdd} className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {data.items.length === 0 ? (
          <EmptyState icon="cart-outline" title="No items yet" description="Add items to this list above." />
        ) : (
          data.items.map((item) => (
            <div key={item._id} className="mb-2 flex flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
              <button type="button" onClick={() => togglePurchased(item)} className="flex flex-1 flex-row items-center text-left">
                <Icon name={item.status === 'purchased' ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={item.status === 'purchased' ? '#22c55e' : '#94a3b8'} />
                <span className={`ml-3 text-sm ${item.status === 'purchased' ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                  {item.name} {item.quantity > 1 ? `(${item.quantity})` : ''}
                </span>
              </button>
              <div className="mr-3 h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_COLOR[item.priority] }} />
              <button type="button" onClick={() => deleteItem.mutate({ listId, itemId: item._id })} aria-label="Remove item">
                <Icon name="close" size={18} color="#94a3b8" />
              </button>
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
