import { useEffect, useState } from 'react'
import Navbar from '../../layouts/Navbar'
import { lmsApi } from '../../services/api'
import CourseCard from '../../components/CourseCard'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

export default function CourseListPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCourses(await lmsApi.getCourses())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-700 p-8 text-white shadow-soft">
          <h1 className="text-3xl font-bold md:text-4xl">Discover LMS Courses</h1>
          <p className="mt-2 text-sm text-violet-100">Learn from curated courses and practical lessons.</p>
        </div>
        <div className="mt-8">
          {loading ? <LoadingState text="Loading courses..." /> : null}
          {error ? <ErrorState message={error} /> : null}
          {!loading && !error ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} showDetails={false} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
