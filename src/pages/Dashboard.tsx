import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CalendarDays, ChevronRight, CircleCheck, Clock, Coins, Search, Star, Video, Wallet, X } from 'lucide-react'
import type { Booking } from '../types'
import { useAuth } from '../context/AuthContext'
import { useLessons } from '../hooks/useLessons'
import { Avatar, EmptyBlock, ErrorBlock, Loading, Stars } from '../components/common'
import { CancelModal, RescheduleModal, ReviewModal } from '../components/modals'
import { bookingStatus, formatCoin, shortName } from '../utils/format'
import { addMinutes, clock, fullDate, longDate, now, sameDay, shortDay, timeRange } from '../utils/time'

type Dialog = { kind: 'cancel' | 'reschedule' | 'review'; booking: Booking } | null

export default function Dashboard() {
  const { user } = useAuth()
  const { bookings, teachers, reviews, loading, error, reload } = useLessons(user?.id)
  const [dialog, setDialog] = useState<Dialog>(null)
  if (!user) return null

  const today = now()
  const upcoming = bookings
    .filter((booking) => bookingStatus(booking) === 'upcoming')
    .sort((a, b) => a.start.localeCompare(b.start))
  const completed = bookings.filter((booking) => bookingStatus(booking) === 'completed')
  const next = upcoming[0]
  const nextStart = next && new Date(next.start)
  const when = (date: Date) => (sameDay(date, today) ? `${clock(date)} hôm nay` : `${clock(date)} ${shortDay(date)}, ${fullDate(date).slice(0, 5)}`)
  const hours = completed.reduce((sum, booking) => sum + booking.duration, 0) / 60
  const target = user.goal.split(' trong')[0]
  const progress = Math.round((user.progress.done / user.progress.total) * 100)
  const close = () => setDialog(null)
  const done = () => {
    setDialog(null)
    reload()
  }

  const stats = [
    { icon: <Coins size={18} />, label: 'Số dư coin', value: formatCoin(user.coinBalance), extra: <Link to="/wallet" className="text-link small">Đến Ví coin →</Link> },
    { icon: <CalendarDays size={18} />, label: 'Buổi học sắp tới', value: `${upcoming.length} buổi`, extra: <small>{next ? `Gần nhất: ${when(nextStart!)}` : 'Chưa có lịch'}</small> },
    { icon: <CircleCheck size={18} />, label: 'Buổi đã học', value: `${completed.length} buổi`, extra: <small>Tổng {hours.toLocaleString('vi-VN')} giờ học</small> },
  ]

  return (
    <div className="shell page-pad">
      <header className="page-title">
        <h1>Xin chào, {shortName(user.name)}</h1>
        <p>
          {longDate(today)} · Mục tiêu: {target}
        </p>
      </header>
      {next && sameDay(nextStart!, today) && (
        <div className="notice-bar">
          <Bell size={18} />
          <span>
            Buổi học với {teachers[next.teacherId]?.name ?? 'giáo viên'} bắt đầu lúc {clock(nextStart!)} hôm nay
          </span>
          <a href="#upcoming">Xem chi tiết</a>
        </div>
      )}
      <div className="stat-grid">
        {stats.map((stat) => (
          <section key={stat.label} className="card stat-card">
            <small><span className="stat-icon">{stat.icon}</span> {stat.label}</small>
            <strong>{stat.value}</strong>
            {stat.extra}
          </section>
        ))}
        <section className="card stat-card">
          <small><span className="stat-icon"><Star size={18} /></span> Tiến độ {target}</small>
          <strong>{progress}%</strong>
          <span className="progress" aria-label={`Tiến độ ${progress}%`}>
            <i style={{ width: `${progress}%` }} />
          </span>
          <small>{user.progress.done}/{user.progress.total} chủ điểm đã học</small>
        </section>
      </div>

      {error ? (
        <ErrorBlock onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : (
        <div className="dashboard-layout">
          <div>
            <div className="section-heading small" id="upcoming">
              <h2>Buổi học sắp tới</h2>
              <Link className="text-link" to="/history">Xem lịch học</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="card">
                <EmptyBlock icon={<CalendarDays size={30} />} title="Bạn chưa có buổi học nào sắp tới" message="Chọn một giáo viên phù hợp và đặt buổi học đầu tiên của bạn.">
                  <Link to="/teachers" className="primary-link">
                    <Search size={17} /> Tìm giáo viên
                  </Link>
                </EmptyBlock>
              </div>
            ) : (
              upcoming.map((booking) => {
                const teacher = teachers[booking.teacherId]
                const start = new Date(booking.start)
                const opensAt = addMinutes(start, -15)
                const live = today >= opensAt
                return (
                  <article key={booking.id} className="card lesson-card">
                    <div className="lesson-top">
                      <Avatar size={48} />
                      <div>
                        <h3>
                          {teacher?.name} <span className="level-tag">HSK {teacher?.hsk}</span>
                        </h3>
                        <p className="lesson-when">{longDate(start)} · {timeRange(booking.start, booking.duration)}</p>
                        <small>{booking.duration} phút · {formatCoin(booking.coin)} · Mã {booking.code}</small>
                      </div>
                      <span className="status status-upcoming">Sắp tới</span>
                    </div>
                    <div className="lesson-actions">
                      <a
                        className={live ? 'primary-link' : 'primary-link is-disabled'}
                        href={live ? 'https://meet.google.com/' : undefined}
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!live}
                      >
                        <Video size={17} /> Vào phòng học
                      </a>
                      <button className="outline-button" onClick={() => setDialog({ kind: 'reschedule', booking })}>
                        <CalendarDays size={17} /> Đổi lịch
                      </button>
                      <button className="link-button" onClick={() => setDialog({ kind: 'cancel', booking })}>
                        <X size={17} /> Huỷ buổi học
                      </button>
                    </div>
                    <p className="note">
                      <Clock size={14} /> Phòng học Google Meet mở lúc {clock(opensAt)} (trước giờ học 15 phút)
                    </p>
                  </article>
                )
              })
            )}

            <div className="section-heading small">
              <h2>Buổi học gần đây</h2>
              <Link className="text-link" to="/history">Xem lịch sử</Link>
            </div>
            <div className="card recent-list">
              {completed.length === 0 && <p className="muted pad">Chưa có buổi học nào hoàn thành.</p>}
              {completed.slice(0, 3).map((booking) => {
                const review = reviews[booking.id]
                return (
                  <div key={booking.id} className="recent-item">
                    <Avatar size={36} />
                    <div>
                      <strong>{teachers[booking.teacherId]?.name}</strong>
                      <small>
                        {fullDate(new Date(booking.start))} · {timeRange(booking.start, booking.duration)} · {booking.duration} phút · {booking.code}
                      </small>
                    </div>
                    {review ? (
                      <Stars value={review.rating} />
                    ) : (
                      <button className="outline-button small" onClick={() => setDialog({ kind: 'review', booking })}>
                        <Star size={15} /> Đánh giá
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <aside className="card shortcut-card">
            <h2>Lối tắt</h2>
            {[
              { to: '/wallet', icon: <Wallet size={18} />, title: 'Ví coin', note: `Số dư ${formatCoin(user.coinBalance)}` },
              { to: '/history', icon: <Clock size={18} />, title: 'Lịch sử buổi học', note: `${completed.length} buổi đã học` },
              { to: '/teachers', icon: <Search size={18} />, title: 'Danh sách giáo viên', note: 'Tìm và đặt thêm buổi' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="shortcut">
                <span className="stat-icon gray">{item.icon}</span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.note}</small>
                </span>
                <ChevronRight size={16} />
              </Link>
            ))}
          </aside>
        </div>
      )}
      {dialog?.kind === 'cancel' && <CancelModal booking={dialog.booking} teacher={teachers[dialog.booking.teacherId]} onClose={close} onDone={done} />}
      {dialog?.kind === 'reschedule' && <RescheduleModal booking={dialog.booking} teacher={teachers[dialog.booking.teacherId]} onClose={close} onDone={done} />}
      {dialog?.kind === 'review' && <ReviewModal booking={dialog.booking} teacher={teachers[dialog.booking.teacherId]} onClose={close} onDone={done} />}
    </div>
  )
}
