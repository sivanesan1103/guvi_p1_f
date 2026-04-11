export function toUserMessage(status, url) {
  if (status === 401 && url?.includes('/auth/login')) return 'Invalid credentials'
  if (status === 401 || status === 403) return 'Access denied'
  return 'Something went wrong'
}
