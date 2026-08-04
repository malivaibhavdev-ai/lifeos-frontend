import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useCareerProfile, useUpdateCareerProfile } from '../hooks/useCareerProfile';
import { EMPLOYMENT_TYPES, WORK_MODE, CAREER_STAGE, PORTFOLIO_LINK_PLATFORMS } from '../constants/careerConstants';

function fieldsFromProfile(profile) {
  return {
    currentPosition: profile?.currentPosition ?? '',
    currentCompany: profile?.currentCompany ?? '',
    industry: profile?.industry ?? '',
    department: profile?.department ?? '',
    location: profile?.location ?? '',
    careerLevel: profile?.careerLevel ?? '',
    careerObjective: profile?.careerObjective ?? '',
    professionalSummary: profile?.professionalSummary ?? '',
  };
}

function Field({ label, value, onChange, multiline }) {
  const inputId = useId();
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {multiline ? (
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-24 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
      ) : (
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
      )}
    </div>
  );
}

function ChipRow({ label, options, value, onChange }) {
  const groupId = useId();
  return (
    <div className="mb-4">
      <p id={groupId} className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <div role="radiogroup" aria-labelledby={groupId} className="flex flex-row overflow-x-auto">
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              type="button"
              key={opt}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt)}
              className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <span className={`text-sm font-medium capitalize ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{opt.replace(/_/g, ' ')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CareerProfileScreen() {
  const navigate = useNavigate();
  const { data: profile } = useCareerProfile();
  const updateProfile = useUpdateCareerProfile();
  const [form, setForm] = useState(fieldsFromProfile(null));
  const [employmentType, setEmploymentType] = useState('full_time');
  const [workMode, setWorkMode] = useState('onsite');
  const [careerStage, setCareerStage] = useState('early_career');
  const [links, setLinks] = useState({});

  useEffect(() => {
    if (profile) {
      setForm(fieldsFromProfile(profile));
      setEmploymentType(profile.employmentType ?? 'full_time');
      setWorkMode(profile.workMode ?? 'onsite');
      setCareerStage(profile.careerStage ?? 'early_career');
      setLinks(Object.fromEntries((profile.portfolioLinks ?? []).map((l) => [l.platform, l.url])));
    }
  }, [profile]);

  const handleSave = () => {
    const portfolioLinks = Object.entries(links)
      .filter(([, url]) => url)
      .map(([platform, url]) => ({ platform, url }));
    updateProfile.mutate({ ...form, employmentType, workMode, careerStage, portfolioLinks });
  };

  return (
    <Screen>
      <PageContainer maxWidth="max-w-2xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Career Profile</p>
          <button type="button" onClick={handleSave} className="p-1">
            <span className="text-base font-semibold text-primary-600">Save</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-10 pt-2">
          <Field label="Current Position" value={form.currentPosition} onChange={(v) => setForm({ ...form, currentPosition: v })} />
          <Field label="Current Company" value={form.currentCompany} onChange={(v) => setForm({ ...form, currentCompany: v })} />
          <Field label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
          <Field label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <Field label="Career Level" value={form.careerLevel} onChange={(v) => setForm({ ...form, careerLevel: v })} />

          <ChipRow label="Employment Type" options={EMPLOYMENT_TYPES} value={employmentType} onChange={setEmploymentType} />
          <ChipRow label="Work Mode" options={WORK_MODE} value={workMode} onChange={setWorkMode} />
          <ChipRow label="Career Stage" options={CAREER_STAGE} value={careerStage} onChange={setCareerStage} />

          <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Portfolio Links</p>
          {PORTFOLIO_LINK_PLATFORMS.map((platform) => (
            <div key={platform} className="mb-3">
              <label htmlFor={`portfolio-link-${platform}`} className="sr-only">{`${platform} URL`}</label>
              <input
                id={`portfolio-link-${platform}`}
                value={links[platform] ?? ''}
                onChange={(e) => setLinks({ ...links, [platform]: e.target.value })}
                placeholder={`${platform} URL`}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm capitalize text-gray-900 outline-none dark:border-gray-700 dark:text-white"
              />
            </div>
          ))}

          <Field label="Career Objective" value={form.careerObjective} onChange={(v) => setForm({ ...form, careerObjective: v })} multiline />
          <Field label="Professional Summary" value={form.professionalSummary} onChange={(v) => setForm({ ...form, professionalSummary: v })} multiline />
        </div>
      </PageContainer>
    </Screen>
  );
}
