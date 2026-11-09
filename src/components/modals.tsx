import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Info, Star, X } from 'lucide-react'
import type { Booking, Review } from '../types'
import type { TeacherProfile } from '../types/teacher'
import { getTeacherBookings } from '../services/api'
import {
  PAYMENT_METHODS,
  TOPUP_PACKAGES,
  canEditReview,
  cancelLesson,
  hoursUntil,
  rescheduleLesson,
  saveReview,
  topUp,
} from '../services/actions'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatCoin, formatPrice } from '../utils/format'
import { isFree } from '../utils/schedule'
import { addDays, fullDate, longDate, now, shortDay, startOfDay, timeRange, toIso } from '../utils/time'
import { Avatar, Modal } from './common'
import SlotGrid from './SlotGrid'

function LessonSummary({ booking, teacher }: { booking: Booking; teacher?: TeacherProfile }) {
  const start = new Date(booking.start)
  return (
    <div className="mini-teacher soft">
      <Avatar size={44} />
      <div>
        <strong>
          {teacher?.name} {teacher && <span className="level-tag">HSK {teacher.hsk}</span>}
        </strong>
        <span className="lesson-when">
          {longDate(start)} · {timeRange(booking.start, booking.duration)}
        </span>
        <small>
          {booking.duration} phút · {formatCoin(booking.coin)} · {booking.code}
        </small>
      </div>
    </div>
  )
}

function Failure({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="alert alert-error" role="alert">
      <CircleAlert size={18} /> {message}
    </div>
  )
}

export function TopUpModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { user, refresh } = useAuth()
  const toast = useToast()
  const [coin, setCoin] = useState(300)
  const [method, setMethod] = useState('wallet')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!user) return null
  async function submit() {
    if (!user) return
    setBusy(true)
    try {
      await topUp(user.id, coin, method)
      await refresh()
      toast('Nạp coin thành công', `+${formatCoin(coin)} đã được cộng vào ví.`)
      onDone()
    } catch {
      setError('Không thể nạp coin, vui lòng thử lại.')
      setBusy(false)
    }
  }
  return (
    <Modal title="Nạp coin" onClose={onClose}>
      <h3 className="modal-step">Bước 1 · Chọn gói coin</h3>
      <div className="package-grid" role="radiogroup" aria-label="Gói coin">
        {TOPUP_PACKAGES.map((value) => (
          <button key={value} role="radio" aria-checked={coin === value} className={coin === value ? 'is-active' : ''} onClick={() => setCoin(value)}>
            {value === 500 && <span className="popular-tag">Tiết kiệm</span>}
            <strong>{value} coin</strong>
            <small>{formatPrice(value * 1000)}đ</small>
          </button>
        ))}
      </div>
      <h3 className="modal-step">Bước 2 · Phương thức thanh toán (mô phỏng)</h3>
      <div className="method-list" role="radiogroup" aria-label="Phương thức thanh toán">
        {PAYMENT_METHODS.map((item) => (
          <label key={item.id} className={method === item.id ? 'is-active' : ''}>
            <input type="radio" name="method" checked={method === item.id} onChange={() => setMethod(item.id)} />
            <span>
              <strong>{item.label}</strong>
              <small>{item.note}</small>
            </span>
          </label>
        ))}
      </div>
      <p className="note boxed">
        <Info size={14} /> Thanh toán mô phỏng phục vụ demo – không kết nối cổng thanh toán thật và không lưu thông tin thẻ.
      </p>
      <dl className="detail-list">
        <div>
          <dt>Số dư sau khi nạp</dt>
          <dd className="positive big">
            {user.coinBalance} <ArrowRight size={16} /> {formatCoin(user.coinBalance + coin)}
          </dd>
        </div>
      </dl>
      <Failure message={error} />
      <div className="modal-actions">
        <button className="link-button" onClick={onClose}>Huỷ</button>
        <button className="primary-link" disabled={busy} onClick={submit}>
          <Check size={18} /> {busy ? 'Đang xử lý…' : `Xác nhận nạp ${coin} coin`}
        </button>
      </div>
    </Modal>
  )
}

