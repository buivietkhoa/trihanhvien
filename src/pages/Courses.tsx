import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import type { Course } from '../types'
import { getCourses } from '../services/api'
import CourseCard from '../components/CourseCard'
import { EmptyBlock, ErrorBlock, Loading } from '../components/common'

const LEVELS = [
  ['', 'Tất cả'],
  ['hsk12', 'HSK 1–2'],
  ['hsk34', 'HSK 3–4'],
  ['hsk56', 'HSK 5–6'],
]
const GOALS = ['', 'Giao tiếp', 'Luyện thi', 'Thương mại']
const SORTS: Record<string, [string, (a: Course, b: Course) => number]> = {
  popular: ['Phổ biến nhất', (a, b) => a.popularity - b.popularity],
  'price-asc': ['Học phí tăng dần', (a, b) => a.price - b.price],
  'price-desc': ['Học phí giảm dần', (a, b) => b.price - a.price],
}

export default function Courses() {
  const [params, setParams] = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const level = params.get('level') || ''
  const goal = params.get('goal') || ''
  const sort = SORTS[params.get('sort') || ''] ? params.get('sort')! : 'popular'

  useEffect(() => {
    const controller = new AbortController()
    setError(false)
    getCourses(controller.signal)
      .then(setCourses)
      .catch(() => !controller.signal.aborted && setError(true))
      .finally(() => !controller.signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [retry])

  // 6 khoá học nên lọc và sắp xếp ngay trên trình duyệt; bộ lọc lưu trên URL giống trang Giáo viên.
  const update = (key: string, value: string) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      value ? next.set(key, value) : next.delete(key)
      return next
    })
  const list = courses
    .filter((course) => (!level || course.levelGroup === level) && (!goal || course.goal === goal))
    .sort(SORTS[sort][1])

  return (
    <div className="shell page-pad">
      <header className="page-title">
        <h1>Khoá học</h1>
        <p>Học theo lộ trình có sẵn, vẫn tự chọn giáo viên phù hợp với bạn</p>
      </header>
      <div className="card chip-filters">
        <div>
          <span>Trình độ</span>
          <div className="chips">
            {LEVELS.map(([value, label]) => (
              <button key={label} className={level === value ? 'chip is-active' : 'chip'} aria-pressed={level === value} onClick={() => update('level', value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span>Mục tiêu</span>
          <div className="chips">
            {GOALS.map((value) => (
              <button key={value || 'all'} className={goal === value ? 'chip is-active' : 'chip'} aria-pressed={goal === value} onClick={() => update('goal', value)}>
                {value || 'Tất cả'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="list-toolbar">
        <span className="muted" aria-live="polite">{loading ? 'Đang tải…' : `${list.length} khoá học`}</span>
        <select aria-label="Sắp xếp khoá học" value={sort} onChange={(event) => update('sort', event.target.value === 'popular' ? '' : event.target.value)}>
          {Object.entries(SORTS).map(([value, [label]]) => (
            <option key={value} value={value}>
              Sắp xếp: {label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <ErrorBlock onRetry={() => setRetry(retry + 1)} />
      ) : loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <div className="card">
          <EmptyBlock icon={<BookOpen size={30} />} title="Chưa có khoá học phù hợp" message="Thử bỏ bớt điều kiện lọc hoặc tìm giáo viên để học theo lộ trình riêng.">
            <button className="outline-button" onClick={() => setParams({})}>
              Xoá bộ lọc
            </button>
          </EmptyBlock>
        </div>
      ) : (
        <div className="course-grid page-grid">
          {list.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
