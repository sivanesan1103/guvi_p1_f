import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../layouts/Navbar'
import { useAuth } from '../../context/AuthContext'
import ErrorState from '../../components/ErrorState'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const onChange = (event) =>
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }))

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const role = await register(form)
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
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Join LMS and start learning.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              required
            />
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
            >
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="ADMIN">Admin</option>
            </select>
            {error ? <ErrorState message={error} /> : null}
            <button
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Register'}
            </button>
          </form>
          <p className="mt-5 text-sm text-slate-600">
            Have an account?{' '}
            <Link to="/login" className="font-semibold text-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
