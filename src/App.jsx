import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CourseListPage from './pages/public/CourseListPage'
import ApprovedCoursesPage from './pages/public/ApprovedCoursesPage'
import CourseDetailsPage from './pages/public/CourseDetailsPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import InstructorDashboardPage from './pages/instructor/InstructorDashboardPage'
import StudentDashboardPage from './pages/student/StudentDashboardPage'
import StudentBrowseCoursesPage from './pages/student/StudentBrowseCoursesPage'
import StudentMyCoursesPage from './pages/student/StudentMyCoursesPage'
import ProtectedRoute from './routes/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function DashboardRedirect() {
  const { role } = useAuth()
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  if (role === 'INSTRUCTOR') return <Navigate to="/instructor/dashboard" replace />
  return <Navigate to="/student/dashboard" replace />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/courses/approved" element={<ApprovedCoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['ADMIN', 'INSTRUCTOR', 'STUDENT']}>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/*"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <InstructorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/browse-courses"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentBrowseCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-courses"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentMyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/courses" replace />} />
      </Routes>
    </HashRouter>
  )
}
