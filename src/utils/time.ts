// Mốc "hiện tại" của bản demo khớp với kịch bản Figma (Thứ Năm 22/10/2026 15:45).
// Đặt VITE_DEMO_NOW=real để dùng giờ thật của máy.
const DEMO_NOW = import.meta.env.VITE_DEMO_NOW || '2026-10-22T15:45:00+07:00'

export const now = () => (DEMO_NOW === 'real' ? new Date() : new Date(DEMO_NOW))

const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const SHORT_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const pad = (value: number) => String(value).padStart(2, '0')

export const weekday = (date: Date) => WEEKDAYS[date.getDay()]
export const shortDay = (date: Date) => SHORT_DAYS[date.getDay()]
export const dayMonth = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`
export const fullDate = (date: Date) => `${dayMonth(date)}/${date.getFullYear()}`
export const clock = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`
export const dateTime = (value: string) => `${fullDate(new Date(value))} ${clock(new Date(value))}`
export const longDate = (date: Date) => `${weekday(date)}, ${fullDate(date)}`

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000)
}
export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
export function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}
export function startOfWeek(date: Date) {
  const day = startOfDay(date)
  return addDays(day, -((day.getDay() + 6) % 7))
}
export const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime()

/** Chuỗi ISO giờ Việt Nam, ví dụ 2026-10-22T19:00:00+07:00 */
export function toIso(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${clock(date)}:00+07:00`
}
export function timeRange(start: string, minutes: number) {
  const begin = new Date(start)
  return `${clock(begin)} – ${clock(addMinutes(begin, minutes))}`
}
