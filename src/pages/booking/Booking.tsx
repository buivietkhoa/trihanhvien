import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Wallet } from 'lucide-react'
import type { Booking as BookingType } from '../../types'
import type { TeacherProfile } from '../../types/teacher'
import { getTeacher, getTeacherBookings } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Avatar, ErrorBlock, Loading, Stars, Stepper } from '../../components/common'
import SlotGrid from '../../components/SlotGrid'
import { coinFor, formatCoin, formatPrice } from '../../utils/format'
import { SHIFTS, SHIFT_MINUTES, isFree, weekDays } from '../../utils/schedule'
import { addDays, clock, fullDate, longDate, now, startOfWeek, timeRange, toIso } from '../../utils/time'
import { readDraft, saveDraft } from './draft'

export default function Booking() {
  const { teacherId = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [bookings, setBookings] = useState<BookingType[]>([])
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const draft = readDraft()
  const restored = draft?.teacherId === teacherId ? draft : null
  const [selected, setSelected] = useState<Date | null>(restored ? new Date(restored.start) : null)
  const [week, setWeek] = useState(() => startOfWeek(restored ? new Date(restored.start) : now()))

  useEffect(() => {
    const controller = new AbortController()
    setError(false)
    Promise.all([getTeacher(teacherId, controller.signal), getTeacherBookings(teacherId, controller.signal)])
      .then(([data, taken]) => {
        setTeacher(data)
        setBookings(taken)
      })
      .catch(() => !controller.signal.aborted && setError(true))
    return () => controller.abort()
  }, [teacherId, retry])

  if (error) return <div className="shell page-pad"><ErrorBlock onRetry={() => setRetry(retry + 1)} /></div>
  if (!teacher || !user) return <div className="shell page-pad"><Loading /></div>

  // Mỗi buổi là một ca cố định 90 phút
  const duration = SHIFT_MINUTES
  const coin = coinFor(teacher.price, duration)
  const days = weekDays(week)
  const shift = selected && SHIFTS.find((item) => item.start === clock(selected))

  function choose(start: Date) {
    if (teacher && isFree(teacher.id, start, bookings)) setSelected(start)
  }
  function next() {
    if (!selected) return
    saveDraft({ teacherId, start: toIso(selected), duration })
    navigate('/booking/confirm')
  }

  return (
    <div className="shell page-pad booking-page">
      <Stepper step={1} />
      <div className="booking-layout">
        <aside className="booking-side">
          <section className="card section-card">
            <div className="mini-teacher">
              <Avatar size={56} />
              <div>
                <h2>{teacher.name}</h2>
                <div className="reviews">
                  <span className="level-tag">HSK {teacher.hsk}</span>
                  <Stars value={teacher.rating} />
                  <strong>{teacher.rating.toFixed(1)}</strong> ({teacher.reviews})
                </div>
              </div>
            </div>
            <p className="profile-price">
              <strong>{formatPrice(teacher.price)}đ</strong> / giờ
            </p>
            <Link to={`/teachers/${teacher.id}`} className="text-link">
              <ChevronLeft size={16} /> Quay lại hồ sơ giáo viên
            </Link>
          </section>
          <section className="card section-card">
            <h2>Ca học</h2>
            <ul className="shift-list">
              {SHIFTS.map((item) => (
                <li key={item.id} className={shift?.id === item.id ? 'is-active' : ''}>
                  <strong>Ca {item.id}</strong>
                  <span>
                    {item.start} – {item.end}
                  </span>
                  <small>{item.period}</small>
                </li>
              ))}
            </ul>
            <div className="fee-box">
              <small>
                <Clock size={13} /> Học phí 1 ca ({duration} phút)
              </small>
              <p>
                <strong>{formatPrice(coin * 1000)}đ</strong> ≈ {formatCoin(coin)}
              </p>
            </div>
            <p className="muted icon-line">
              <Wallet size={16} /> Số dư ví: {formatCoin(user.coinBalance)}
            </p>
          </section>
        </aside>
        <section className="card section-card booking-calendar">
          <div className="calendar-head">
            <div>
              <h2>
                Tháng {days[0].getMonth() + 1}/{days[0].getFullYear()}
              </h2>
              <p className="muted">
                Tuần {fullDate(days[0]).slice(0, 5)} – {fullDate(days[6]).slice(0, 5)} · Giờ Việt Nam (GMT+7)
              </p>
            </div>
            <div className="calendar-nav">
              <button className="outline-button small" disabled={week <= startOfWeek(now())} onClick={() => setWeek(addDays(week, -7))}>
                <ChevronLeft size={16} /> Tuần trước
              </button>
              <button className="outline-button small" onClick={() => setWeek(addDays(week, 7))}>
                Tuần sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <SlotGrid teacherId={teacher.id} days={days} bookings={bookings} selected={selected} onSelect={choose} />
        </section>
      </div>
      <div className="card selection-bar">
        <CalendarDays size={22} />
        <div>
          <small>Đã chọn</small>
          <strong>
            {selected
              ? `Ca ${shift?.id ?? ''} · ${longDate(selected)} · ${timeRange(toIso(selected), duration)} · ${formatCoin(coin)}`
              : 'Chưa chọn ca học'}
          </strong>
        </div>
        {selected && (
          <button className="link-button" onClick={() => setSelected(null)}>
            Huỷ chọn
          </button>
        )}
        <button className="primary-link" disabled={!selected} onClick={next}>
          <ChevronRight size={18} /> Tiếp tục
        </button>
      </div>
    </div>
  )
}
