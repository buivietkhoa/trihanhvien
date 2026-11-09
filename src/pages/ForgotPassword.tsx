import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import type { AuthState } from '../layouts/AuthLayout'
import { validEmail } from '../utils/format'

export default function ForgotPassword() {
  const state = useLocation().state as AuthState
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [sent, setSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  useEffect(() => {
    if (!countdown) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])
  const error = touched && !validEmail(email) ? 'Email không đúng định dạng' : ''

  // Mô phỏng: không gửi email thật, chỉ chuyển sang trạng thái "đã gửi".
  function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    if (!validEmail(email)) return
    setSent(true)
    setCountdown(60)
  }

  if (sent)
    return (
      <div className="auth-form">
        <h1 id="auth-title">Đã gửi liên kết</h1>
        <p className="muted">
          Kiểm tra hộp thư {email} để đặt lại mật khẩu (mô phỏng). Liên kết có hiệu lực trong 30 phút.
        </p>
        <div className="alert alert-success" role="status">
          <CircleCheck size={16} /> Email đã được gửi
        </div>
        <Link to="/login" replace state={state} className="primary-link block auth-submit">
          Quay lại Đăng nhập
        </Link>
        <p className="auth-switch">
          Không nhận được email?{' '}
          {countdown ? (
            <span className="accent strong">Gửi lại sau {countdown} giây</span>
          ) : (
            <button type="button" className="link-button" onClick={() => setCountdown(60)}>
              Gửi lại
            </button>
          )}
        </p>
      </div>
    )

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <h1 id="auth-title">Quên mật khẩu</h1>
      <p className="muted">Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu.</p>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          placeholder="nhap@email.com"
          autoComplete="email"
          aria-invalid={!!error}
          onChange={(event) => setEmail(event.target.value)}
        />
        {error && <small className="field-error">{error}</small>}
      </label>
      <button className="primary-link block auth-submit">Gửi liên kết đặt lại</button>
      <p className="auth-switch">
        Nhớ ra mật khẩu?{' '}
        <Link to="/login" replace state={state}>
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
