import { Badge } from './Badge'
import { Button } from './Button'
import { Rating } from './Rating'

type TeacherCardProps = {
  name: string
  level: string
  pricePerHour: number
  rating: number
  description: string
}

export function TeacherCard({ name, level, pricePerHour, rating, description }: TeacherCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary-50 font-bold text-primary-700">
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="primary">{level}</Badge>
            <Rating value={rating} />
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">{description}</p>
      <div className="mt-5 flex items-center justify-between">
        <span className="font-semibold text-gray-900">{pricePerHour} coin/giờ</span>
        <Button size="sm">Xem hồ sơ</Button>
      </div>
    </article>
  )
}
