import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { ProgressRing } from '../../Habits/components/ProgressRing';
import { useCareerSummary } from '../hooks/useCareerHub';

const HUB_CARDS = [
  { key: 'CareerProfile', path: '/career/profile', label: 'Profile', icon: 'person-circle-outline' },
  { key: 'WorkHistory', path: '/career/work-history', label: 'Work History', icon: 'briefcase-outline' },
  { key: 'Education', path: '/career/education', label: 'Education', icon: 'school-outline' },
  { key: 'Skills', path: '/career/skills', label: 'Skills', icon: 'flash-outline' },
  { key: 'Learning', path: '/career/learning', label: 'Learning', icon: 'book-outline' },
  { key: 'Certifications', path: '/career/certifications', label: 'Certifications', icon: 'ribbon-outline' },
  { key: 'JobApplications', path: '/career/job-applications', label: 'Job Search', icon: 'search-outline' },
  { key: 'Interviews', path: '/career/interviews', label: 'Interviews', icon: 'people-outline' },
  { key: 'Resumes', path: '/career/resumes', label: 'Resumes', icon: 'document-text-outline' },
  { key: 'Portfolio', path: '/career/portfolio', label: 'Portfolio', icon: 'images-outline' },
  { key: 'PerformanceReviews', path: '/career/performance-reviews', label: 'Performance', icon: 'clipboard-outline' },
  { key: 'Salary', path: '/career/salary', label: 'Salary', icon: 'cash-outline' },
  { key: 'Contacts', path: '/career/contacts', label: 'Networking', icon: 'people-circle-outline' },
  { key: 'CareerDocuments', path: '/career/documents', label: 'Documents', icon: 'folder-outline' },
  { key: 'CareerTimeline', path: '/career/timeline', label: 'Timeline', icon: 'time-outline' },
];

function HubCard({ icon, label, onPress }) {
  return (
    <button type="button" onClick={onPress} className="mb-3 flex w-[31%] sm:w-[23%] lg:w-[15%] flex-col items-center rounded-2xl border border-gray-100 bg-white py-4 dark:border-gray-800 dark:bg-gray-900">
      <Icon name={icon} size={22} color="#2563eb" />
      <span className="mt-1.5 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );
}

function ScoreRing({ label, score, color }) {
  return (
    <div className="flex flex-col items-center">
      <ProgressRing size={64} strokeWidth={5} progress={(score ?? 0) / 100} color={color}>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{score ?? 0}</span>
      </ProgressRing>
      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

export function CareerHubScreen() {
  const navigate = useNavigate();
  const { data: summary } = useCareerSummary();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-5xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Career</p>
          <div className="h-9 w-9" />
        </div>

        {summary ? (
          <div className="mb-4 rounded-2xl bg-primary-600 p-5">
            <p className="text-base font-bold text-white">{summary.currentJob || 'Add your current role'}</p>
            <p className="mt-0.5 text-sm text-primary-100">{summary.currentCompany || 'Set up your career profile'}</p>
            <div className="mt-4 flex flex-row justify-between">
              <ScoreRing label="Career" score={summary.careerScore} color="#ffffff" />
              <ScoreRing label="Growth" score={summary.growthScore} color="#bfdbfe" />
              <ScoreRing label="Motivation" score={summary.motivationScore} color="#93c5fd" />
            </div>
          </div>
        ) : null}

        {summary ? (
          <div className="mb-4 flex flex-row flex-wrap justify-between rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 w-1/2">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.applications.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Applications Sent</p>
            </div>
            <div className="mb-3 w-1/2">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.upcomingInterviews.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming Interviews</p>
            </div>
            <div className="w-1/2">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.offersReceived}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Offers Received</p>
            </div>
            <div className="w-1/2">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.learningHours}h</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Learning Hours</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-row flex-wrap justify-between pb-6">
          {HUB_CARDS.map((card) => (
            <HubCard key={card.key} icon={card.icon} label={card.label} onPress={() => navigate(card.path)} />
          ))}
        </div>
      </PageContainer>
    </Screen>
  );
}
