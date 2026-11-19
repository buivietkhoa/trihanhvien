import { Link } from 'react-router-dom'
import { Clock, Mail, MessageCircle } from 'lucide-react'

const columns = [
  {
    title: 'Liên kết nhanh',
    links: [
      ['/teachers', 'Tìm giáo viên'],
      ['/courses', 'Khoá học'],
      ['/wallet', 'Ví coin'],
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      ['/faq', 'Câu hỏi thường gặp'],
      ['/contact', 'Liên hệ hỗ trợ'],
      ['/faq?category=Đặt lịch', 'Chính sách huỷ lịch'],
    ],
  },
]
const socials = [
  ['Facebook', 'Fb'],
  ['YouTube', 'Yt'],
  ['TikTok', 'Tt'],
]

export default function Footer({ compact = false }: { compact?: boolean }) {
  if (compact)
    return (
      <footer className="compact-footer">
        © 2026 Tri Hành Viện · Hỗ trợ: <Link to="/faq">Câu hỏi thường gặp</Link> ·{' '}
        <Link to="/faq?category=Đặt lịch">Chính sách huỷ lịch</Link>
      </footer>
    )
  return (
    <footer className="site-footer">
      <span className="footer-watermark" aria-hidden="true">
        知行
      </span>
      <div className="shell footer-grid">
        <div>
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              中
            </span>
            <span className="brand-text">
              Tri Hành Viện
              <small>Học tiếng Trung 1:1</small>
            </span>
          </Link>
          <p>Nền tảng học tiếng Trung 1:1 với giáo viên bản ngữ và giáo viên Việt Nam.</p>
          <div className="footer-contact">
            <span>
              <Mail size={15} /> hotro@mandarinconnect.vn
            </span>
            <span>
              <Clock size={15} /> 8:00 – 21:00, Thứ Hai – Chủ nhật
            </span>
            <span>
              <MessageCircle size={15} /> Phản hồi trong vòng 24 giờ
            </span>
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map(([to, label]) => (
              <Link key={label} to={to}>
                {label}
              </Link>
            ))}
          </div>
        ))}
        <div>
          <h3>Kết nối</h3>
          <p>Mỗi tuần một mẹo học tiếng Trung, ngắn gọn và dễ nhớ.</p>
          <div className="footer-socials">
            {socials.map(([name, short]) => (
              <a key={name} href="#" aria-label={name} title={name} onClick={(event) => event.preventDefault()}>
                {short}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Tri Hành Viện — Đồ án tốt nghiệp</span>
        <span>
          <span lang="zh">知行合一</span> · Biết đi đôi với làm
        </span>
      </div>
    </footer>
  )
}
