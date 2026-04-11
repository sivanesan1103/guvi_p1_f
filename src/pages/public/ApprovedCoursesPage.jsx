import { useEffect, useState } from 'react'
import Navbar from '../../layouts/Navbar'
import { lmsApi } from '../../services/api'
import CourseCard from '../../components/CourseCard'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import { useAuth } from '../../context/AuthContext'

export default function ApprovedCoursesPage() {
  const { isAuthenticated, role } = useAuth()
  const [courses, setCourses] = useState([])
  const [myCourses, setMyCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 6

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [approved, mine] = await Promise.all([
          lmsApi.getApprovedCourses(),
          isAuthenticated && role === 'STUDENT' ? lmsApi.getMyCourses() : Promise.resolve([]),
        ])
        setCourses(approved)
        setMyCourses(mine)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [isAuthenticated, role])

  const searchedCourses = courses
    .filter((course) => {
      const term = search.trim().toLowerCase()
      if (!term) return true
      return (
        course.title.toLowerCase().includes(term) ||
        (course.instructorName ?? '').toLowerCase().includes(term)
      )
    })

  const totalPages = Math.max(1, Math.ceil(searchedCourses.length / pageSize))
  const start = (page - 1) * pageSize
  const pageCourses = searchedCourses.slice(start, start + pageSize)

  const enrollCourse = async (course) => {
    try {
      await lmsApi.enrollCourse(course.id)
      const mine = await lmsApi.getMyCourses()
      setMyCourses(mine)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
        <h1 className="mb-6 text-3xl font-bold">Approved Courses</h1>
        <div className="mb-6 flex w-full md:max-w-md">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search title or instructor"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {loading ? <LoadingState text="Loading approved courses..." /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !error ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pageCourses.length ? pageCourses.map((course) => {
              const isEnrolled = myCourses.some((myCourse) => String(myCourse.courseId) === String(course.id))
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  action={isAuthenticated && role === 'STUDENT' && !isEnrolled ? enrollCourse : undefined}
                  actionLabel={isEnrolled ? 'Enrolled' : 'Enroll'}
                  actionDisabled={isEnrolled}
                />
              )
            }) : <p>No approved courses available.</p>}
          </div>
        ) : null}
        {!loading && !error ? (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
