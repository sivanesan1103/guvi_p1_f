import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import { lmsApi } from '../../services/api'

export default function StudentDashboardPage() {
  const [myCourses, setMyCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const mine = await lmsApi.getMyCourses()
        setMyCourses(mine)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const completedCourses = useMemo(
    () => myCourses.filter((course) => Number(course.progress ?? 0) >= 100).length,
    [myCourses],
  )
  const inProgressCourses = useMemo(
    () => myCourses.filter((course) => Number(course.progress ?? 0) < 100).length,
    [myCourses],
  )
  const continueLearningCourse = useMemo(() => {
    const sorted = [...myCourses].sort(
      (a, b) => new Date(b.enrolledAt ?? 0).getTime() - new Date(a.enrolledAt ?? 0).getTime(),
    )
    return sorted.find((course) => Number(course.progress ?? 0) < 100) ?? sorted[0] ?? null
  }, [myCourses])
  const recentCourses = useMemo(
    () => [...myCourses]
      .sort((a, b) => new Date(b.enrolledAt ?? 0).getTime() - new Date(a.enrolledAt ?? 0).getTime())
      .slice(0, 3),
    [myCourses],
  )

  return (
    <DashboardLayout role="STUDENT" title="Student Dashboard">

      {loading ? <LoadingState text="Loading dashboard..." /> : null}
      {error ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">Enrolled Courses</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{myCourses.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">Completed Courses</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{completedCourses}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">In Progress Courses</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{inProgressCourses}</p>
            </div>
          </div>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-900">Continue Learning</h2>
            {continueLearningCourse ? (
              <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-base font-semibold text-slate-900">{continueLearningCourse.title}</p>
                  <p className="mt-1 text-sm text-slate-600">Progress: {continueLearningCourse.progress ?? 0}%</p>
                </div>
                <Link
                  to={`/courses/${continueLearningCourse.courseId}`}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  Continue
                </Link>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">No courses enrolled yet.</p>
            )}
          </section>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-900">Recently Enrolled</h2>
            {recentCourses.length ? (
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {recentCourses.map((course) => (
                  <Link
                    key={course.courseId}
                    to={`/courses/${course.courseId}`}
                    className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">No recent enrollments.</p>
            )}
          </section>
        </>
      ) : null}
    </DashboardLayout>
  )
}
