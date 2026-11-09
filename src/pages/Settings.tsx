import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CircleAlert, CircleCheck, Eye, Info, LogOut, Star, User as UserIcon } from 'lucide-react'
import type { User } from '../types'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Avatar, Modal, PasswordInput, StrengthMeter } from '../components/common'
import { validPassword } from '../utils/format'
import { fullDate, now, toIso } from '../utils/time'

const TABS = [
  ['profile', 'Thông tin cá nhân', UserIcon],
  ['learning', 'Tuỳ chọn học tập', Star],
  ['security', 'Bảo mật', Eye],
] as const
const LEVELS = ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6']
const GOALS = ['HSK 3 trong 3 tháng', 'HSK 4 trong 6 tháng', 'HSK 5 trong 12 tháng', 'Giao tiếp công việc', 'Giao tiếp du lịch']
const TIMES = ['Sáng 7–11h', 'Trưa 11–14h', 'Chiều 14–18h', 'Tối 18–22h', 'Cuối tuần']
const MAX_AVATAR = 2 * 1024 * 1024

type Editable = Pick<User, 'name' | 'phone' | 'avatar' | 'level' | 'goal' | 'preferredTimes'>
const pick = (user: User): Editable => ({
  name: user.name,
  phone: user.phone,
  avatar: user.avatar,
  level: user.level,
  goal: user.goal,
  preferredTimes: user.preferredTimes,
})

