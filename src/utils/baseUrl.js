const DEFAULT_API_BASE_URL = 'https://guviproject1lms-production.up.railway.app/'

export const normalizeBaseUrl = (value) => {
  const raw = (value || '').trim()
  if (!raw) return DEFAULT_API_BASE_URL
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `https://${raw}`
}

export { DEFAULT_API_BASE_URL }
