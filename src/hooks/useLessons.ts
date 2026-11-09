import { useCallback, useEffect, useState } from 'react'
import type { Booking, Review } from '../types'
import type { TeacherProfile } from '../types/teacher'
import { getBookings, getTeachersByIds, getUserReviews } from '../services/api'

/** Tải buổi học của học viên cùng giáo viên và đánh giá liên quan */
export function useLessons(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [teachers, setTeachers] = useState<Record<string, TeacherProfile>>({})
  const [reviews, setReviews] = useState<Record<string, Review>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((value) => value + 1), [])

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    setError(false)
    Promise.all([getBookings(userId, controller.signal), getUserReviews(userId, controller.signal)])
      .then(async ([list, userReviews]) => {
        const ids = [...new Set(list.map((booking) => booking.teacherId))]
        const found = ids.length ? await getTeachersByIds(ids, controller.signal) : []
        setBookings(list)
        setTeachers(Object.fromEntries(found.map((teacher) => [teacher.id, teacher])))
        setReviews(Object.fromEntries(userReviews.map((review) => [review.bookingId, review])))
      })
      .catch(() => !controller.signal.aborted && setError(true))
      .finally(() => !controller.signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [userId, version])

  return { bookings, teachers, reviews, loading, error, reload }
}
