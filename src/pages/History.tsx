import { useState } from 'react'
import { Calendar, Eye, Search, Star } from 'lucide-react'
import type { Booking } from '../types'
import { useAuth } from '../context/AuthContext'
import { useLessons } from '../hooks/useLessons'
import { Avatar, EmptyBlock, ErrorBlock, Loading, Stars } from '../components/common'
import { ReviewModal } from '../components/modals'
import { bookingStatus, formatCoin, statusLabels } from '../utils/format'
import { addDays, fullDate, now, timeRange } from '../utils/time'

const TABS = [
  ['all', 'Tất cả'],
  ['completed', 'Đã hoàn thành'],
  ['cancelled', 'Đã huỷ'],
] as const
const PERIODS = [
  ['7', '7 ngày qua'],
  ['30', '30 ngày qua'],
  ['90', '3 tháng qua'],
  ['all', 'Toàn bộ'],
] as const

export default function History() {
  const { user } = useAuth()
  const { bookings, teachers, reviews, loading, error, reload } = useLessons(user?.id)
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('all')
  const [period, setPeriod] = useState<string>('30')
  const [reviewing, setReviewing] = useState<Booking | null>(null)

  const past = bookings.filter((booking) => bookingStatus(booking) !== 'upcoming')
  const since = period === 'all' ? null : addDays(now(), -Number(period))
  const rows = past.filter(
    (booking) => (tab === 'all' || bookingStatus(booking) === tab) && (!since || new Date(booking.start) >= since),
  )

  return (
    <div className="shell page-pad">
      <header className="page-title">
        <h1>Lịch sử buổi học</h1>
        <p>Xem lại các buổi đã học, đối chiếu chi phí và đánh giá giáo viên</p>
      </header>
      <div className="card filter-bar">
        <div className="segmented" role="tablist" aria-label="Trạng thái">
          {TABS.map(([key, label]) => (
            <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>
        <label className="select-with-icon">
          <Calendar size={16} />
          <select aria-label="Khoảng thời gian" value={period} onChange={(event) => setPeriod(event.target.value)}>
            {PERIODS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <span className="muted">{rows.length} buổi học</span>
      </div>
      <section className="card table-card">
        {error ? (
          <ErrorBlock onRetry={reload} />
        ) : loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyBlock
            icon={<Search size={30} />}
            title="Không có buổi học phù hợp với bộ lọc"
            message="Thử chọn khoảng thời gian khác hoặc xoá bộ lọc để xem toàn bộ lịch sử."
          >
            <button
              className="outline-button"
              onClick={() => {
                setTab('all')
                setPeriod('all')
              }}
            >
              Xoá bộ lọc
            </button>
          </EmptyBlock>
        ) : (
          <table className="data-table history-table">
            <thead>
              <tr>
                <th>Giáo viên</th>
                <th>Ngày giờ</th>
                <th>Thời lượng</th>
                <th>Coin đã dùng</th>
                <th>Trạng thái</th>
                <th className="num">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((booking) => {
                const status = bookingStatus(booking)
                const review = reviews[booking.id]
                return (
                  <tr key={booking.id}>
                    <td className="cell-main">
                      <span className="person">
                        <Avatar size={34} />
                        <span>
                          <strong>{teachers[booking.teacherId]?.name}</strong>
                          <small>{booking.code}</small>
                        </span>
                      </span>
                    </td>
                    <td data-label="Ngày giờ">
                      <strong>{fullDate(new Date(booking.start))}</strong>
                      <small>{timeRange(booking.start, booking.duration)}</small>
                    </td>
                    <td data-label="Thời lượng">{booking.duration} phút</td>
                    <td data-label="Coin đã dùng" className={status === 'cancelled' ? 'muted' : ''}>
                      {formatCoin(booking.coin)}
                      {status === 'cancelled' && ' · đã hoàn'}
                    </td>
                    <td data-label="Trạng thái">
                      <span className={`status status-${status}`}>{statusLabels[status]}</span>
                    </td>
                    <td className="num actions-cell">
                      {status === 'cancelled' ? (
                        <span className="muted">—</span>
                      ) : review ? (
                        <span className="review-done">
                          <Stars value={review.rating} />
                          <button className="link-button small" onClick={() => setReviewing(booking)}>
                            <Eye size={15} /> Xem đánh giá
                          </button>
                        </span>
                      ) : (
                        <button className="primary-link small" onClick={() => setReviewing(booking)}>
                          <Star size={15} /> Đánh giá
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        <p className="table-note">Chỉ buổi học đã hoàn thành mới được đánh giá · mỗi buổi đánh giá một lần, có thể sửa trong 7 ngày</p>
      </section>
      {reviewing && (
        <ReviewModal
          booking={reviewing}
          teacher={teachers[reviewing.teacherId]}
          review={reviews[reviewing.id]}
          onClose={() => setReviewing(null)}
          onDone={() => {
            setReviewing(null)
            reload()
          }}
        />
      )}
    </div>
  )
}