export function CancelModal({ booking, teacher, onClose, onDone }: { booking: Booking; teacher?: TeacherProfile; onClose: () => void; onDone: () => void }) {
  const { user, refresh } = useAuth()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const hours = hoursUntil(booking)
  const allowed = hours > 0
  const minutes = Math.max(0, Math.round(hours * 60))
  const left = [
    minutes >= 1440 && `${Math.floor(minutes / 1440)} ngày`,
    `${Math.floor((minutes % 1440) / 60)} giờ`,
    `${minutes % 60} phút`,
  ]
    .filter(Boolean)
    .join(' ')
  async function submit() {
    setBusy(true)
    try {
      await cancelLesson(booking)
      await refresh()
      toast('Đã huỷ buổi học', `+${formatCoin(booking.coin)} đã được hoàn vào ví.`)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể huỷ buổi học.')
      setBusy(false)
    }
  }
  return (
    <Modal title="Huỷ buổi học" onClose={onClose}>
      <LessonSummary booking={booking} teacher={teacher} />
      {allowed ? (
        <div className="alert alert-success">
          <CircleCheck size={18} /> Huỷ trước giờ học được hoàn 100% coin. Khung giờ sẽ được trả lại cho giáo viên.
        </div>
      ) : (
        <div className="alert alert-warning">
          <CircleAlert size={18} />
          <span>
            Buổi học đã bắt đầu nên không thể huỷ. Bạn vẫn có thể liên hệ hỗ trợ nếu có lý do đặc biệt.
          </span>
        </div>
      )}
      <dl className="detail-list">
        <div><dt>Thời gian còn lại đến giờ học</dt><dd>{allowed ? left : 'Đã bắt đầu'}</dd></div>
        <div><dt>Số coin được hoàn</dt><dd className={allowed ? 'positive big' : ''}>{allowed ? `+${formatCoin(booking.coin)}` : '0 coin'}</dd></div>
        {allowed && user && (
          <div><dt>Số dư sau khi hoàn</dt><dd>{user.coinBalance} → {formatCoin(user.coinBalance + booking.coin)}</dd></div>
        )}
      </dl>
      <Failure message={error} />
      <div className="modal-actions">
        <button className="outline-button" onClick={onClose}>Giữ lại</button>
        <button className="danger-button" disabled={!allowed || busy} onClick={submit}>
          <X size={18} /> Xác nhận huỷ
        </button>
      </div>
    </Modal>
  )
}

export function RescheduleModal({ booking, teacher, onClose, onDone }: { booking: Booking; teacher?: TeacherProfile; onClose: () => void; onDone: () => void }) {
  const toast = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [offset, setOffset] = useState(1)
  const [selected, setSelected] = useState<Date | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    getTeacherBookings(booking.teacherId).then(setBookings).catch(() => setError('Không tải được lịch của giáo viên.'))
  }, [booking.teacherId])
  const first = addDays(startOfDay(now()), offset)
  const days = Array.from({ length: 7 }, (_, i) => addDays(first, i))
  const oldStart = new Date(booking.start)
  async function submit() {
    if (!selected) return
    setBusy(true)
    try {
      await rescheduleLesson(booking, selected)
      toast('Đã đổi lịch học', `${shortDay(selected)}, ${fullDate(selected)} · ${timeRange(toIso(selected), booking.duration)}`)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đổi lịch.')
      setBusy(false)
    }
  }
  return (
    <Modal title="Đổi lịch học" onClose={onClose} wide>
      <LessonSummary booking={booking} teacher={teacher} />
      <p className="note">
        <Info size={14} /> Giữ nguyên thời lượng {booking.duration} phút và học phí {formatCoin(booking.coin)} · chọn một ca còn trống trong 7 ngày tới
      </p>
      <div className="week-nav spread">
        <strong>
          {fullDate(days[0]).slice(0, 5)} – {fullDate(days[6])}
        </strong>
        <span>
          <button className="icon-button plain" aria-label="Tuần trước" disabled={offset <= 1} onClick={() => setOffset(offset - 7)}>
            <ChevronLeft size={18} />
          </button>
          <button className="icon-button plain" aria-label="Tuần sau" onClick={() => setOffset(offset + 7)}>
            <ChevronRight size={18} />
          </button>
        </span>
      </div>
      <SlotGrid
        teacherId={booking.teacherId}
        days={days}
        bookings={bookings}
        selected={selected}
        ignoreId={booking.id}
        minutes={booking.duration}
        onSelect={(start) => {
          setError('')
          if (isFree(booking.teacherId, start, bookings, booking.id, booking.duration)) setSelected(start)
        }}
      />
      <div className="reschedule-compare">
        <div>
          <small>Lịch cũ</small>
          <span>{shortDay(oldStart)}, {fullDate(oldStart).slice(0, 5)} · {timeRange(booking.start, booking.duration)}</span>
        </div>
        <ChevronRight size={18} />
        <div className="accent">
          <small>Lịch mới</small>
          <strong>{selected ? `${shortDay(selected)}, ${fullDate(selected).slice(0, 5)} · ${timeRange(toIso(selected), booking.duration)}` : 'Chưa chọn'}</strong>
        </div>
      </div>
      <Failure message={error} />
      <div className="modal-actions">
        <button className="link-button" onClick={onClose}>Huỷ</button>
        <button className="primary-link" disabled={!selected || busy} onClick={submit}>
          <Check size={18} /> Xác nhận đổi
        </button>
      </div>
    </Modal>
  )
}

