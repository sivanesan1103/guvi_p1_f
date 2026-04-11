import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function DashboardLayout({ role, title, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row">
        <div className="md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:self-start">
          <Sidebar role={role} />
        </div>
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <h1 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  )
}
