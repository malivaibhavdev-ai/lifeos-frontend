// Mirrors lifeos-backend-js/src/modules/career/constants/careerConstants.js
// — plain object maps keyed by backend enum value, `label` for display,
// `*_ORDER` arrays for stable display order, same convention as
// healthConstants.js / financeConstants.js.

export const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'freelance', 'internship', 'self_employed'];
export const WORK_MODE = ['onsite', 'remote', 'hybrid'];
export const CAREER_STAGE = ['student', 'entry_level', 'early_career', 'mid_career', 'senior', 'leadership', 'executive', 'entrepreneur'];
export const PORTFOLIO_LINK_PLATFORMS = ['github', 'linkedin', 'website', 'behance', 'dribbble', 'stackoverflow', 'medium', 'twitter', 'other'];

export const SKILL_CATEGORIES = {
  technical: { label: 'Technical' }, soft: { label: 'Soft Skills' }, management: { label: 'Management' },
  leadership: { label: 'Leadership' }, communication: { label: 'Communication' }, languages: { label: 'Languages' },
  design: { label: 'Design' }, development: { label: 'Development' }, cloud: { label: 'Cloud' }, ai: { label: 'AI' },
  database: { label: 'Database' }, devops: { label: 'DevOps' }, testing: { label: 'Testing' }, mobile: { label: 'Mobile' },
  backend: { label: 'Backend' }, frontend: { label: 'Frontend' }, data_science: { label: 'Data Science' },
  cyber_security: { label: 'Cyber Security' }, marketing: { label: 'Marketing' }, sales: { label: 'Sales' },
  finance: { label: 'Finance' }, hr: { label: 'HR' }, operations: { label: 'Operations' }, custom: { label: 'Custom' },
};
export const SKILL_CATEGORY_ORDER = Object.keys(SKILL_CATEGORIES);
export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
export const SKILL_IMPORTANCE = ['low', 'medium', 'high', 'critical'];

export const LEARNING_PLATFORMS = {
  course: 'Course', book: 'Book', youtube: 'YouTube', udemy: 'Udemy', coursera: 'Coursera',
  linkedin_learning: 'LinkedIn Learning', internal_training: 'Internal Training', other: 'Other',
};
export const LEARNING_PLATFORM_ORDER = Object.keys(LEARNING_PLATFORMS);
export const LEARNING_STATUS = ['not_started', 'in_progress', 'completed', 'abandoned'];

export const CERTIFICATION_STATUS = ['active', 'expired', 'in_progress', 'planned'];

export const JOB_APPLICATION_STATUS = {
  wishlist: { label: 'Wishlist', color: '#94a3b8' },
  applied: { label: 'Applied', color: '#3b82f6' },
  assessment: { label: 'Assessment', color: '#8b5cf6' },
  interview: { label: 'Interview', color: '#f59e0b' },
  offer: { label: 'Offer', color: '#22c55e' },
  rejected: { label: 'Rejected', color: '#ef4444' },
  accepted: { label: 'Accepted', color: '#16a34a' },
  withdrawn: { label: 'Withdrawn', color: '#64748b' },
};
export const JOB_APPLICATION_STATUS_ORDER = Object.keys(JOB_APPLICATION_STATUS);

export const INTERVIEW_PREP_STATUS = ['not_started', 'in_progress', 'ready'];
export const INTERVIEW_RESULT = ['pending', 'passed', 'failed', 'cancelled'];

export const CONTACT_RELATIONSHIP = ['mentor', 'manager', 'recruiter', 'hr', 'client', 'colleague', 'friend', 'other'];

export const CAREER_DOCUMENT_TYPES = {
  offer_letter: 'Offer Letter', experience_letter: 'Experience Letter', payslip: 'Payslip',
  certificate: 'Certificate', resume: 'Resume', identity: 'Identity', performance_review: 'Performance Review',
  contract: 'Contract', reference_letter: 'Reference Letter', nda: 'NDA', tax_document: 'Tax Document', other: 'Other',
};
export const CAREER_DOCUMENT_TYPE_ORDER = Object.keys(CAREER_DOCUMENT_TYPES);

export const CAREER_COLORS = ['#2563eb', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
