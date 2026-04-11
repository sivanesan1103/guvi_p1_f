import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import CourseCard from '../../components/CourseCard'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import { lmsApi } from '../../services/api'

export default function StudentMyCoursesPage() {
  const navigate = useNavigate()
  const [myCourses, setMyCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMyCourses = async () => {
      setLoading(true)
      setError('')
      try {
        const enrolled = await lmsApi.getMyCourses()
        setMyCourses(enrolled)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMyCourses()
  }, [])

  return (
    <DashboardLayout role="STUDENT" title="My Courses">
      {loading ? <LoadingState text="Loading enrolled courses..." /> : null}
      {error ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {myCourses.length ? myCourses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              action={(selected) => navigate(`/courses/${selected.courseId ?? selected.id}`)}
              actionLabel="Continue Learning"
            />
          )) : <p className="text-sm text-slate-600">No enrolled courses yet.</p>}
        </div>
      ) : null}
    </DashboardLayout>
  )
}

