import type { Booking } from '../types'
import { addDays, addMinutes, clock, now, startOfDay } from './time'

/** Mỗi buổi học là một ca cố định 90 phút */
export const SHIFT_MINUTES = 90
export const SHIFTS = [
  { id: 1, start: '08:00', period: 'Sáng' },
  { id: 2, start: '10:00', period: 'Sáng' },
  { id: 3, start: '14:00', period: 'Chiều' },
  { id: 4, start: '16:00', period: 'Chiều' },
  { id: 5, start: '18:00', period: 'Tối' },
  { id: 6, start: '20:00', period: 'Tối' },
].map((shift) => {
  const [hours, minutes] = shift.start.split(':').map(Number)
  const end = hours * 60 + minutes + SHIFT_MINUTES
  return { ...shift, end: `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}` }
})
export type Shift = (typeof SHIFTS)[number]

/** Lịch bận cố định của giáo viên theo từng ca (giả lập, luôn ra cùng kết quả cho cùng một ca) */
function teacherBusy(teacherId: string, start: Date) {
  const key = `${teacherId}-${start.getMonth()}-${start.getDate()}-${clock(start)}`
  let hash = 0
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash % 100 < 35
}

export function slotAt(day: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const slot = startOfDay(day)
  slot.setHours(hours, minutes)
  return slot
}

export type SlotState = 'free' | 'booked' | 'past'

/** Trạng thái một khoảng giờ: đã qua, trùng buổi đã đặt / giáo viên bận, hoặc còn trống */
export function slotState(teacherId: string, start: Date, bookings: Booking[], ignoreId?: string, minutes = SHIFT_MINUTES): SlotState {
  if (start <= now()) return 'past'
  const end = addMinutes(start, minutes)
  const overlap = bookings.some((booking) => {
    if (booking.status === 'cancelled' || booking.id === ignoreId) return false
    const bookingStart = new Date(booking.start)
    return start < addMinutes(bookingStart, booking.duration) && bookingStart < end
  })
  return overlap || teacherBusy(teacherId, start) ? 'booked' : 'free'
}

export const isFree = (teacherId: string, start: Date, bookings: Booking[], ignoreId?: string, minutes = SHIFT_MINUTES) =>
  slotState(teacherId, start, bookings, ignoreId, minutes) === 'free'

export const weekDays = (start: Date) => Array.from({ length: 7 }, (_, i) => addDays(start, i))
