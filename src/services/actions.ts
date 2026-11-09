import type { Booking, Review, User } from '../types'
import type { TeacherProfile } from '../types/teacher'
import { nextCode } from '../utils/format'
import { isFree } from '../utils/schedule'
import { addMinutes, now, toIso } from '../utils/time'
import {
  createBooking,
  createReview,
  createTransaction,
  getAllBookingCodes,
  getAllTransactionCodes,
  getTeacher,
  getTeacherBookings,
  getTransactions,
  getUser,
  updateBooking,
  updateReview,
  updateTeacher,
  updateUser,
} from './api'

export const TOPUP_PACKAGES = [100, 300, 500]
export const PAYMENT_METHODS = [
  { id: 'wallet', label: 'Ví điện tử', note: 'MoMo, ZaloPay' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng', note: 'Quét mã VietQR' },
  { id: 'card', label: 'Thẻ ngân hàng', note: 'ATM nội địa / Visa' },
]

/** Thử lại khi lỗi mạng tạm thời (mất kết nối, trang bị gián đoạn) */
async function retry<T>(task: () => Promise<T>, times = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await task()
    } catch (error) {
      if (attempt >= times) throw error
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
    }
  }
}

async function changeBalance(userId: string, amount: number, type: 'topup' | 'payment' | 'refund', code: string, description: string) {
  const user = await getUser(userId)
  const balanceAfter = user.coinBalance + amount
  if (balanceAfter < 0) throw new Error('Số dư coin không đủ')
  await createTransaction({
    id: `tr${Date.now()}`,
    code,
    userId,
    type,
    amount,
    balanceAfter,
    createdAt: toIso(now()),
    description,
  })
  return retry(() => updateUser(userId, { coinBalance: balanceAfter }))
}

export async function bookLesson(user: User, teacher: TeacherProfile, start: string, duration: number, coin: number) {
  const taken = await getTeacherBookings(teacher.id)
  // Bấm xác nhận lại sau khi lần trước bị gián đoạn: hoàn tất đúng buổi đó thay vì báo trùng lịch
  const unfinished = taken.find((booking) => booking.userId === user.id && booking.start === start && booking.duration === duration)
  if (unfinished) {
    const paid = (await getTransactions(user.id)).some((item) => item.code === unfinished.code && item.type === 'payment')
    if (!paid) await changeBalance(user.id, -unfinished.coin, 'payment', unfinished.code, `Thanh toán buổi học ${unfinished.code}`)
    return unfinished
  }
  if (!isFree(teacher.id, new Date(start), taken, undefined, duration)) throw new Error('Ca học này vừa được người khác đặt, vui lòng chọn ca khác.')
  const latest = await getUser(user.id)
  if (latest.coinBalance < coin) throw new Error('Số dư coin không đủ để đặt buổi học này.')
  const code = nextCode('MC-2026-', await getAllBookingCodes())
  const booking = await createBooking({
    id: `b${Date.now()}`,
    code,
    userId: user.id,
    teacherId: teacher.id,
    start,
    duration,
    coin,
    status: 'upcoming',
    reviewId: null,
    createdAt: toIso(now()),
  })
  await changeBalance(user.id, -coin, 'payment', code, `Thanh toán buổi học ${code}`)
  return booking
}

export const hoursUntil = (booking: Booking) => (new Date(booking.start).getTime() - now().getTime()) / 3600000

export async function cancelLesson(booking: Booking) {
  // Được huỷ bất cứ lúc nào trước giờ học, hoàn 100% coin
  if (hoursUntil(booking) <= 0) throw new Error('Buổi học đã bắt đầu nên không thể huỷ.')
  await updateBooking(booking.id, { status: 'cancelled', cancelledAt: toIso(now()) })
  return changeBalance(booking.userId, booking.coin, 'refund', booking.code, `Hoàn coin buổi học ${booking.code} (đã huỷ)`)
}

export async function rescheduleLesson(booking: Booking, start: Date) {
  const taken = await getTeacherBookings(booking.teacherId)
  if (!isFree(booking.teacherId, start, taken, booking.id, booking.duration)) throw new Error('Ca học mới không còn trống.')
  return updateBooking(booking.id, { start: toIso(start) })
}

export async function topUp(userId: string, coin: number, method: string) {
  const code = nextCode('NAP-2026-', await getAllTransactionCodes())
  const label = PAYMENT_METHODS.find((item) => item.id === method)?.label ?? ''
  return changeBalance(userId, coin, 'topup', code, `Nạp coin ${code} · ${label}`)
}

export const REVIEW_EDIT_DAYS = 7
export const canEditReview = (review: Review) => addMinutes(new Date(review.createdAt), REVIEW_EDIT_DAYS * 1440) > now()

/** Lưu đánh giá và cập nhật điểm trung bình, phân bố sao của giáo viên */
export async function saveReview(user: User, booking: Booking, rating: number, content: string, previous?: Review) {
  const teacher = await getTeacher(booking.teacherId)
  const breakdown = [...teacher.ratingBreakdown]
  if (previous) breakdown[5 - previous.rating]--
  breakdown[5 - rating]++
  const count = breakdown.reduce((sum, value) => sum + value, 0)
  const total = breakdown.reduce((sum, value, index) => sum + value * (5 - index), 0)
  await updateTeacher(teacher.id, { ratingBreakdown: breakdown, reviews: count, rating: Math.round((total / count) * 10) / 10 })
  if (previous) return updateReview(previous.id, { rating, content })
  const review = await createReview({
    id: `r${Date.now()}`,
    teacherId: booking.teacherId,
    userId: user.id,
    bookingId: booking.id,
    author: user.name.split(' ').slice(-2).join(' '),
    rating,
    content,
    createdAt: toIso(now()),
  })
  await updateBooking(booking.id, { reviewId: review.id })
  return review
}
