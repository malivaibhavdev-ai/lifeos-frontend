import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useAssetList, useAddPriceSnapshot } from '../hooks/useInvestments';
import { ASSET_CLASSES } from '../../Finance/constants/financeConstants';
import { AssetFormSheet } from '../components/AssetFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const AssetRow = memo(function AssetRow({ asset, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(asset)}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{asset.symbol || asset.name}</p>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{ASSET_CLASSES[asset.assetClass]?.label} · {asset.currency}</p>
      </div>
      <Icon name="pricetag-outline" size={16} color="#94a3b8" />
    </button>
  );
});

export function AssetsScreen() {
  const navigate = useNavigate();
  const { data: assets } = useAssetList();
  const [showForm, setShowForm] = useState(false);
  const [priceAsset, setPriceAsset] = useState(null);
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState(null);
  const addPriceSnapshot = useAddPriceSnapshot();

  const items = assets ?? EMPTY_ARRAY;

  const handleSavePrice = () => {
    if (!price || Number(price) <= 0) return setPriceError('Enter a valid price');
    addPriceSnapshot.mutate(
      { id: priceAsset._id, date: todayKey(), price: Number(price), currency: priceAsset.currency },
      { onSuccess: () => { setPriceAsset(null); setPrice(''); setPriceError(null); }, onError: (e) => setPriceError(e?.message) }
    );
  };

  const handleSelectAsset = (asset) => { setPriceAsset(asset); setPrice(''); setPriceError(null); };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Assets</p>
        <button type="button" aria-label="Add asset" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        {items.length === 0 ? (
          <EmptyState icon="albums-outline" title="No assets yet" description="Add a stock, fund, gold, crypto, or any other instrument to track." ctaLabel="Add Asset" onCtaPress={() => setShowForm(true)} />
        ) : (
          items.map((asset) => <AssetRow key={asset._id} asset={asset} onSelect={handleSelectAsset} />)
        )}
      </div>
      </PageContainer>

      <AssetFormSheet visible={showForm} onClose={() => setShowForm(false)} />

      <Modal visible={Boolean(priceAsset)} onClose={() => setPriceAsset(null)} onDone={handleSavePrice} title={`Update Price: ${priceAsset?.symbol || priceAsset?.name || ''}`}>
        {priceError ? <ErrorBanner message={priceError} /> : null}
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder={`Price (${priceAsset?.currency ?? ''}) *`}
          inputMode="decimal"
          className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
      </Modal>
    </Screen>
  );
}
