import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../layouts/Navbar'
import { useAuth } from '../../context/AuthContext'
import ErrorState from '../../components/ErrorState'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const role = await login(email, password)
      if (role === 'ADMIN') navigate('/admin/dashboard')
      else if (role === 'INSTRUCTOR') navigate('/instructor/dashboard')
      else navigate('/student/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Login to continue learning.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              required
            />
            {error ? <ErrorState message={error} /> : null}
            <button
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <p className="mt-5 text-sm text-slate-600">
            New here?{' '}
            <Link to="/register" className="font-semibold text-primary">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
