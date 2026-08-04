// Mirrors backend/src/modules/documents/model/Document.model.js exactly —
// keep these two lists in sync if the backend enum ever changes.
export const CATEGORIES = [
  'certificate', 'medical_report', 'government_id', 'passport', 'driving_licence', 'insurance', 'other',
  'personal', 'education', 'career', 'finance', 'legal', 'travel', 'property', 'business',
  'receipt', 'invoice', 'contract', 'research', 'knowledge', 'scanned', 'archive',
];

export const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export const CONFIDENTIALITY_LEVELS = ['public', 'internal', 'confidential', 'secret'];

export const STATUSES = ['draft', 'active', 'pending_review', 'approved', 'expired', 'archived'];

export const FOLDER_COLORS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'teal', 'cyan', 'blue', 'indigo', 'violet', 'pink', 'gray',
];
