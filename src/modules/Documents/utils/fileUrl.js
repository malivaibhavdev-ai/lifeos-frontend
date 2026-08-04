import { API_URL } from '../../../config/env';

// The backend returns `fileUrl` as a server-relative path (e.g.
// "/uploads/169...-scan.pdf"), served outside the /api/v1 prefix — strip
// that prefix off API_URL to get the server root to open/download from.
const SERVER_ROOT = API_URL.replace(/\/api\/v1\/?$/, '');

export function resolveFileUrl(fileUrl) {
  if (!fileUrl) return null;
  return `${SERVER_ROOT}${fileUrl}`;
}
