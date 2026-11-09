export type TeacherProfile = {
  id: string
  name: string
  avatar: string
  hsk: number
  price: number
  mode: 'online' | 'offline' | 'hybrid'
  rating: number
  reviews: number
  featured: boolean
  featuredOrder?: number
  bio: string
  topics: string
  intro: string[]
  certificates: string[]
  experience: { period: string; title: string; description: string }[]
  ratingBreakdown: number[]
}
export type TeacherQuery = {
  q?: string
  hsk?: string
  mode?: string
  minRating?: string
  maxPrice?: string
  sort?: string
  page?: string
  featured?: string
  limit?: string
}
