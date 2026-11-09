import type { Booking, Course, Faq, Review, Transaction, User } from '../types'
import type { TeacherProfile, TeacherQuery } from '../types/teacher'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
// Bản build triển khai tĩnh (Vercel) không có JSON Server: dùng máy chủ giả lập trong trình duyệt.
// Đặt VITE_API_URL=local để dùng chế độ này cả khi chạy trên máy.
const USE_LOCAL = import.meta.env.VITE_API_URL === 'local' || (import.meta.env.PROD && !import.meta.env.VITE_API_URL)

async function request(path: string, init?: RequestInit) {
  const options = { ...init, headers: init?.body ? { 'Content-Type': 'application/json' } : undefined }
  const response = USE_LOCAL
    ? await (await import('./localApi')).localFetch(path, options)
    : await fetch(`${API_URL}${path}`, options)
  if (!response.ok) throw new Error(`Mock API error: ${response.status}`)
  return response
}
const get = async <T,>(path: string, signal?: AbortSignal): Promise<T> => (await request(path, { signal })).json()
async function send<T>(method: 'POST' | 'PATCH', path: string, body: unknown): Promise<T> {
  try {
    return await (await request(path, { method, body: JSON.stringify(body) })).json()
  } catch (error) {
    // Một số tiện ích trình duyệt (vd. "Allow CORS") ghi đè CORS và bỏ PATCH khỏi danh sách cho phép,
    // khiến trình duyệt báo "Failed to fetch". Khi đó gộp thay đổi vào bản ghi hiện tại và gửi bằng PUT.
    if (method !== 'PATCH' || !(error instanceof TypeError)) throw error
    const current = await get<Record<string, unknown>>(path)
    return (await request(path, { method: 'PUT', body: JSON.stringify({ ...current, ...(body as object) }) })).json()
  }
}

export async function getTeachers(params: TeacherQuery = {}, signal?: AbortSignal) {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.hsk) qs.set('hsk', params.hsk)
  if (params.mode)
    params.mode
      .split(',')
      .filter(Boolean)
      .forEach((mode) => qs.append('mode', mode))
  if (params.minRating) qs.set('rating_gte', params.minRating)
  if (params.maxPrice) qs.set('price_lte', params.maxPrice)
  if (params.featured) qs.set('featured', params.featured)
  const sorts: Record<string, [string, string]> = {
    'price-asc': ['price', 'asc'],
    'price-desc': ['price', 'desc'],
    rating: ['rating', 'desc'],
    featured: ['featuredOrder', 'asc'],
  }
  const [field, order] = sorts[params.sort || 'rating'] || sorts.rating
  qs.set('_sort', field)
  qs.set('_order', order)
  qs.set('_page', params.page || '1')
  qs.set('_limit', params.limit || '9')
  const response = await request(`/teachers?${qs}`, { signal })
  return {
    data: (await response.json()) as TeacherProfile[],
    total: Number(response.headers.get('X-Total-Count')),
  }
}
export const getTeacher = (id: string, signal?: AbortSignal) => get<TeacherProfile>(`/teachers/${id}`, signal)
export const getTeachersByIds = (ids: string[], signal?: AbortSignal) =>
  get<TeacherProfile[]>(`/teachers?${ids.map((id) => `id=${id}`).join('&')}`, signal)
export const updateTeacher = (id: string, data: Partial<TeacherProfile>) =>
  send<TeacherProfile>('PATCH', `/teachers/${id}`, data)

export const getCourses = (signal?: AbortSignal) => get<Course[]>('/courses?_sort=popularity', signal)
export const getCourse = (id: string, signal?: AbortSignal) => get<Course>(`/courses/${id}`, signal)

export const findUserByEmail = async (email: string) =>
  (await get<User[]>(`/users?email=${encodeURIComponent(email.trim().toLowerCase())}`))[0]
export const getUser = (id: string, signal?: AbortSignal) => get<User>(`/users/${id}`, signal)
export const createUser = (data: User) => send<User>('POST', '/users', data)
export const updateUser = (id: string, data: Partial<User>) => send<User>('PATCH', `/users/${id}`, data)

export const getBookings = (userId: string, signal?: AbortSignal) =>
  get<Booking[]>(`/bookings?userId=${userId}&_sort=start&_order=desc`, signal)
export const getTeacherBookings = (teacherId: string, signal?: AbortSignal) =>
  get<Booking[]>(`/bookings?teacherId=${teacherId}&status_ne=cancelled`, signal)
export const getBookingByCode = async (code: string, signal?: AbortSignal) =>
  (await get<Booking[]>(`/bookings?code=${code}`, signal))[0]
export const getAllBookingCodes = async () => (await get<Booking[]>('/bookings')).map((booking) => booking.code)
export const createBooking = (data: Booking) => send<Booking>('POST', '/bookings', data)
export const updateBooking = (id: string, data: Partial<Booking>) => send<Booking>('PATCH', `/bookings/${id}`, data)

export const getTransactions = (userId: string, signal?: AbortSignal) =>
  get<Transaction[]>(`/transactions?userId=${userId}&_sort=createdAt&_order=desc`, signal)
export const getAllTransactionCodes = async () =>
  (await get<Transaction[]>('/transactions')).map((transaction) => transaction.code)
export const createTransaction = (data: Transaction) => send<Transaction>('POST', '/transactions', data)

export const getReviews = (teacherId: string, signal?: AbortSignal) =>
  get<Review[]>(`/reviews?teacherId=${teacherId}&_sort=createdAt&_order=desc`, signal)
export const getUserReviews = (userId: string, signal?: AbortSignal) => get<Review[]>(`/reviews?userId=${userId}`, signal)
export const createReview = (data: Review) => send<Review>('POST', '/reviews', data)
export const updateReview = (id: string, data: Partial<Review>) => send<Review>('PATCH', `/reviews/${id}`, data)

export const getFaqs = (signal?: AbortSignal) => get<Faq[]>('/faqs', signal)

export async function createTicket(data: { topic: string; email: string; content: string; userId?: string }) {
  const count = (await get<unknown[]>('/tickets')).length
  const code = `HT-2026-${String(count + 1).padStart(4, '0')}`
  return send<{ code: string }>('POST', '/tickets', {
    id: `ht${Date.now()}`,
    code,
    ...data,
    createdAt: new Date().toISOString(),
  })
}
