import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { lmsApi } from '../services/api'

const AuthContext = createContext(null)

const getStoredToken = () => localStorage.getItem('lms_token')
const getStoredRole = () => localStorage.getItem('lms_role')
const getStoredUserId = () => localStorage.getItem('lms_user_id')

function parseTokenUser(token) {
  try {
    const decoded = jwtDecode(token)
    return { email: decoded.sub ?? '', ...decoded }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken())
  const [role, setRole] = useState(getStoredRole())
  const [userId, setUserId] = useState(getStoredUserId())
  const [user, setUser] = useState(token ? parseTokenUser(token) : null)
  const [loading, setLoading] = useState(true)

  const persistSession = useCallback((nextToken, nextRole, nextUserId) => {
    localStorage.setItem('lms_token', nextToken)
    localStorage.setItem('lms_role', nextRole)
    localStorage.setItem('lms_user_id', String(nextUserId))
    setToken(nextToken)
    setRole(nextRole)
    setUserId(String(nextUserId))
    setUser(parseTokenUser(nextToken))
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_role')
    localStorage.removeItem('lms_user_id')
    setToken(null)
    setRole(null)
    setUserId(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const bootstrap = () => {
      if (!token) {
        setLoading(false)
        return
      }
      const parsed = parseTokenUser(token)
      if (!parsed) {
        clearSession()
        setLoading(false)
        return
      }

      const nowInSeconds = Math.floor(Date.now() / 1000)
      if (typeof parsed.exp === 'number' && parsed.exp <= nowInSeconds) {
        clearSession()
        setLoading(false)
        return
      }

      setUser(parsed)
      if (!role && parsed.role) {
        setRole(parsed.role)
        localStorage.setItem('lms_role', parsed.role)
      }
      if (!userId && parsed.userId) {
        setUserId(String(parsed.userId))
        localStorage.setItem('lms_user_id', String(parsed.userId))
      }
      setLoading(false)
    }
    bootstrap()
  }, [token, role, userId, clearSession])

  const login = useCallback(async (email, password) => {
    const data = await lmsApi.login({ email, password })
    persistSession(data.token, data.role, data.userId)
    return data.role
  }, [persistSession])

  const register = useCallback(async (payload) => {
    const data = await lmsApi.register(payload)
    persistSession(data.token, data.role, data.userId)
    return data.role
  }, [persistSession])

  const logout = useCallback(() => clearSession(), [clearSession])

  const value = useMemo(
    () => ({
      token,
      role,
      userId,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, role, userId, user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
