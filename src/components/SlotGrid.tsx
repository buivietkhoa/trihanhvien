import { Check } from 'lucide-react'
import type { Booking } from '../types'
import { SHIFTS, slotAt, slotState } from '../utils/schedule'
import { dayMonth, now, sameDay, shortDay, startOfDay } from '../utils/time'

type Props = {
  teacherId: string
  days: Date[]
  bookings: Booking[]
  selected: Date | null
  onSelect: (start: Date) => void
  ignoreId?: string
  /** Thời lượng cần kiểm tra trống (mặc định 1 ca 90 phút; đổi lịch giữ nguyên thời lượng cũ) */
  minutes?: number
}

const LABELS = { free: 'Còn trống', booked: 'Đã đặt', past: 'Đã qua' }

/** Bảng ca học theo tuần: mỗi hàng là một ca cố định, mỗi ô là ca đó của một ngày */
export default function SlotGrid({ teacherId, days, bookings, selected, onSelect, ignoreId, minutes }: Props) {
  const today = startOfDay(now())
  return (
    <div className="shift-grid">
      <p className="slot-hint">
        Mỗi ô là <strong>một ca học 90 phút</strong>. Bấm vào ô <strong>"Còn trống"</strong> để chọn ca đó.
      </p>
      <div className="shift-table" role="table" aria-label="Lịch ca học trong tuần">
        <div className="shift-row shift-head" role="row">
          <span role="columnheader">Ca học</span>
          {days.map((day) => {
            const past = startOfDay(day) < today
            const isToday = sameDay(day, today)
            const active = selected && sameDay(day, selected)
            return (
              <span
                key={day.toISOString()}
                role="columnheader"
                className={[past && 'is-past', isToday && 'is-today', active && 'is-active'].filter(Boolean).join(' ')}
              >
                <b>{shortDay(day)}</b>
                {dayMonth(day)}
                {isToday && <em>Hôm nay</em>}
              </span>
            )
          })}
        </div>
        {SHIFTS.map((shift) => (
          <div className="shift-row" role="row" key={shift.id}>
            <span className="shift-label" role="rowheader">
              <strong>Ca {shift.id}</strong>
              {shift.start} – {shift.end}
              <small>{shift.period}</small>
            </span>
            {days.map((day) => {
              const start = slotAt(day, shift.start)
              const state = slotState(teacherId, start, bookings, ignoreId, minutes)
              const chosen = !!selected && selected.getTime() === start.getTime()
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  role="cell"
                  className={`shift-cell ${chosen ? 'is-selected' : state}`}
                  disabled={state !== 'free' && !chosen}
                  aria-pressed={chosen}
                  aria-label={`Ca ${shift.id}, ${shortDay(day)} ${dayMonth(day)}, ${shift.start} đến ${shift.end}: ${chosen ? 'đang chọn' : LABELS[state]}`}
                  onClick={() => onSelect(start)}
                >
                  {chosen ? (
                    <>
                      <Check size={14} strokeWidth={3} /> Đã chọn
                    </>
                  ) : (
                    LABELS[state]
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div className="slot-legend">
        <span><i className="free" /> Còn trống</span>
        <span><i className="booked" /> Đã đặt</span>
        <span><i className="past" /> Đã qua</span>
        <span><i className="is-selected" /> Đang chọn</span>
      </div>
    </div>
  )
}
