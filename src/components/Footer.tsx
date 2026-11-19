import { Link } from 'react-router-dom'

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
const socials = ['Facebook', 'YouTube', 'TikTok']

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
      <div className="shell footer-grid">
        <div>
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              中
            </span>
            Tri Hành Viện
          </Link>
          <p>Nền tảng học tiếng Trung 1:1 với giáo viên bản ngữ và giáo viên Việt Nam.</p>
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
          {socials.map((name) => (
            <a key={name} href="#" onClick={(event) => event.preventDefault()}>
              {name}
            </a>
          ))}
        </div>
      </div>
      <div className="shell footer-bottom">© 2026 Tri Hành Viện — Đồ án tốt nghiệp</div>
    </footer>
  )
}
