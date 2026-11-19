import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import type { Course } from '../types'
import { formatPrice } from '../utils/format'

export default function CourseCard({ course }: { course: Course }) {
  return (
    <article className={`course-card course-tone-${course.id}`}>
      <div className="course-art" lang="zh">
        <span className="course-art-label" lang="vi">TRI HÀNH VIỆN · {course.level}</span><span>{course.art}</span><span className="course-art-caption" lang="vi">Mỗi bài học, một bước tiến.</span>
      </div>
      <div className="course-body">
        <div className="course-tags">
          <span className="level-tag">{course.level}</span>
          <span className="popular-tag">{course.badge}</span>
        </div>
        <h3>{course.title}</h3>
        <p>
          <Clock size={15} /> {course.sessions} buổi · {course.minutes} phút/buổi
        </p>
        <div className="course-bottom">
          <strong>{formatPrice(course.price)}đ</strong>
          <Link to={`/courses/${course.id}`} className="outline-button small" aria-label={`Xem chi tiết ${course.title}`}>
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  )
}
