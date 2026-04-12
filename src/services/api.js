import axios from 'axios'
import { toUserMessage } from '../utils/errorMessage'
import { normalizeBaseUrl } from '../utils/baseUrl'

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

const getCurrentClientPath = () => {
  const hashPath = window.location.hash?.replace(/^#/, '')
  return hashPath || window.location.pathname
}

const api = axios.create({
  baseURL: API_BASE_URL,
})

const normalizeLesson = (lesson) => {
  const contentUrl = lesson?.contentUrl
    ?? (lesson?.type === 'VIDEO'
      ? lesson?.videoUrl
      : lesson?.type === 'PDF'
        ? lesson?.pdfUrl
        : lesson?.imageUrl)
    ?? ''

  return { ...lesson, contentUrl }
}

const toLessonPayload = (payload) => {
  const contentUrl = payload?.contentUrl?.trim?.() ?? ''
  if (contentUrl) {
    return {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      videoUrl: payload.type === 'VIDEO' ? contentUrl : null,
      pdfUrl: payload.type === 'PDF' ? contentUrl : null,
      imageUrl: payload.type === 'IMAGE' ? contentUrl : null,
    }
  }

  return {
    title: payload.title,
    description: payload.description,
    type: payload.type,
    videoUrl: payload.videoUrl ?? null,
    pdfUrl: payload.pdfUrl ?? null,
    imageUrl: payload.imageUrl ?? null,
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url
    const backendMessage = error?.response?.data?.message
    const message = backendMessage || toUserMessage(status, url)
    const enhancedError = new Error(message)
    enhancedError.status = status
    enhancedError.raw = error
    if (enhancedError.status === 401 && getCurrentClientPath() !== '/login') {
      localStorage.removeItem('lms_token')
      localStorage.removeItem('lms_role')
    }
    return Promise.reject(enhancedError)
  },
)

export const lmsApi = {
  login: async (payload) => (await api.post('/auth/login', payload)).data,
  register: async (payload) => (await api.post('/auth/register', payload)).data,
  getCourses: async () => (await api.get('/courses')).data,
  getCourseById: async (id) => (await api.get(`/courses/${id}`)).data,
  getApprovedCourses: async () => (await api.get('/courses/approved')).data,
  getApprovedCoursesWithFilters: async (params) => (await api.get('/courses/approved', { params })).data,
  getLessonsByCourse: async (courseId) => (
    await api.get(`/courses/${courseId}/lessons`)
  ).data.map(normalizeLesson),

  getUsers: async () => (await api.get('/admin/users')).data,
  getAdminCourses: async () => (await api.get('/admin/courses')).data,
  updateUserRole: async (id, role) => (await api.put(`/admin/users/${id}/role`, { role })).data,
  deleteUser: async (id) => (await api.delete(`/api/users/${id}`)).data,
  approveCourse: async (id) => (await api.put(`/api/courses/${id}/approve`)).data,
  rejectCourse: async (id) => (await api.put(`/admin/courses/${id}/reject`)).data,
  deleteCourseByAdmin: async (id) => (await api.delete(`/api/courses/${id}`)).data,

  createCourse: async (payload) => (await api.post('/instructor/courses', payload)).data,
  getInstructorCourses: async () => (await api.get('/instructor/courses')).data,
  updateInstructorCourse: async (id, payload) => (await api.put(`/instructor/courses/${id}`, payload)).data,
  createLesson: async (courseId, payload) => normalizeLesson(
    (await api.post(`/instructor/lessons/${courseId}`, toLessonPayload(payload))).data,
  ),
  updateLesson: async (lessonId, payload) => normalizeLesson(
    (await api.put(`/instructor/lessons/${lessonId}`, toLessonPayload(payload))).data,
  ),
  deleteLesson: async (lessonId) => (await api.delete(`/instructor/lessons/${lessonId}`)).data,
  getEnrolledStudentsForCourse: async (courseId) => (await api.get(`/instructor/courses/${courseId}/students`)).data,
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return (await api.post('/api/upload', formData)).data
  },

  enrollCourse: async (courseId) => (await api.post(`/enroll/${courseId}`)).data,
  getMyCourses: async () => (await api.get('/students/enrolled-courses')).data,
  updateStudentProgress: async (courseId, progress) => (
    await api.put(`/student/courses/${courseId}/progress`, { progress })
  ).data,
}

export default api
