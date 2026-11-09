import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loading } from '../components/common'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <div className="shell page-pad"><Loading /></div>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  return children
}
