import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Modal } from '../../../components/ui/Modal';
import { useCategoryList, useCreateCategory, useDeleteCategory } from '../hooks/useCategories';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const CategoryRow = memo(function CategoryRow({ category, onDelete }) {
  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); if (!category.isSystem) onDelete(category._id); }}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <span className="text-sm text-gray-900 dark:text-white">{category.name}</span>
      {category.isSystem ? (
        <span className="text-xs text-gray-400">Default</span>
      ) : (
        <button type="button" aria-label="Delete category" onClick={() => onDelete(category._id)} className="p-1">
          <Icon name="trash-outline" size={16} color="#ef4444" />
        </button>
      )}
    </div>
  );
});

export function CategoriesScreen() {
  const navigate = useNavigate();
  const { data: categories } = useCategoryList();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');

  const items = categories ?? EMPTY_ARRAY;
  const income = useMemo(() => items.filter((c) => c.type === 'income'), [items]);
  const expense = useMemo(() => items.filter((c) => c.type === 'expense'), [items]);

  const handleSave = () => {
    if (!name.trim()) return;
    createCategory.mutate({ name: name.trim(), type }, { onSuccess: () => { setShowForm(false); setName(''); } });
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Categories</p>
        <button type="button" aria-label="Add category" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        <p className="mx-4 mb-2 text-xs font-semibold uppercase text-gray-400">Expense</p>
        {expense.map((c) => <CategoryRow key={c._id} category={c} onDelete={deleteCategory.mutate} />)}

        <p className="mx-4 mb-2 mt-4 text-xs font-semibold uppercase text-gray-400">Income</p>
        {income.map((c) => <CategoryRow key={c._id} category={c} onDelete={deleteCategory.mutate} />)}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="New Category">
        <div className="mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name *"
            className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none dark:text-white"
          />
        </div>
        <div className="mb-4 flex flex-row">
          {['expense', 'income'].map((t) => {
            const isSelected = type === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={`mr-2 flex-1 items-center rounded-xl border py-2.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-semibold capitalize ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{t}</span>
              </button>
            );
          })}
        </div>
      </Modal>
    </Screen>
  );
}
