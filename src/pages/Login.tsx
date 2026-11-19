import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PasswordInput } from '../components/common'
import type { AuthState } from '../layouts/AuthLayout'
import { validEmail } from '../utils/format'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const state = useLocation().state as AuthState
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const emailError = touched && !validEmail(email) ? 'Email không đúng định dạng' : ''
  const passwordError = touched && !password ? 'Vui lòng nhập mật khẩu' : ''

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    setError('')
    if (!validEmail(email) || !password) return
    setBusy(true)
    try {
      await login(email, password, remember)
      navigate(state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error && err.message.startsWith('Email') ? err.message : 'Không thể kết nối máy chủ dữ liệu.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <h1 id="auth-title">Đăng nhập</h1>
      <p className="muted">Chào mừng bạn quay lại Tri Hành Viện</p>
      {error && (
        <div className="alert alert-error" role="alert">
          <CircleAlert size={18} /> {error}
        </div>
      )}
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          autoComplete="email"
          placeholder="nhap@email.com"
          aria-invalid={!!emailError || !!error}
          onChange={(event) => setEmail(event.target.value)}
        />
        {emailError && <small className="field-error">{emailError}</small>}
      </label>
      <div className="field">
        <label htmlFor="login-password">Mật khẩu</label>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={setPassword}
          invalid={!!passwordError}
          autoComplete="current-password"
        />
        {passwordError && <small className="field-error">{passwordError}</small>}
      </div>
      <div className="form-row">
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          Ghi nhớ đăng nhập
        </label>
        <Link to="/forgot-password" replace state={state} className="strong-link">
          Quên mật khẩu?
        </Link>
      </div>
      <button className="primary-link block auth-submit" disabled={busy}>
        {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
      <p className="auth-switch">
        Chưa có tài khoản?{' '}
        <Link to="/register" replace state={state}>
          Đăng ký
        </Link>
      </p>
    </form>
  )
}
