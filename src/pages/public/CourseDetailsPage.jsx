import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../layouts/Navbar'
import { lmsApi } from '../../services/api'
import LessonViewer from '../../components/LessonViewer'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import { useAuth } from '../../context/AuthContext'

export default function CourseDetailsPage() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const { role, isAuthenticated } = useAuth()
  const [course, setCourse] = useState(null)
  const [myCourses, setMyCourses] = useState([])
  const [lessons, setLessons] = useState([])
  const [activeLesson, setActiveLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await lmsApi.getCourseById(courseId)
        const enrolledCourses = isAuthenticated && role === 'STUDENT'
          ? await lmsApi.getMyCourses()
          : []
        const studentCanViewLessons = !isAuthenticated
          || role !== 'STUDENT'
          || enrolledCourses.some((enrolledCourse) => String(enrolledCourse.courseId) === String(courseId))
        const lessonData = studentCanViewLessons ? await lmsApi.getLessonsByCourse(courseId) : []

        setCourse(courseData)
        setLessons(lessonData)
        setMyCourses(enrolledCourses)
        setActiveLesson(lessonData[0] ?? null)
      } catch {
        setError('Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [courseId, isAuthenticated, role])

  const isAlreadyEnrolled = useMemo(
    () => myCourses.some((enrolledCourse) => String(enrolledCourse.courseId) === String(courseId)),
    [myCourses, courseId],
  )
  const currentProgress = useMemo(
    () => myCourses.find((enrolledCourse) => String(enrolledCourse.courseId) === String(courseId))?.progress ?? 0,
    [myCourses, courseId],
  )
  const canViewLessons = useMemo(
    () => !isAuthenticated || role !== 'STUDENT' || isAlreadyEnrolled,
    [isAuthenticated, role, isAlreadyEnrolled],
  )

  const enroll = async () => {
    setMessage('')
    try {
      await lmsApi.enrollCourse(courseId)
      setMessage('Enrollment successful.')
      const refreshed = await lmsApi.getMyCourses()
      setMyCourses(refreshed)
      const lessonData = await lmsApi.getLessonsByCourse(courseId)
      setLessons(lessonData)
      setActiveLesson(lessonData[0] ?? null)
    } catch {
      setMessage('Something went wrong')
    }
  }

  useEffect(() => {
    const trackProgress = async () => {
      if (!isAuthenticated || role !== 'STUDENT' || !isAlreadyEnrolled) return
      if (!activeLesson || !lessons.length) return

      const lessonIndex = lessons.findIndex((lesson) => lesson.id === activeLesson.id)
      if (lessonIndex < 0) return

      const nextProgress = Math.round(((lessonIndex + 1) / lessons.length) * 100)
      if (nextProgress <= currentProgress) return

      try {
        await lmsApi.updateStudentProgress(courseId, nextProgress)
        setMyCourses((prev) => prev.map((course) => (
          String(course.courseId) === String(courseId)
            ? { ...course, progress: nextProgress }
            : course
        )))
      } catch {
        setError('Something went wrong')
      }
    }

    trackProgress()
  }, [activeLesson, lessons, isAuthenticated, role, isAlreadyEnrolled, currentProgress, courseId])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
        <button
          onClick={() => navigate('/courses')}
          className="mb-4 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Courses
        </button>
        {loading ? <LoadingState text="Loading course details..." /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !error && course ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-xl bg-slate-900 p-8 text-white shadow-soft">
                <h1 className="text-3xl font-bold md:text-4xl">{course.title}</h1>
                <p className="mt-3 text-sm text-slate-300">{course.description}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="text-sm text-slate-500">Instructor</p>
                <p className="text-lg font-semibold">{course.instructorName ?? 'Instructor'}</p>
                {isAuthenticated && role === 'STUDENT' ? (
                  <button
                    onClick={enroll}
                    disabled={isAlreadyEnrolled}
                    className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isAlreadyEnrolled ? 'Enrolled' : 'Enroll'}
                  </button>
                ) : null}
                {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
              </div>
            </div>
            {canViewLessons ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
                  <h2 className="mb-3 text-lg font-bold">Lessons</h2>
                  <div className="space-y-2">
                    {lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                          activeLesson?.id === lesson.id
                            ? 'border-primary bg-violet-50 text-primary'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {lesson.title}
                      </button>
                    ))}
                  </div>
                </div>
                <LessonViewer lesson={activeLesson} />
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                Enroll in this course to view lessons and learning content.
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
