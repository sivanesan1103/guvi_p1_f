import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role, loading } = useAuth()
  if (loading) return <div className="p-10 text-center text-slate-600">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!roles.includes(role)) return <Navigate to="/dashboard" replace />
  return children
}
