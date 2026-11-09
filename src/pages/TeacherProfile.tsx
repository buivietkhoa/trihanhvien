import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, CircleCheck, Clock, Coins, Heart, Video } from 'lucide-react'
import type { Booking, Review } from '../types'
import type { TeacherProfile as Teacher } from '../types/teacher'
import { getReviews, getTeacher, getTeacherBookings } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Avatar, ErrorBlock, Loading, Stars } from '../components/common'
import { formatPrice, modeLabels } from '../utils/format'
import { SHIFTS, slotAt, slotState, weekDays } from '../utils/schedule'
import { addDays, dayMonth, fullDate, now, shortDay, startOfWeek } from '../utils/time'

const SESSION_PLACE = {
  online: 'Học online 1:1 qua Google Meet',
  offline: 'Học offline 1:1 tại trung tâm',
  hybrid: 'Học online qua Google Meet hoặc tại trung tâm',
}
const sections = [
  ['intro', 'Giới thiệu'],
  ['certificates', 'Chứng chỉ'],
  ['experience', 'Kinh nghiệm'],
  ['reviews', 'Đánh giá'],
]

export default function TeacherProfile() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user, update } = useAuth()
  const toast = useToast()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [shown, setShown] = useState(3)
  const [week, setWeek] = useState(() => startOfWeek(now()))
  const [tab, setTab] = useState('intro')

  useEffect(() => {
    const controller = new AbortController()
    setError(false)
    Promise.all([getTeacher(id, controller.signal), getReviews(id, controller.signal), getTeacherBookings(id, controller.signal)])
      .then(([data, list, taken]) => {
        setTeacher(data)
        setReviews(list)
        setBookings(taken)
      })
      .catch(() => !controller.signal.aborted && setError(true))
    return () => controller.abort()
  }, [id, retry])

  if (error) return <div className="shell page-pad"><ErrorBlock onRetry={() => setRetry(retry + 1)} /></div>
  if (!teacher) return <div className="shell page-pad"><Loading /></div>

  const favorite = !!user?.favorites.includes(teacher.id)
  const days = weekDays(week)
  const max = Math.max(...teacher.ratingBreakdown, 1)
  const bookPath = `/booking/${teacher.id}`

  async function toggleFavorite() {
    if (!user) return navigate('/login', { state: { from: `/teachers/${id}` } })
    const favorites = favorite ? user.favorites.filter((item) => item !== id) : [...user.favorites, id]
    await update({ favorites })
    toast(favorite ? 'Đã bỏ khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích')
  }

  return (
    <div className="shell page-pad profile-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Trang chủ</Link> / <Link to="/teachers">Giáo viên</Link> / <span>{teacher.name}</span>
      </nav>
      <section className="card profile-head">
        <div className="profile-photo" aria-hidden="true">
          <Avatar size={96} />
        </div>
        <div className="profile-main">
          <h1>{teacher.name}</h1>
          <div className="teacher-tags">
            <span className="level-tag">HSK {teacher.hsk}</span>
            {teacher.featured && <span className="popular-tag">Nổi bật</span>}
            <span className="mode">{modeLabels[teacher.mode]} 1:1</span>
          </div>
          <div className="reviews">
            <Stars value={teacher.rating} />
            <strong>{teacher.rating.toFixed(1)}</strong>
            <span>({teacher.reviews} đánh giá)</span>
            <span className="dot-sep">{teacher.topics}</span>
          </div>
          <p className="profile-price">
            <strong>{formatPrice(teacher.price)}đ</strong> / giờ
          </p>
        </div>
        <div className="profile-actions">
          <Link to={bookPath} className="primary-link block">
            <CalendarDays size={17} /> Đặt lịch
          </Link>
          <button className={favorite ? 'outline-button block is-on' : 'outline-button block'} onClick={toggleFavorite} aria-pressed={favorite}>
            <Heart size={17} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Đã yêu thích' : 'Yêu thích'}
          </button>
          <small>
            <Coins size={13} /> 1 giờ học = {formatPrice(teacher.price / 1000)} coin
          </small>
        </div>
      </section>

      <div className="profile-layout">
        <div>
          <nav className="tabs" aria-label="Mục hồ sơ">
            {sections.map(([key, label]) => (
              <a
                key={key}
                href={`#${key}`}
                className={tab === key ? 'active' : ''}
                onClick={() => setTab(key)}
              >
                {label}
                {key === 'reviews' && ` (${teacher.reviews})`}
              </a>
            ))}
          </nav>
          <section id="intro" className="card section-card">
            <h2>Giới thiệu</h2>
            {teacher.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
          <section id="certificates" className="card section-card">
            <h2>Chứng chỉ</h2>
            <ul className="cert-list">
              {teacher.certificates.map((item) => (
                <li key={item}>
                  <CircleCheck size={17} /> {item}
                </li>
              ))}
            </ul>
          </section>
          <section id="experience" className="card section-card">
            <h2>Kinh nghiệm</h2>
            <dl className="timeline">
              {teacher.experience.map((item) => (
                <div key={item.title}>
                  <dt>{item.period}</dt>
                  <dd>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <section id="reviews" className="card section-card">
            <h2>Đánh giá của học viên</h2>
            <div className="rating-summary">
              <div className="rating-score">
                <strong>{teacher.rating.toFixed(1)}</strong>
                <Stars value={teacher.rating} />
                <small>{teacher.reviews} đánh giá</small>
              </div>
              <ul className="rating-bars">
                {teacher.ratingBreakdown.map((count, index) => (
                  <li key={index}>
                    <span>{5 - index} ★</span>
                    <i>
                      <b style={{ width: `${(count / max) * 100}%` }} />
                    </i>
                    <span>{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="review-list">
              {reviews.slice(0, shown).map((review) => (
                <li key={review.id}>
                  <Avatar size={32} />
                  <div>
                    <div className="review-meta">
                      <strong>{review.author}</strong>
                      <Stars value={review.rating} size={13} />
                      <time>{fullDate(new Date(review.createdAt))}</time>
                    </div>
                    <p>{review.content}</p>
                  </div>
                </li>
              ))}
            </ul>
            {shown < reviews.length && (
              <button className="outline-button small" onClick={() => setShown(shown + 3)}>
                Xem thêm đánh giá
              </button>
            )}
          </section>
        </div>

        <aside className="profile-aside">
          <section className="card section-card">
            <h2>Lịch trống trong tuần</h2>
            <div className="week-nav">
              <button
                className="icon-button plain"
                aria-label="Tuần trước"
                disabled={week <= startOfWeek(now())}
                onClick={() => setWeek(addDays(week, -7))}
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {dayMonth(days[0])} – {fullDate(days[6])}
              </span>
              <button className="icon-button plain" aria-label="Tuần sau" onClick={() => setWeek(addDays(week, 7))}>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="mini-grid" role="table" aria-label="Lịch trống">
              <div role="row">
                <span />
                {days.map((day) => (
                  <span key={day.toISOString()} role="columnheader">
                    {shortDay(day)}
                    <b>{day.getDate()}</b>
                  </span>
                ))}
              </div>
              {SHIFTS.map(({ id: shiftId, start: time }) => (
                <div role="row" key={time}>
                  <span role="rowheader" title={`Ca ${shiftId}`}>{time}</span>
                  {days.map((day) => (
                    <i key={day.toISOString()} role="cell" className={slotState(teacher.id, slotAt(day, time), bookings)} />
                  ))}
                </div>
              ))}
            </div>
            <div className="slot-legend">
              <span><i className="free" /> Còn trống</span>
              <span><i className="booked" /> Đã đặt</span>
            </div>
            <Link to={bookPath} className="primary-link block">
              <ChevronRight size={16} /> Xem đầy đủ và đặt lịch
            </Link>
          </section>
          <section className="card section-card">
            <h2>Thông tin buổi học</h2>
            <ul className="info-list">
              <li><Video size={16} /> {SESSION_PLACE[teacher.mode]}</li>
              <li><Clock size={16} /> Mỗi ca học 90 phút, 6 ca mỗi ngày</li>
              <li><Coins size={16} /> Thanh toán bằng coin trong ví</li>
              <li><CircleCheck size={16} /> Huỷ miễn phí trước giờ học</li>
            </ul>
          </section>
        </aside>
      </div>
      <div className="mobile-book-bar">
        <div>
          <strong>{formatPrice(teacher.price)}đ / giờ</strong>
          <small>= {formatPrice(teacher.price / 1000)} coin</small>
        </div>
        <Link to={bookPath} className="primary-link">
          Đặt lịch
        </Link>
      </div>
    </div>
  )
}
