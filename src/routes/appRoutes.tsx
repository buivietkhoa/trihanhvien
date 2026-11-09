import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../layouts/AuthLayout'
import MainLayout from '../layouts/MainLayout'
import Home from '../pages/Home'
import Teachers from '../pages/Teachers'
import TeacherProfile from '../pages/TeacherProfile'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import Courses from '../pages/Courses'
import CourseDetail from '../pages/CourseDetail'
import Booking from '../pages/booking/Booking'
import BookingConfirm from '../pages/booking/BookingConfirm'
import BookingSuccess from '../pages/booking/BookingSuccess'
import Wallet from '../pages/Wallet'
import Dashboard from '../pages/Dashboard'
import History from '../pages/History'
import Settings from '../pages/Settings'
import Contact from '../pages/Contact'
import Faq from '../pages/Faq'
import ProtectedRoute from './ProtectedRoute'

/** Trang đăng nhập/đăng ký: đã đăng nhập thì chuyển về trang đang định vào (mặc định Dashboard) */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth()
  const from = (useLocation().state as { from?: string } | null)?.from
  if (ready && user) return <Navigate to={from || '/dashboard'} replace />
  return <AuthLayout>{children}</AuthLayout>
}

function Logout() {
  const { logout } = useAuth()
  useEffect(logout, [logout])
  return <Navigate to="/" replace />
}

const page = (element: React.ReactNode, tinted = true) => <MainLayout tinted={tinted}>{element}</MainLayout>
const member = (element: React.ReactNode, compactFooter = false) => (
  <ProtectedRoute>
    <MainLayout tinted compactFooter={compactFooter}>
      {element}
    </MainLayout>
  </ProtectedRoute>
)

// Mã màn hình theo sitemap: M01–M17
export const appRoutes = [
  { path: '/login', element: <GuestOnly><Login /></GuestOnly> }, // M01
  { path: '/register', element: <GuestOnly><Register /></GuestOnly> }, // M02
  { path: '/forgot-password', element: <GuestOnly><ForgotPassword /></GuestOnly> }, // M03
  { path: '/', element: page(<Home />, false) }, // M04
  { path: '/teachers', element: page(<Teachers />, false) }, // M05
  { path: '/teachers/:id', element: page(<TeacherProfile />) }, // M06
  { path: '/courses', element: page(<Courses />) }, // M07
  { path: '/courses/:id', element: page(<CourseDetail />) }, // M08
  { path: '/booking/:teacherId', element: member(<Booking />, true) }, // M09
  { path: '/booking/confirm', element: member(<BookingConfirm />, true) }, // M10
  { path: '/booking/success', element: member(<BookingSuccess />, true) }, // M11
  { path: '/wallet', element: member(<Wallet />) }, // M12
  { path: '/dashboard', element: member(<Dashboard />) }, // M13
  { path: '/history', element: member(<History />) }, // M14
  { path: '/settings', element: member(<Settings />) }, // M15
  { path: '/contact', element: page(<Contact />) }, // M16
  { path: '/faq', element: page(<Faq />) }, // M17
  { path: '/logout', element: <Logout /> },
]
