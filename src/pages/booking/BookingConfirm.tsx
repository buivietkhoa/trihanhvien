import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, CircleAlert, Coins, Info } from 'lucide-react'
import type { TeacherProfile } from '../../types/teacher'
import { getTeacher } from '../../services/api'
import { bookLesson } from '../../services/actions'
import { useAuth } from '../../context/AuthContext'
import { Avatar, Loading, Stepper } from '../../components/common'
import { coinFor, formatCoin, formatPrice, modeDetail } from '../../utils/format'
import { longDate, timeRange } from '../../utils/time'
import { clearDraft, readDraft } from './draft'

export default function BookingConfirm() {
  const draft = readDraft()
  const navigate = useNavigate()
  const { user, refresh } = useAuth()
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (draft) getTeacher(draft.teacherId).then(setTeacher).catch(() => setError('Không thể kết nối máy chủ dữ liệu.'))
  }, [draft?.teacherId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!draft) return <Navigate to="/teachers" replace />
  if (!teacher || !user) return <div className="shell page-pad">{error ? <p className="alert alert-error">{error}</p> : <Loading />}</div>

  const coin = coinFor(teacher.price, draft.duration)
  const after = user.coinBalance - coin
  const start = new Date(draft.start)

  async function confirm() {
    if (!teacher || !user || !draft) return
    setBusy(true)
    setError('')
    try {
      const booking = await bookLesson(user, teacher, draft.start, draft.duration, coin)
      // Chuyển trang trước rồi mới xoá nháp, tránh trang này vẽ lại và tự quay về /teachers
      navigate(`/booking/success?code=${booking.code}`, { replace: true })
      clearDraft()
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đặt lịch không thành công.')
      setBusy(false)
    }
  }

  return (
    <div className="shell page-pad booking-page">
      <Stepper step={2} />
      <section className="card confirm-card">
        <h1>Xác nhận đặt lịch</h1>
        <p className="muted">Kiểm tra lại thông tin trước khi xác nhận. Coin sẽ được trừ ngay sau khi đặt lịch thành công.</p>
        <div className="mini-teacher soft">
          <Avatar size={40} />
          <div>
            <strong>{teacher.name}</strong>
            <span className="level-tag">HSK {teacher.hsk}</span>
          </div>
        </div>
        <dl className="detail-list">
          <div><dt>Ngày học</dt><dd>{longDate(start)}</dd></div>
          <div><dt>Giờ học</dt><dd>{timeRange(draft.start, draft.duration)} (GMT+7)</dd></div>
          <div><dt>Thời lượng</dt><dd>{draft.duration} phút</dd></div>
          <div><dt>Hình thức</dt><dd>{modeDetail[teacher.mode]}</dd></div>
        </dl>
        <dl className="detail-list bordered">
          <div><dt>Học phí</dt><dd>{formatPrice(coin * 1000)}đ</dd></div>
          <div><dt>Quy đổi coin</dt><dd className="accent big"><Coins size={18} /> {formatCoin(coin)}</dd></div>
        </dl>
        <dl className="detail-list soft">
          <div><dt>Số dư hiện tại</dt><dd>{formatCoin(user.coinBalance)}</dd></div>
          <div><dt>Số dư sau khi đặt</dt><dd className={after < 0 ? 'negative' : 'positive'}>{formatCoin(after)}</dd></div>
        </dl>
        {after < 0 && (
          <div className="alert alert-error" role="alert">
            <CircleAlert size={18} />
            <span>
              Số dư không đủ. <Link to="/wallet?topup=1">Nạp thêm coin</Link> rồi quay lại xác nhận.
            </span>
          </div>
        )}
        {error && after >= 0 && (
          <div className="alert alert-error" role="alert">
            <CircleAlert size={18} /> {error}
          </div>
        )}
        <p className="note"><Info size={14} /> Huỷ miễn phí bất cứ lúc nào trước giờ học.</p>
        <div className="button-row">
          <Link to={`/booking/${teacher.id}`} className="outline-button">
            <ChevronLeft size={18} /> Quay lại
          </Link>
          <button className="primary-link" disabled={busy || after < 0} onClick={confirm}>
            <Check size={18} /> {busy ? 'Đang xử lý…' : 'Xác nhận'}
          </button>
        </div>
      </section>
    </div>
  )
}
