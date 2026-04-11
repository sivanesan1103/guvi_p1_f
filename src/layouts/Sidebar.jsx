import { createElement, useState } from 'react'
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, LayoutDashboard, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const roleMenus = {
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/dashboard#users', label: 'User Management', icon: Users },
    { to: '/admin/dashboard#courses', label: 'Course Approval', icon: CheckCircle2 },
  ],
  INSTRUCTOR: [
    { to: '/instructor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/instructor/dashboard#students', label: 'Enrolled Students', icon: Users },
  ],
  STUDENT: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/browse-courses', label: 'Browse Courses', icon: BookOpen },
    { to: '/student/my-courses', label: 'My Courses', icon: CheckCircle2 },
  ],
}

export default function Sidebar({ role }) {
  const location = useLocation()
  const items = roleMenus[role] ?? []
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`${
        collapsed ? 'md:w-[70px]' : 'md:w-[220px]'
      } w-full border-r border-slate-200/80 bg-white transition-all duration-200`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 p-4 text-sm font-semibold text-slate-800">
        {!collapsed ? 'Navigation' : 'Nav'}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-md border border-slate-200 p-1 text-slate-600 transition-colors duration-200 hover:bg-slate-100"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
      <nav className="space-y-1 p-2">
        {items.map(({ to, label, icon: Icon }) => {
          const routePath = to.split('#')[0]
          const targetHash = to.includes('#') ? `#${to.split('#')[1]}` : ''
          const active = location.pathname === routePath
            && (targetHash ? location.hash === targetHash : !location.hash)
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {createElement(Icon, { size: 17 })}
              {!collapsed ? label : null}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
