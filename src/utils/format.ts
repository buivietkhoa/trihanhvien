import type { Booking, BookingStatus } from '../types'
import { addMinutes, now } from './time'

export const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN').format(value)
export const formatCoin = (value: number) => `${formatPrice(value)} coin`
export const signedCoin = (value: number) => `${value > 0 ? '+' : '−'}${formatCoin(Math.abs(value))}`

/** 1 coin = 1.000đ; học phí tính theo thời lượng buổi học */
export const coinFor = (pricePerHour: number, minutes: number) => Math.round((pricePerHour / 1000) * (minutes / 60))

export const modeLabels = { online: 'Online', offline: 'Offline', hybrid: 'Kết hợp' }
export const modeDetail = {
  online: 'Online 1:1 · Google Meet',
  offline: 'Offline 1:1 · tại trung tâm',
  hybrid: 'Kết hợp online và offline',
}

/** Buổi "sắp tới" đã qua giờ kết thúc được xem là đã hoàn thành */
export function bookingStatus(booking: Booking): BookingStatus {
  if (booking.status !== 'upcoming') return booking.status
  return addMinutes(new Date(booking.start), booking.duration) <= now() ? 'completed' : 'upcoming'
}
export const statusLabels: Record<BookingStatus, string> = {
  upcoming: 'Sắp tới',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
}

export function nextCode(prefix: string, codes: string[]) {
  const max = Math.max(0, ...codes.filter((code) => code.startsWith(prefix)).map((code) => Number(code.slice(-4))))
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}

export const initials = (name: string) =>
  name
    .split(' ')
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
export const shortName = (name: string) => name.split(' ').slice(-2).join(' ')

export function passwordStrength(value: string) {
  let score = 0
  if (value.length >= 8) score++
  if (/[a-zA-Z]/.test(value) && /\d/.test(value)) score++
  if (value.length >= 10) score++
  if (/[^a-zA-Z0-9]/.test(value) || /[A-Z]/.test(value)) score++
  // Đã nhập thì luôn sáng ít nhất 1 vạch (mức "Yếu"), giống Figma
  score = Math.max(score, value ? 1 : 0)
  return { score, label: ['Rất yếu', 'Yếu', 'Trung bình', 'Khá mạnh', 'Mạnh'][score] }
}
export const validPassword = (value: string) => value.length >= 8 && /[a-zA-Z]/.test(value) && /\d/.test(value)
export const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
