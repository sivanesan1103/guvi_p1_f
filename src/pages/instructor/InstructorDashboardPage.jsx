import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import DashboardCard from '../../components/DashboardCard'
import CourseCard from '../../components/CourseCard'
import FileUpload from '../../components/FileUpload'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import { lmsApi } from '../../services/api'

const initialCourseForm = {
  title: '',
  description: '',
  thumbnailUrl: '',
  category: '',
  level: 'BEGINNER',
}
const initialLessonForm = { title: '', description: '', type: 'VIDEO', contentUrl: '' }

export default function InstructorDashboardPage() {
  const location = useLocation()
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [lessons, setLessons] = useState([])
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [courseForm, setCourseForm] = useState(initialCourseForm)
  const [lessonForm, setLessonForm] = useState(initialLessonForm)
  const [lessonFile, setLessonFile] = useState(null)
  const [editLessonId, setEditLessonId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  const loadCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await lmsApi.getInstructorCourses()
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    if (!selectedCourseId && courses.length) {
      setSelectedCourseId(String(courses[0].id))
    }
  }, [courses, selectedCourseId])

  useEffect(() => {
    const loadLessons = async () => {
      if (!selectedCourseId) {
        setLessons([])
        setEnrolledStudents([])
        return
      }
      try {
        const data = await lmsApi.getLessonsByCourse(selectedCourseId)
        setLessons(data)
        const students = await lmsApi.getEnrolledStudentsForCourse(selectedCourseId)
        setEnrolledStudents(students)
      } catch (err) {
        setError(err.message)
      }
    }
    loadLessons()
  }, [selectedCourseId])

  useEffect(() => {
    if (location.hash === '#students') {
      requestAnimationFrame(() => {
        document.getElementById('students')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [location.hash, enrolledStudents.length, selectedCourseId])

  const summary = useMemo(
    () => ({
      total: courses.length,
      approved: courses.filter((c) => c.status === 'APPROVED').length,
    }),
    [courses],
  )

  const createCourse = async (event) => {
    event.preventDefault()
    setError('')
    setNote('')
    try {
      await lmsApi.createCourse(courseForm)
      setCourseForm(initialCourseForm)
      setNote('Course created successfully.')
      await loadCourses()
    } catch (err) {
      setError(err.message)
    }
  }

  const submitLesson = async (event) => {
    event.preventDefault()
    setError('')
    setNote('')
    try {
      if (!selectedCourseId) throw new Error('Select a course first')
      if (!lessonFile && !lessonForm.contentUrl) throw new Error('Upload failed')
      const uploadedUrl = lessonFile ? (await lmsApi.uploadFile(lessonFile)).url : lessonForm.contentUrl
      const payload = { ...lessonForm, contentUrl: uploadedUrl }
      if (editLessonId) {
        await lmsApi.updateLesson(editLessonId, payload)
        setNote('Lesson updated.')
      } else {
        await lmsApi.createLesson(selectedCourseId, payload)
        setNote('Lesson created.')
      }
      const data = await lmsApi.getLessonsByCourse(selectedCourseId)
      setLessons(data)
      const students = await lmsApi.getEnrolledStudentsForCourse(selectedCourseId)
      setEnrolledStudents(students)
      setLessonForm(initialLessonForm)
      setLessonFile(null)
      setEditLessonId(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const onEditLesson = (lesson) => {
    setEditLessonId(lesson.id)
      setLessonForm({
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        contentUrl: lesson.contentUrl,
      })
    setLessonFile(null)
  }

  const onDeleteLesson = async (id) => {
    setError('')
    try {
      await lmsApi.deleteLesson(id)
      const data = await lmsApi.getLessonsByCourse(selectedCourseId)
      setLessons(data)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <DashboardLayout role="INSTRUCTOR" title="Instructor Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Visible Courses" value={summary.total} />
        <DashboardCard title="Approved Courses" value={summary.approved} />
        <DashboardCard title="Lessons in Selected Course" value={lessons.length} />
      </div>

      {error ? <div className="mt-6"><ErrorState message={error} /></div> : null}
      {note ? <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{note}</div> : null}

      <section className="mt-8">
        <form onSubmit={createCourse} className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-xl font-bold">Create Course</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={courseForm.title}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Course title"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
            <input
              value={courseForm.category}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Category"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <select
              value={courseForm.level}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, level: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <textarea
              value={courseForm.description}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Course description"
              className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
              required
            />
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-slate-700">Course thumbnail</p>
              <FileUpload
                label="Upload thumbnail"
                accept="image/*"
                onUploaded={(url) => setCourseForm((prev) => ({ ...prev, thumbnailUrl: url }))}
              />
              {courseForm.thumbnailUrl ? (
                <img src={courseForm.thumbnailUrl} alt="Course thumbnail preview" className="h-24 rounded-lg border border-slate-200 object-cover" />
              ) : null}
            </div>
          </div>
          <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
            Create Course
          </button>
        </form>
      </section>

      <section id="courses" className="mt-8">
        <h2 className="mb-4 text-xl font-bold">My Courses</h2>
        {loading ? <LoadingState text="Loading courses..." /> : null}
        {!loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-xl font-bold">Lesson Management</h2>
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={submitLesson} className="grid gap-3 md:grid-cols-4">
          <input
            value={lessonForm.title}
            onChange={(e) => setLessonForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Lesson title"
            className="rounded-lg border border-slate-300 px-3 py-2"
            required
          />
          <input
            value={lessonForm.description}
            onChange={(e) => setLessonForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Lesson description"
            className="rounded-lg border border-slate-300 px-3 py-2"
            required
          />
          <select
            value={lessonForm.type}
            onChange={(e) => setLessonForm((prev) => ({ ...prev, type: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="VIDEO">VIDEO</option>
            <option value="PDF">PDF</option>
            <option value="IMAGE">IMAGE</option>
          </select>
          <input type="file" accept={lessonForm.type === 'VIDEO' ? 'video/*' : lessonForm.type === 'PDF' ? 'application/pdf' : 'image/*'} onChange={(e) => setLessonFile(e.target.files?.[0] ?? null)} className="rounded-lg border border-slate-300 px-3 py-2" />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
            {editLessonId ? 'Update Lesson' : 'Add Lesson'}
          </button>
        </form>
        {lessonForm.contentUrl ? <p className="mt-2 break-all text-xs text-slate-600">{lessonForm.contentUrl}</p> : null}

        <div className="mt-5 overflow-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-200 p-2 text-left">Title</th>
                  <th className="border border-slate-200 p-2 text-left">Description</th>
                  <th className="border border-slate-200 p-2 text-left">Type</th>
                  <th className="border border-slate-200 p-2 text-left">Media</th>
                  <th className="border border-slate-200 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td className="border border-slate-200 p-2">{lesson.title}</td>
                    <td className="border border-slate-200 p-2">{lesson.description}</td>
                    <td className="border border-slate-200 p-2">{lesson.type}</td>
                    <td className="max-w-[200px] truncate border border-slate-200 p-2">
                      <a href={lesson.contentUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                        Open Media
                      </a>
                    </td>
                    <td className="border border-slate-200 p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditLesson(lesson)}
                        className="rounded border border-primary px-2 py-1 text-xs font-semibold text-primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteLesson(lesson.id)}
                        className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-600"
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
      </section>

      <section id="students" className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-xl font-bold">Enrolled Students List</h2>
        {enrolledStudents.length ? (
          <div className="overflow-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-200 p-2 text-left">Student Name</th>
                  <th className="border border-slate-200 p-2 text-left">Email</th>
                  <th className="border border-slate-200 p-2 text-left">Course Name</th>
                  <th className="border border-slate-200 p-2 text-left">Enrollment Date</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((student) => (
                  <tr key={student.enrollmentId}>
                    <td className="border border-slate-200 p-2">{student.studentName}</td>
                    <td className="border border-slate-200 p-2">{student.studentEmail}</td>
                    <td className="border border-slate-200 p-2">{student.courseTitle}</td>
                    <td className="border border-slate-200 p-2">{new Date(student.enrolledAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            {selectedCourseId ? 'No enrollments yet for selected course.' : 'Select a course to view enrolled students.'}
          </p>
        )}
      </section>
    </DashboardLayout>
  )
}
