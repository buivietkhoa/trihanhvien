import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ChevronRight, CircleAlert, CircleCheck, Clock } from 'lucide-react'
import { createTicket } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { validEmail } from '../utils/format'

const TOPICS = ['Tài khoản', 'Đặt lịch', 'Thanh toán', 'Buổi học', 'Khác']
const contacts = [
  { icon: <Bell size={18} />, label: 'Email hỗ trợ', value: 'hotro@mandarinconnect.vn' },
  { icon: <Clock size={18} />, label: 'Giờ làm việc', value: '8:00 – 21:00, Thứ Hai – Chủ nhật' },
  { icon: <CircleCheck size={18} />, label: 'Thời gian phản hồi', value: 'Trong vòng 24 giờ' },
]

export default function Contact() {
  const { user } = useAuth()
  const [topic, setTopic] = useState(TOPICS[2])
  const [email, setEmail] = useState(user?.email ?? '')
  const [content, setContent] = useState('')
  const [touched, setTouched] = useState(false)
  const [sent, setSent] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // Thông tin đăng nhập tải bất đồng bộ: điền email khi có, không ghi đè nếu người dùng đã gõ
  useEffect(() => {
    if (user) setEmail((current) => current || user.email)
  }, [user])
  const errors = {
    email: !validEmail(email) ? 'Email chưa đúng định dạng' : '',
    content: content.trim().length < 20 ? 'Tối thiểu 20 ký tự' : '',
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    setError('')
    if (errors.email || errors.content) return
    setBusy(true)
    try {
      const ticket = await createTicket({ topic, email: email.trim(), content: content.trim(), userId: user?.id })
      setSent(ticket.code)
      setContent('')
      setTouched(false)
    } catch {
      setError('Không thể gửi yêu cầu, vui lòng thử lại.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="shell page-pad">
      <header className="page-title">
        <h1>Liên hệ hỗ trợ</h1>
        <p>Gửi câu hỏi hoặc vấn đề bạn gặp, đội ngũ MandarinConnect sẽ phản hồi qua email</p>
      </header>
      <div className="profile-layout">
        <form className="card section-card" onSubmit={submit} noValidate>
          <h2>Gửi yêu cầu hỗ trợ</h2>
          {sent && (
            <div className="alert alert-success" role="status">
              <CircleCheck size={18} /> Đã gửi yêu cầu #{sent}. Chúng tôi sẽ phản hồi qua {email} trong vòng 24 giờ.
            </div>
          )}
          <div className="form-grid">
            <label className="field">
              <span>Chủ đề</span>
              <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                {TOPICS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Email liên hệ</span>
              <input type="email" value={email} aria-invalid={touched && !!errors.email} onChange={(event) => setEmail(event.target.value)} />
              {touched && errors.email && <small className="field-error">{errors.email}</small>}
            </label>
            <label className="field wide">
              <span>Nội dung</span>
              <textarea
                rows={5}
                maxLength={1000}
                value={content}
                placeholder="Mô tả vấn đề, kèm mã đặt lịch hoặc mã nạp coin nếu có"
                aria-invalid={touched && !!errors.content}
                onChange={(event) => setContent(event.target.value)}
              />
              <span className="field-meta">
                <small className={touched && errors.content ? 'field-error' : ''}>Tối thiểu 20 ký tự</small>
                <small>{content.length}/1000</small>
              </span>
            </label>
          </div>
          {error && <p className="alert alert-error"><CircleAlert size={18} /> {error}</p>}
          <button className="primary-link" disabled={busy}>
            <ChevronRight size={18} /> {busy ? 'Đang gửi…' : 'Gửi yêu cầu'}
          </button>
        </form>
        <aside>
          <section className="card section-card">
            <h2>Thông tin liên hệ</h2>
            <ul className="contact-list">
              {contacts.map((item) => (
                <li key={item.label}>
                  <span className="stat-icon">{item.icon}</span>
                  <span>
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card section-card soft">
            <h3>Cần câu trả lời nhanh?</h3>
            <p className="muted">Phần lớn câu hỏi về ví coin, đặt lịch và huỷ buổi học đã có trong mục Câu hỏi thường gặp.</p>
            <Link to="/faq" className="text-link">
              Xem câu hỏi thường gặp <ChevronRight size={16} />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
