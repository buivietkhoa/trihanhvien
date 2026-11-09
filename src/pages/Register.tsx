import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PasswordInput, StrengthMeter } from '../components/common'
import type { AuthState } from '../layouts/AuthLayout'
import { validEmail, validPassword } from '../utils/format'

type Field = 'name' | 'email' | 'password' | 'confirm'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const state = useLocation().state as AuthState
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', agree: false })
  // Lỗi của từng ô hiện sau khi người dùng rời ô đó (hoặc bấm gửi)
  const [touched, setTouched] = useState<Record<Field, boolean>>({ name: false, email: false, password: false, confirm: false })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (key: keyof typeof form, value: string | boolean) => setForm((previous) => ({ ...previous, [key]: value }))
  const touch = (key: Field) => setTouched((previous) => ({ ...previous, [key]: true }))
  const errors: Record<Field, string> = {
    name: form.name.trim().length < 2 ? 'Vui lòng nhập họ và tên' : '',
    email: !validEmail(form.email) ? 'Email không đúng định dạng' : '',
    password: !validPassword(form.password) ? 'Tối thiểu 8 ký tự, gồm cả chữ và số' : '',
    confirm: !form.confirm || form.confirm !== form.password ? 'Mật khẩu xác nhận không khớp' : '',
  }
  const shown = (key: Field) => (touched[key] ? errors[key] : '')
  const hasShownError = (Object.keys(errors) as Field[]).some(shown)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched({ name: true, email: true, password: true, confirm: true })
    setError('')
    if (!form.agree || Object.values(errors).some(Boolean)) return
    setBusy(true)
    try {
      await register(form.name, form.email, form.password)
      navigate(state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error && err.message.startsWith('Email') ? err.message : 'Không thể kết nối máy chủ dữ liệu.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <h1 id="auth-title">Tạo tài khoản</h1>
      <p className="muted">Miễn phí, chỉ mất chưa đến 1 phút</p>
      {error && (
        <div className="alert alert-error" role="alert">
          <CircleAlert size={18} /> {error}
        </div>
      )}
      <label className="field">
        <span>Họ và tên</span>
        <input
          value={form.name}
          autoComplete="name"
          aria-invalid={!!shown('name')}
          onBlur={() => touch('name')}
          onChange={(event) => set('name', event.target.value)}
        />
        {shown('name') && <small className="field-error">{shown('name')}</small>}
      </label>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={form.email}
          autoComplete="email"
          aria-invalid={!!shown('email')}
          onBlur={() => touch('email')}
          onChange={(event) => set('email', event.target.value)}
        />
        {shown('email') && <small className="field-error">{shown('email')}</small>}
      </label>
      {/* Ô mật khẩu chỉ báo lỗi khi gửi; lúc gõ dùng thanh độ mạnh như Figma */}
      <div className="field">
        <label htmlFor="register-password">Mật khẩu</label>
        <PasswordInput
          id="register-password"
          value={form.password}
          onChange={(value) => set('password', value)}
          invalid={!!shown('password')}
          autoComplete="new-password"
        />
        <StrengthMeter value={form.password} showLabel={false} />
        {shown('password') && <small className="field-error">{shown('password')}</small>}
      </div>
      <div className="field" onBlur={() => touch('confirm')}>
        <label htmlFor="register-confirm">Xác nhận mật khẩu</label>
        <PasswordInput
          id="register-confirm"
          value={form.confirm}
          onChange={(value) => set('confirm', value)}
          invalid={!!shown('confirm')}
          autoComplete="new-password"
        />
        {shown('confirm') && <small className="field-error">{shown('confirm')}</small>}
      </div>
      <label className="check">
        <input type="checkbox" checked={form.agree} onChange={(event) => set('agree', event.target.checked)} />
        <span>Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật</span>
      </label>
      <button className="primary-link block auth-submit" disabled={busy || !form.agree || hasShownError}>
        {busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
      </button>
      <p className="auth-switch">
        Đã có tài khoản?{' '}
        <Link to="/login" replace state={state}>
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
