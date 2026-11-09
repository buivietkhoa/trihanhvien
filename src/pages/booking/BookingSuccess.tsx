import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { CalendarDays, ChevronRight, CircleCheck } from 'lucide-react'
import type { Booking } from '../../types'
import type { TeacherProfile } from '../../types/teacher'
import { getBookingByCode, getTeacher } from '../../services/api'
import { Loading, Stepper } from '../../components/common'
import { formatCoin } from '../../utils/format'
import { fullDate, shortDay, timeRange } from '../../utils/time'

export default function BookingSuccess() {
  const code = useSearchParams()[0].get('code') || ''
  const [booking, setBooking] = useState<Booking | null>(null)
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    getBookingByCode(code)
      .then(async (found) => {
        if (!found) return setMissing(true)
        setBooking(found)
        setTeacher(await getTeacher(found.teacherId))
      })
      .catch(() => setMissing(true))
  }, [code])

  if (missing) return <Navigate to="/dashboard" replace />
  if (!booking || !teacher) return <div className="shell page-pad"><Loading /></div>
  const start = new Date(booking.start)

  return (
    <div className="shell page-pad booking-page">
      <Stepper step={3} />
      <section className="card confirm-card center">
        <span className="success-icon">
          <CircleCheck size={38} />
        </span>
        <h1>Đặt lịch thành công!</h1>
        <p className="muted">Buổi học đã được thêm vào Dashboard. Link Google Meet sẽ được gửi trước giờ học 15 phút.</p>
        <p className="code-badge">
          Mã đặt lịch <strong>{booking.code}</strong>
        </p>
        <dl className="detail-list boxed">
          <div><dt>Giáo viên</dt><dd>{teacher.name}</dd></div>
          <div><dt>Thời gian</dt><dd>{shortDay(start)}, {fullDate(start)} · {timeRange(booking.start, booking.duration).replace(' – ', '–')}</dd></div>
          <div><dt>Thời lượng</dt><dd>{booking.duration} phút</dd></div>
          <div><dt>Đã thanh toán</dt><dd className="accent">{formatCoin(booking.coin)}</dd></div>
          <div><dt>Trạng thái</dt><dd><span className="status status-upcoming">Sắp tới</span></dd></div>
        </dl>
        <div className="button-row">
          <Link to="/dashboard" className="primary-link">
            <ChevronRight size={18} /> Về Dashboard
          </Link>
          <Link to="/teachers" className="outline-button">
            <CalendarDays size={18} /> Đặt thêm buổi học
          </Link>
        </div>
      </section>
    </div>
  )
}