const RATING_LABELS = ['', 'Rất tệ', 'Chưa tốt', 'Bình thường', 'Rất tốt', 'Tuyệt vời']

export function ReviewModal({
  booking,
  teacher,
  review,
  onClose,
  onDone,
}: {
  booking: Booking
  teacher?: TeacherProfile
  review?: Review
  onClose: () => void
  onDone: () => void
}) {
  const { user } = useAuth()
  const toast = useToast()
  const editable = !review || canEditReview(review)
  const [rating, setRating] = useState(review?.rating ?? 0)
  const [content, setContent] = useState(review?.content ?? '')
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const invalid = rating === 0 || content.trim().length < 10
  async function submit() {
    setTouched(true)
    if (invalid || !user) return
    setBusy(true)
    try {
      await saveReview(user, booking, rating, content.trim(), review)
      toast(review ? 'Đã cập nhật đánh giá' : 'Cảm ơn bạn đã đánh giá!', 'Đánh giá đã hiển thị trên hồ sơ giáo viên.')
      onDone()
    } catch {
      setError('Không thể gửi đánh giá, vui lòng thử lại.')
      setBusy(false)
    }
  }
  const start = new Date(booking.start)
  return (
    <Modal title={review && !editable ? 'Đánh giá của bạn' : 'Đánh giá giáo viên'} onClose={onClose}>
      <div className="mini-teacher soft">
        <Avatar size={44} />
        <div>
          <strong>{teacher?.name}</strong>
          <small>
            {fullDate(start)} · {timeRange(booking.start, booking.duration)} · {booking.duration} phút · {booking.code}
          </small>
        </div>
      </div>
      <p className="center muted">Bạn đánh giá buổi học này thế nào?</p>
      <div className="star-picker" role="radiogroup" aria-label="Số sao">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} sao`}
            disabled={!editable}
            onClick={() => setRating(value)}
          >
            <Star size={34} fill={value <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
      <p className="center"><strong>{rating ? `${rating}/5 · ${RATING_LABELS[rating]}` : 'Chọn số sao'}</strong></p>
      <label className="field">
        <span>Nhận xét của bạn</span>
        <textarea
          rows={4}
          maxLength={500}
          value={content}
          disabled={!editable}
          aria-invalid={touched && content.trim().length < 10}
          onChange={(event) => setContent(event.target.value)}
        />
        <span className="field-meta">
          <small className={touched && content.trim().length < 10 ? 'field-error' : ''}>Tối thiểu 10 ký tự</small>
          <small>{content.length}/500</small>
        </span>
      </label>
      {touched && rating === 0 && <small className="field-error">Vui lòng chọn số sao</small>}
      <p className="note boxed">
        <Info size={14} />
        {editable
          ? 'Đánh giá hiển thị công khai trên hồ sơ giáo viên và có thể chỉnh sửa trong 7 ngày.'
          : 'Đã quá 7 ngày nên đánh giá này không thể chỉnh sửa.'}
      </p>
      <Failure message={error} />
      <div className="modal-actions">
        <button className="link-button" onClick={onClose}>{editable ? 'Huỷ' : 'Đóng'}</button>
        {editable && (
          <button className="primary-link" disabled={busy} onClick={submit}>
            <Check size={18} /> {review ? 'Lưu thay đổi' : 'Gửi đánh giá'}
          </button>
        )}
      </div>
    </Modal>
  )
}
