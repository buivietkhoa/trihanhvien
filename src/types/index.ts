export type Course = {
  id: string
  art: string
  title: string
  level: string
  levelGroup: 'hsk12' | 'hsk34' | 'hsk56'
  goal: string
  badge: string
  sessions: number
  minutes: number
  price: number
  popularity: number
  description: string
  entry: string
  exit: string
  teacherIds: string[]
  roadmap: { label: string; content: string }[]
}

export type User = {
  id: string
  name: string
  email: string
  password: string
  phone: string
  avatar: string
  coinBalance: number
  level: string
  goal: string
  preferredTimes: string[]
  progress: { done: number; total: number }
  favorites: string[]
  passwordChangedAt: string
  createdAt: string
}

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled'

export type Booking = {
  id: string
  code: string
  userId: string
  teacherId: string
  start: string
  duration: number
  coin: number
  status: BookingStatus
  reviewId: string | null
  createdAt: string
  cancelledAt?: string
}

export type Transaction = {
  id: string
  code: string
  userId: string
  type: 'topup' | 'payment' | 'refund'
  amount: number
  balanceAfter: number
  createdAt: string
  description: string
}

export type Review = {
  id: string
  teacherId: string
  userId: string | null
  bookingId: string | null
  author: string
  rating: number
  content: string
  createdAt: string
}

export type Faq = {
  id: string
  category: string
  question: string
  answer: string
}
