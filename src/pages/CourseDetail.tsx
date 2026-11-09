import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Coins } from 'lucide-react'
import type { Course } from '../types'
import type { TeacherProfile } from '../types/teacher'
import { getCourse, getTeachersByIds } from '../services/api'
import TeacherResultCard from '../components/TeacherResultCard'
import { ErrorBlock, Loading } from '../components/common'
import { formatCoin, formatPrice } from '../utils/format'

export default function CourseDetail() {
  const { id = '' } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setError(false)
    getCourse(id, controller.signal)
      .then(async (data) => {
        setCourse(data)
        const found = await getTeachersByIds(data.teacherIds, controller.signal)
        setTeachers(data.teacherIds.map((teacherId) => found.find((teacher) => teacher.id === teacherId)!).filter(Boolean))
      })
      .catch(() => !controller.signal.aborted && setError(true))
    return () => controller.abort()
  }, [id, retry])

  if (error) return <div className="shell page-pad"><ErrorBlock onRetry={() => setRetry(retry + 1)} /></div>
  if (!course) return <div className="shell page-pad"><Loading /></div>
  const coin = course.price / 1000
  const hours = (course.sessions * course.minutes) / 60
  const scrollToTeachers = () => document.getElementById('course-teachers')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="shell page-pad">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Trang chủ</Link> / <Link to="/courses">Khoá học</Link> / <span>{course.title}</span>
      </nav>
      <section className="card course-hero">
        <div className="course-art" lang="zh">
          {course.art}
        </div>
        <div>
          <div className="course-tags">
            <span className="level-tag">{course.level}</span>
            <span className="popular-tag">{course.badge}</span>
            <span className="mode">Online 1:1</span>
          </div>
          <h1>{course.title}</h1>
          <p className="muted">{course.description}</p>
          <dl className="fact-row">
            <div><dt>Đầu vào</dt><dd>{course.entry}</dd></div>
            <div><dt>Đầu ra</dt><dd>{course.exit}</dd></div>
            <div><dt>Thời lượng</dt><dd>{course.sessions} buổi · {course.minutes} phút</dd></div>
            <div><dt>Tổng</dt><dd>{hours.toLocaleString('vi-VN')} giờ học</dd></div>
          </dl>
          <div className="course-price-row">
            <p className="profile-price">
              <strong>{formatPrice(course.price)}đ</strong> ≈ {formatCoin(coin)}
            </p>
            <button className="primary-link" onClick={scrollToTeachers}>
              <ChevronRight size={17} /> Chọn giáo viên và đặt lịch
            </button>
          </div>
        </div>
      </section>
      <div className="profile-layout">
        <section className="card section-card">
          <h2>Lộ trình {course.sessions} buổi</h2>
          <ol className="roadmap">
            {course.roadmap.map((step, index) => (
              <li key={step.label}>
                <span>{index + 1}</span>
                <div>
                  <small>{step.label}</small>
                  <p>{step.content}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <aside className="card section-card">
          <h2>Thông tin khoá học</h2>
          <dl className="detail-list">
            <div><dt>Số buổi</dt><dd>{course.sessions} buổi</dd></div>
            <div><dt>Thời lượng mỗi buổi</dt><dd>{course.minutes} phút</dd></div>
            <div><dt>Hình thức</dt><dd>Online 1:1 · Google Meet</dd></div>
            <div><dt>Học phí dự kiến</dt><dd>{formatPrice(course.price)}đ</dd></div>
            <div><dt>Quy đổi</dt><dd className="accent">{formatCoin(coin)}</dd></div>
          </dl>
          <p className="note boxed">
            <Coins size={14} /> Trừ coin theo từng buổi khi đặt lịch, không cần trả trước toàn bộ khoá.
          </p>
          <button className="primary-link block" onClick={scrollToTeachers}>
            Chọn giáo viên và đặt lịch
          </button>
        </aside>
      </div>
      <section id="course-teachers" className="content-section flush">
        <div className="section-heading small">
          <h2>Giáo viên phụ trách</h2>
          <span className="muted">Chọn một giáo viên để xem hồ sơ và đặt lịch</span>
        </div>
        <div className="teacher-rail static">
          {teachers.map((teacher) => (
            <TeacherResultCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </section>
    </div>
  )
}
