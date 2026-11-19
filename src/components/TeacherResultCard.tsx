import { Link } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import type { TeacherProfile } from '../types/teacher'
import { formatPrice, modeLabels } from '../utils/format'
import { Stars } from './common'

export { formatPrice, modeLabels }

export default function TeacherResultCard({ teacher }: { teacher: TeacherProfile }) {
  return (
    <article className="teacher-card">
      <div className="teacher-avatar-placeholder" aria-hidden="true">
        <UserRound size={36} strokeWidth={1.8} />
        {teacher.avatar && (
          <img
            src={teacher.avatar}
            alt=""
            loading="lazy"
            onError={(event) => { event.currentTarget.style.display = 'none' }}
          />
        )}
      </div>
      <div className="teacher-body">
        <div className="teacher-title">
          <h3>{teacher.name}</h3>
        </div>
        <div className="teacher-tags">
          <span className="level-tag">HSK {teacher.hsk}</span>
          <span className="mode">{modeLabels[teacher.mode]}</span>
        </div>
        <div className="reviews">
          <Stars value={teacher.rating} />
          <strong>{teacher.rating.toFixed(1)}</strong>
          <span>({teacher.reviews} đánh giá)</span>
        </div>
        <p className="teacher-topics">{teacher.topics}</p>
        <div className="teacher-bottom">
          <div>
            <strong>{formatPrice(teacher.price)}đ</strong>
            <small> / giờ</small>
          </div>
          <Link className="outline-button block" to={`/teachers/${teacher.id}`} aria-label={`Xem hồ sơ ${teacher.name}`}>
            Xem hồ sơ
          </Link>
        </div>
      </div>
    </article>
  )
}
export function TeacherSkeleton() {
  return (
    <div className="teacher-card skeleton" aria-hidden="true">
      <div className="teacher-avatar-placeholder" />
      <div className="teacher-body">
        <div />
        <div />
        <div />
      </div>
    </div>
  )
}
