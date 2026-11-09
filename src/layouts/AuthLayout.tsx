import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import MainLayout from './MainLayout'
import Home from '../pages/Home'

export type AuthState = { from?: string; back?: string } | null

/** M01–M03: biểu mẫu xác thực hiển thị dạng cửa sổ nổi trên nền Trang chủ (theo Figma tuần 8) */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const state = useLocation().state as AuthState
  const close = () => navigate(state?.back || '/', { replace: true })

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  })

  return (
    <>
      <div className="auth-backdrop-page" inert aria-hidden="true">
        <MainLayout>
          <Home />
        </MainLayout>
      </div>
      <div className="auth-overlay" onMouseDown={(event) => event.target === event.currentTarget && close()}>
        <section className="auth-sheet" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <span className="sheet-handle" aria-hidden="true" />
          <div className="auth-sheet-head">
            <span className="brand-mark" aria-hidden="true">
              中
            </span>
            <button className="icon-button plain" aria-label="Đóng" onClick={close}>
              <X size={22} />
            </button>
          </div>
          {children}
        </section>
      </div>
    </>
  )
}
