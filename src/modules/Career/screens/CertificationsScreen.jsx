import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useCertificationList } from '../hooks/useCertifications';
import { CertificationFormSheet } from '../components/CertificationFormSheet';

const STATUS_COLOR = { active: 'text-success', expired: 'text-danger', in_progress: 'text-amber-500', planned: 'text-gray-400' };

export function CertificationsScreen() {
  const navigate = useNavigate();
  const { data: certs } = useCertificationList();
  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  const items = certs ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Certifications</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600" aria-label="Add certification">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 pt-2">
          {items.length === 0 ? (
            <EmptyState icon="ribbon-outline" title="No certifications yet" description="Track certifications, expiry dates, and renewal reminders." ctaLabel="Add Certification" onCtaPress={() => setShowForm(true)} />
          ) : (
            <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {items.map((cert) => (
                <button type="button" key={cert._id} onClick={() => setEditingCert(cert)} className="mb-2 flex w-full flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 sm:mb-0">
                  <div>
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{cert.name}</span>
                    <span className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500">
                      {cert.organization} {cert.expiryDate ? `· Expires ${cert.expiryDate.slice(0, 10)}` : ''}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold capitalize ${STATUS_COLOR[cert.status] ?? 'text-gray-400'}`}>{cert.status.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <CertificationFormSheet visible={showForm || Boolean(editingCert)} onClose={() => { setShowForm(false); setEditingCert(null); }} cert={editingCert} />
      </PageContainer>
    </Screen>
  );
}
