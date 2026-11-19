import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Coins, Menu, Search, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatPrice, initials, shortName } from '../utils/format'

const navItems = [
  { to: '/', label: 'Trang chủ' },
  { to: '/teachers', label: 'Giáo viên' },
  { to: '/courses', label: 'Khoá học' },
]
const accountItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/wallet', label: 'Ví coin' },
  { to: '/history', label: 'Lịch sử buổi học' },
  { to: '/settings', label: 'Cài đặt tài khoản' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
    setMenu(false)
  }, [pathname])
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  // Đăng xuất qua route /logout để rời trang được bảo vệ trước khi xoá phiên
  const signOut = () => navigate('/logout')

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            中
          </span>
          <span>Tri Hành Viện</span>
        </Link>
        <nav aria-label="Điều hướng chính" className={open ? 'main-nav is-open' : 'main-nav'}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive || (item.to === '/teachers' && pathname.startsWith('/booking')) ? 'active' : ''
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mobile-account">
            {user ? (
              <>
                {accountItems.map((item) => (
                  <NavLink key={item.to} to={item.to}>
                    {item.label}
                  </NavLink>
                ))}
                <button onClick={signOut}>Đăng xuất</button>
              </>
            ) : (
              <>
                <Link to="/login" state={{ back: pathname }}>Đăng nhập</Link>
                <Link to="/register" state={{ back: pathname }}>Đăng ký</Link>
              </>
            )}
          </div>
        </nav>
        <form
          className="header-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            const q = (new FormData(event.currentTarget).get('q') as string).trim()
            navigate(q ? `/teachers?${new URLSearchParams({ q })}` : '/teachers')
          }}
        >
          <Search size={17} />
          <input name="q" aria-label="Tìm giáo viên, khoá học" placeholder="Tìm giáo viên, khoá học…" />
        </form>
        {user ? (
          <div className="header-account">
            <Link to="/wallet" className="coin-pill" aria-label={`Số dư ${user.coinBalance} coin`}>
              <Coins size={15} />
              <span>
                {formatPrice(user.coinBalance)}
                <span className="desktop-copy"> coin</span>
              </span>
            </Link>
            <Link to="/dashboard" className="bell" aria-label="Thông báo">
              <Bell size={20} />
              <i />
            </Link>
            <div className="account-menu" ref={menuRef}>
              <button aria-expanded={menu} aria-haspopup="menu" onClick={() => setMenu(!menu)}>
                <span className="initials">{initials(user.name)}</span>
                <span className="account-name">{shortName(user.name)}</span>
                <ChevronDown size={16} />
              </button>
              {menu && (
                <div className="account-dropdown" role="menu">
                  {accountItems.map((item) => (
                    <Link key={item.to} to={item.to} role="menuitem">
                      {item.label}
                    </Link>
                  ))}
                  <button role="menuitem" onClick={signOut}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="header-auth">
            <Link to="/login" state={{ back: pathname }} className="outline-button small">
              Đăng nhập
            </Link>
            <Link to="/register" state={{ back: pathname }} className="primary-link small">
              Đăng ký
            </Link>
          </div>
        )}
        <button
          className="icon-button mobile-menu"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
