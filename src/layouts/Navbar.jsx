import { GraduationCap, LogOut, Menu, UserCircle2, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { role, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const onLogout = () => {
    logout()
    navigate('/login')
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between px-3 md:px-4 lg:px-6">
        <Link to="/courses" className="flex items-center gap-2 text-primary">
          <GraduationCap className="h-7 w-7" />
          <span className="text-xl font-bold">LMS Portal</span>
        </Link>
        <button className="md:hidden" onClick={() => setOpen((prev) => !prev)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                <UserCircle2 size={16} />
                {role}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">
                Login
              </Link>
              <Link to="/register" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold">
                Dashboard
              </Link>
              <button onClick={onLogout} className="rounded border border-slate-300 px-3 py-2 text-left text-sm font-semibold">
                Logout ({role})
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setOpen(false)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold">
                Login
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="rounded bg-primary px-3 py-2 text-sm font-semibold text-white">
                Register
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </header>
  )
}
