import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

export type AuthState = { from?: string; back?: string } | null

/** M01–M03: biểu mẫu xác thực hiển thị dạng cửa sổ nổi trên nền trang trí chữ Hán */
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
      <div className="auth-scene" aria-hidden="true">
        <span className="auth-orb orb-1" />
        <span className="auth-orb orb-2" />
        <span className="auth-orb orb-3" />
        <span className="auth-han han-1" lang="zh">学</span>
        <span className="auth-han han-2" lang="zh">行</span>
        <span className="auth-han han-3" lang="zh">知</span>
        <span className="auth-han han-4" lang="zh">好</span>
        <div className="auth-scene-brand">
          <span className="brand-mark">中</span>
          <span>
            <strong>Tri Hành Viện</strong>
            <small>Học tiếng Trung 1:1 · Biết đi đôi với làm</small>
          </span>
        </div>
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
