import { normalizeBaseUrl } from './baseUrl'

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

export const resolveAssetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`
  return `${API_BASE_URL}/${path}`
}
