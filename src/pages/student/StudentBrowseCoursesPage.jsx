import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import CourseCard from '../../components/CourseCard'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import { lmsApi } from '../../services/api'

export default function StudentBrowseCoursesPage() {
  const [courses, setCourses] = useState([])
  const [myCourses, setMyCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 6

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      setError('')
      try {
        const [approved, mine] = await Promise.all([lmsApi.getApprovedCourses(), lmsApi.getMyCourses()])
        setCourses(approved)
        setMyCourses(mine)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const categoryOptions = useMemo(
    () => [...new Set(courses.map((course) => course.category).filter(Boolean))],
    [courses],
  )

  const filteredCourses = courses
    .filter((course) => {
      const term = search.trim().toLowerCase()
      if (!term) return true
      return (
        course.title.toLowerCase().includes(term)
        || (course.instructorName ?? '').toLowerCase().includes(term)
      )
    })
    .filter((course) => (!category ? true : (course.category ?? '').toLowerCase() === category.toLowerCase()))
    .filter((course) => (!level ? true : course.level === level))

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize))
  const start = (page - 1) * pageSize
  const pageCourses = filteredCourses.slice(start, start + pageSize)

  const enrollCourse = async (course) => {
    setError('')
    try {
      await lmsApi.enrollCourse(course.id)
      const mine = await lmsApi.getMyCourses()
      setMyCourses(mine)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <DashboardLayout role="STUDENT" title="Browse Courses">
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Search by title or instructor"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-1"
        />
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value)
            setPage(1)
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select
          value={level}
          onChange={(event) => {
            setLevel(event.target.value)
            setPage(1)
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
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
                action={!isEnrolled ? enrollCourse : undefined}
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
    </DashboardLayout>
  )
}
