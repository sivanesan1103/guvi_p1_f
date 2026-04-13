import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import DashboardCard from '../../components/DashboardCard'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import LessonViewer from '../../components/LessonViewer'
import { lmsApi } from '../../services/api'

export default function AdminDashboardPage() {
  const location = useLocation()
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [userError, setUserError] = useState('')
  const [courseError, setCourseError] = useState('')
  const [viewCourse, setViewCourse] = useState(null)
  const [viewLessons, setViewLessons] = useState([])
  const [viewLoading, setViewLoading] = useState(false)
  const [activeLesson, setActiveLesson] = useState(null)

  const loadAll = async () => {
    setLoading(true)
    setUserError('')
    setCourseError('')
    try {
      const [userData, courseData] = await Promise.all([lmsApi.getUsers(), lmsApi.getAdminCourses()])
      setUsers(userData)
      setCourses(courseData)
    } catch {
      setUserError('Something went wrong')
      setCourseError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (location.hash === '#users' || location.hash === '#courses') {
      requestAnimationFrame(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [location.hash])

  const removeUser = async (id) => {
    setUserError('')
    try {
      await lmsApi.deleteUser(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch {
      setUserError('Delete failed')
    }
  }

  const approveCourse = async (courseId) => {
    setCourseError('')
    try {
      const updated = await lmsApi.approveCourse(courseId)
      setCourses((prev) => prev.map((course) => (course.id === courseId ? updated : course)))
    } catch {
      setCourseError('Approval failed')
    }
  }

  const deleteCourse = async (courseId) => {
    setCourseError('')
    try {
      await lmsApi.deleteCourseByAdmin(courseId)
      setCourses((prev) => prev.filter((course) => course.id !== courseId))
    } catch {
      setCourseError('Delete failed')
    }
  }

  const viewCourseDetails = async (courseId) => {
    setViewLoading(true)
    try {
      const [courseData, lessonsData] = await Promise.all([
        lmsApi.getCourseById(courseId),
        lmsApi.getLessonsByCourse(courseId),
      ])
      setViewCourse(courseData)
      setViewLessons(lessonsData)
      setActiveLesson(lessonsData[0] ?? null)
    } catch {
      setCourseError('Failed to load course details')
    } finally {
      setViewLoading(false)
    }
  }

  const closeView = () => {
    setViewCourse(null)
    setViewLessons([])
    setActiveLesson(null)
  }

  return (
    <DashboardLayout role="ADMIN" title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Total Users" value={users.length} />
        <DashboardCard title="Total Courses" value={courses.length} />
        <DashboardCard title="Pending Approvals" value={courses.filter((c) => c.status === 'PENDING').length} />
      </div>

      <section id="users" className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-xl font-bold">Users Management</h2>
        {userError ? <ErrorState message={userError} /> : null}
        {loading ? <LoadingState text="Loading users..." /> : null}
        {!loading ? (
          <div className="overflow-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-200 p-2 text-left">Name</th>
                  <th className="border border-slate-200 p-2 text-left">Email</th>
                  <th className="border border-slate-200 p-2 text-left">Role</th>
<th className="border border-slate-200 p-2 text-left">Actions</th>
                  <th className="border border-slate-200 p-2 text-left">Content</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="border border-slate-200 p-2">{user.name}</td>
                    <td className="border border-slate-200 p-2">{user.email}</td>
                    <td className="border border-slate-200 p-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-violet-100 text-violet-700'
                            : user.role === 'INSTRUCTOR'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="border border-slate-200 p-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => removeUser(user.id)}
                          disabled={user.role === 'ADMIN'}
                          className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section id="courses" className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Course Approval</h2>
        {courseError ? <ErrorState message={courseError} /> : null}
        <div className="overflow-auto rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-200 p-2 text-left">Title</th>
                <th className="border border-slate-200 p-2 text-left">Instructor</th>
                <th className="border border-slate-200 p-2 text-left">Status</th>
                <th className="border border-slate-200 p-2 text-left">Actions</th>
                <th className="border border-slate-200 p-2 text-left">Content</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="border border-slate-200 p-2">{course.title}</td>
                  <td className="border border-slate-200 p-2">{course.instructorName ?? '-'}</td>
                  <td className="border border-slate-200 p-2">{course.status ?? '-'}</td>
                  <td className="border border-slate-200 p-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveCourse(course.id)}
                        disabled={course.status === 'APPROVED'}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                  <td className="border border-slate-200 p-2">
                    <button
                      onClick={() => viewCourseDetails(course.id)}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {viewCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{viewCourse.title}</h2>
              <button onClick={closeView} className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold">
                Close
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">{viewCourse.description}</p>
            {viewLoading ? (
              <LoadingState text="Loading content..." />
            ) : (
              <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
                <div className="rounded-lg border border-slate-200 p-3">
                  <h3 className="mb-2 font-semibold">Lessons</h3>
                  <div className="space-y-2">
                    {viewLessons.length === 0 ? (
                      <p className="text-sm text-slate-500">No lessons yet.</p>
                    ) : (
                      viewLessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full rounded border px-2 py-1.5 text-left text-xs ${
                            activeLesson?.id === lesson.id
                              ? 'border-primary bg-violet-50 text-primary'
                              : 'border-slate-200'
                          }`}
                        >
                          {lesson.title}
                        </button>
                      ))
                    )}
                  </div>
                </div>
                <LessonViewer lesson={activeLesson} />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  )
}
