const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://guviproject1lms-production.up.railway.app'

export const resolveAssetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`
  return `${API_BASE_URL}/${path}`
}