export default function Settings() {
  const { user, update } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('profile')
  const [form, setForm] = useState<Editable | null>(user && pick(user))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [changing, setChanging] = useState(false)
  if (!user || !form) return null

  const dirty = JSON.stringify(form) !== JSON.stringify(pick(user))
  const set = <K extends keyof Editable>(key: K, value: Editable[K]) => setForm({ ...form, [key]: value })
  const nameError = form.name.trim().length < 2 ? 'Vui lòng nhập họ và tên' : ''
  const phoneError = form.phone && !/^0\d[\d ]{7,11}$/.test(form.phone.trim()) ? 'Số điện thoại chưa đúng định dạng' : ''

  function pickAvatar(file?: File) {
    setError('')
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) return setError('Chỉ hỗ trợ ảnh JPG hoặc PNG.')
    if (file.size > MAX_AVATAR) return setError('Ảnh vượt quá 2 MB.')
    const reader = new FileReader()
    reader.onload = () => set('avatar', String(reader.result))
    reader.readAsDataURL(file)
  }
  async function save() {
    if (!form || nameError || phoneError) return
    setBusy(true)
    try {
      await update({ ...form, name: form.name.trim(), phone: form.phone.trim() })
      toast('Đã lưu thay đổi')
    } catch {
      setError('Không thể lưu thay đổi, vui lòng thử lại.')
    } finally {
      setBusy(false)
    }
  }
  // Đăng xuất qua route /logout để rời trang được bảo vệ trước khi xoá phiên
  const signOut = () => navigate('/logout')

  const footer = (
    <div className="settings-foot">
      <span className="note">{dirty && <><Info size={14} /> Bạn có thay đổi chưa lưu</>}</span>
      <button className="link-button" disabled={!dirty} onClick={() => setForm(pick(user))}>Huỷ</button>
      <button className="primary-link" disabled={!dirty || busy || !!nameError || !!phoneError} onClick={save}>
        <Check size={18} /> Lưu thay đổi
      </button>
    </div>
  )

  return (
    <div className="shell page-pad">
      <header className="page-title">
        <h1>Cài đặt tài khoản</h1>
      </header>
      <div className="settings-layout">
        <nav className="card settings-nav" aria-label="Mục cài đặt">
          {TABS.map(([key, label, Icon]) => (
            <button key={key} className={tab === key ? 'is-active' : ''} aria-current={tab === key} onClick={() => setTab(key)}>
              <Icon size={17} /> {label}
            </button>
          ))}
          <button className="danger-link" onClick={signOut}>
            <LogOut size={17} /> Đăng xuất
          </button>
        </nav>
        <section className="card section-card">
          {tab === 'profile' && (
            <>
              <h2>Thông tin cá nhân</h2>
              <div className="avatar-row">
                <Avatar src={form.avatar} size={76} />
                <div>
                  <label className="outline-button small">
                    Đổi ảnh
                    <input type="file" accept="image/png,image/jpeg" hidden onChange={(event) => pickAvatar(event.target.files?.[0])} />
                  </label>
                  <small className="field-hint">JPG hoặc PNG, tối đa 2 MB · xem trước trước khi lưu</small>
                </div>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Họ và tên</span>
                  <input value={form.name} aria-invalid={!!nameError} onChange={(event) => set('name', event.target.value)} />
                  {nameError && <small className="field-error">{nameError}</small>}
                </label>
                <label className="field">
                  <span>Số điện thoại</span>
                  <input value={form.phone} inputMode="tel" aria-invalid={!!phoneError} onChange={(event) => set('phone', event.target.value)} />
                  {phoneError && <small className="field-error">{phoneError}</small>}
                </label>
                <label className="field wide">
                  <span>Email (không thể thay đổi)</span>
                  <input value={user.email} disabled />
                </label>
              </div>
              {error && <p className="alert alert-error"><CircleAlert size={18} /> {error}</p>}
              {footer}
            </>
          )}
          {tab === 'learning' && (
            <>
              <h2>Tuỳ chọn học tập</h2>
              <div className="form-grid">
                <label className="field">
                  <span>Trình độ hiện tại</span>
                  <select value={form.level} onChange={(event) => set('level', event.target.value)}>
                    {LEVELS.map((level) => <option key={level}>{level}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Mục tiêu</span>
                  <select value={form.goal} onChange={(event) => set('goal', event.target.value)}>
                    {GOALS.map((goal) => <option key={goal}>{goal}</option>)}
                  </select>
                </label>
              </div>
              <fieldset className="field">
                <legend>Khung giờ học ưu tiên</legend>
                <div className="chips">
                  {TIMES.map((time) => {
                    const on = form.preferredTimes.includes(time)
                    return (
                      <button
                        key={time}
                        className={on ? 'chip is-picked' : 'chip'}
                        aria-pressed={on}
                        onClick={() => set('preferredTimes', on ? form.preferredTimes.filter((item) => item !== time) : [...form.preferredTimes, time])}
                      >
                        {on && <Check size={14} />} {time}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
              {footer}
            </>
          )}
          {tab === 'security' && (
            <>
              <h2>Bảo mật</h2>
              <div className="security-row">
                <div>
                  <strong>Mật khẩu</strong>
                  <small>Lần đổi gần nhất: {fullDate(new Date(user.passwordChangedAt))}</small>
                </div>
                <button className="outline-button small" onClick={() => setChanging(true)}>Đổi mật khẩu</button>
              </div>
              <div className="security-row">
                <div>
                  <strong>Phiên đăng nhập</strong>
                  <small>Thiết bị này · {navigator.userAgent.includes('Edg') ? 'Edge' : 'Chrome'} trên {navigator.userAgent.includes('Windows') ? 'Windows' : 'thiết bị này'}</small>
                </div>
                <button className="outline-button small" onClick={signOut}>Đăng xuất</button>
              </div>
            </>
          )}
        </section>
      </div>
      {changing && <ChangePassword user={user} onClose={() => setChanging(false)} onDone={() => { setChanging(false); toast('Đã cập nhật mật khẩu') }} />}
    </div>
  )
}

function ChangePassword({ user, onClose, onDone }: { user: User; onClose: () => void; onDone: () => void }) {
  const { update } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const errors = {
    current: !current ? 'Vui lòng nhập mật khẩu hiện tại' : '',
    next: !validPassword(next) ? 'Tối thiểu 8 ký tự, gồm cả chữ và số' : next === current ? 'Mật khẩu mới phải khác mật khẩu hiện tại' : '',
    confirm: confirm !== next || !confirm ? 'Mật khẩu xác nhận không khớp' : '',
  }
  async function submit() {
    setTouched(true)
    setError('')
    if (Object.values(errors).some(Boolean)) return
    if (current !== user.password) return setError('Mật khẩu hiện tại không đúng.')
    await update({ password: next, passwordChangedAt: toIso(now()).slice(0, 10) })
    onDone()
  }
  return (
    <Modal title="Đổi mật khẩu" onClose={onClose}>
      <div className="field">
        <label htmlFor="pw-current">Mật khẩu hiện tại</label>
        <PasswordInput id="pw-current" value={current} onChange={setCurrent} invalid={touched && !!errors.current} autoComplete="current-password" />
        {touched && errors.current && <small className="field-error">{errors.current}</small>}
      </div>
      <div className="field">
        <label htmlFor="pw-next">Mật khẩu mới</label>
        <PasswordInput id="pw-next" value={next} onChange={setNext} invalid={touched && !!errors.next} autoComplete="new-password" />
        <StrengthMeter value={next} />
        {touched && errors.next && <small className="field-error">{errors.next}</small>}
      </div>
      <div className="field">
        <label htmlFor="pw-confirm">Xác nhận mật khẩu mới</label>
        <PasswordInput id="pw-confirm" value={confirm} onChange={setConfirm} invalid={touched && !!errors.confirm} autoComplete="new-password" />
        {confirm && !errors.confirm ? (
          <small className="field-ok"><CircleCheck size={14} /> Mật khẩu xác nhận khớp</small>
        ) : (
          touched && errors.confirm && <small className="field-error">{errors.confirm}</small>
        )}
      </div>
      {error && <p className="alert alert-error"><CircleAlert size={18} /> {error}</p>}
      <div className="modal-actions">
        <button className="link-button" onClick={onClose}>Huỷ</button>
        <button className="primary-link" onClick={submit}><Check size={18} /> Cập nhật mật khẩu</button>
      </div>
    </Modal>
  )
}
