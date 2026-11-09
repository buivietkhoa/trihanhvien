import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, CircleCheck, Coins, Search, Star, UserRound, Video } from 'lucide-react'
import { getCourses, getTeachers } from '../services/api'
import type { TeacherProfile } from '../types/teacher'
import type { Course } from '../types'
import TeacherResultCard, { TeacherSkeleton } from '../components/TeacherResultCard'
import CourseCard from '../components/CourseCard'

// Số liệu nổi bật trên banner (theo Figma M04)
const HERO_STATS = [
  ['24+', 'giáo viên đang dạy'],
  ['4,7/5', 'điểm đánh giá trung bình'],
  ['6', 'khoá học theo lộ trình'],
]
// Nội dung khối Lợi ích theo Figma (M04 Desktop/Mobile)
const benefits = [
  {
    icon: Calendar,
    title: 'Tự chọn giờ học',
    text: 'Xem lịch trống của giáo viên và đặt buổi học chỉ trong vài bước.',
    short: 'Đặt buổi học theo lịch trống của giáo viên.',
  },
  {
    icon: Star,
    title: 'Đánh giá công khai',
    text: 'Điểm số và nhận xét thật từ học viên sau mỗi buổi học.',
    short: 'Nhận xét thật từ học viên sau mỗi buổi.',
  },
  {
    icon: Coins,
    title: 'Thanh toán bằng ví coin',
    text: 'Nạp coin một lần, trừ theo từng buổi, huỷ sớm được hoàn coin.',
    short: 'Trừ coin theo buổi, huỷ sớm được hoàn.',
  },
  {
    icon: CircleCheck,
    title: 'Giao diện tiếng Việt',
    text: 'Mọi thao tác bằng tiếng Việt, dễ dùng với người mới bắt đầu.',
    short: 'Dễ dùng với người mới bắt đầu.',
  },
]
export default function Home() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const rail = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })
  // Nút cuộn chỉ bật khi còn thẻ bị khuất ở phía tương ứng
  const updateEdges = () => {
    const el = rail.current
    if (el) setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 })
  }
  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)
    return () => window.removeEventListener('resize', updateEdges)
  }, [teachers])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    Promise.all([
      getTeachers({ featured: 'true', sort: 'featured' }, controller.signal),
      getCourses(controller.signal),
    ])
      .then(([result, data]) => {
        setTeachers(result.data)
        setCourses([...data].sort((a, b) => a.id.localeCompare(b.id)).slice(0, 3))
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [retry])
  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <div className="hero-content">
            <p className="hero-badge">
              <i aria-hidden="true" />
              <span className="desktop-copy">Nền tảng học tiếng Trung 1:1 trực tuyến</span>
              <span className="mobile-copy">Học tiếng Trung 1:1 trực tuyến</span>
            </p>
            <h1>Học tiếng Trung 1:1 với giáo viên phù hợp nhất với bạn</h1>
            <p className="hero-lead">
              Kết nối với giáo viên bản ngữ và giáo viên Việt Nam giàu kinh nghiệm. Tự chọn lịch học, thanh toán bằng ví coin
              <span className="desktop-copy"> và học trực tuyến ngay trên trình duyệt</span>.
            </p>
            <div className="hero-actions">
              <Link className="primary-link" to="/teachers">
                <Search size={18} /> Tìm giáo viên
              </Link>
              <Link className="hero-secondary" to="/courses">
                Xem khoá học
              </Link>
            </div>
            <dl className="hero-stats">
              {HERO_STATS.map(([value, label]) => (
                <div key={label}>
                  <dt>{value}</dt>
                  <dd>{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="hero-art">
            <Link to="/teachers/t1" className="hero-card" aria-label="Xem hồ sơ Vương Tuấn Kiệt">
              <span className="hero-status desktop-copy">
                <i aria-hidden="true" /> Đang học trực tuyến
              </span>
              <span className="hero-photo" aria-hidden="true">
                <UserRound size={44} strokeWidth={1.5} />
              </span>
              <span className="hero-card-info">
                <span>
                  <strong className="mobile-copy accent" lang="zh">
                    你好！ <span lang="vi">Xin chào!</span>
                  </strong>
                  <strong className="desktop-copy">Vương Tuấn Kiệt</strong>
                  <small>
                    <span className="desktop-copy">HSK 6 · Tiếng Trung thương mại</span>
                    <span className="mobile-copy">Vương Tuấn Kiệt · HSK 6</span>
                  </small>
                </span>
                <span className="hero-call" aria-hidden="true">
                  <Video size={20} />
                </span>
              </span>
            </Link>
            <div className="hero-bubble desktop-copy" aria-hidden="true">
              <strong lang="zh">你好！</strong>
              <small>Nǐ hǎo! — Xin chào!</small>
            </div>
            <div className="hero-next desktop-copy" aria-hidden="true">
              <span>
                <Calendar size={18} />
              </span>
              <span>
                <small>Buổi học tiếp theo</small>
                <strong>19:30 · Thứ Năm</strong>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="shell content-section featured-section">
        <div className="section-heading">
          <div>
            <h2>Giáo viên nổi bật</h2>
            <p className="section-sub">Được học viên đánh giá cao nhất trong tháng</p>
          </div>
          <div className="heading-actions">
            <Link className="text-link plain" to="/teachers">
              Xem tất cả
            </Link>
            <div className="rail-controls">
              <button
                title="Giáo viên trước"
                aria-label="Giáo viên trước"
                className="icon-button round"
                disabled={edges.start}
                onClick={() =>
                  rail.current?.scrollBy({
                    left: -(rail.current.clientWidth + 24),
                    behavior: 'smooth',
                  })
                }
              >
                <ChevronLeft size={18} />
              </button>
              <button
                title="Giáo viên tiếp theo"
                aria-label="Giáo viên tiếp theo"
                className="icon-button round"
                disabled={edges.end}
                onClick={() =>
                  rail.current?.scrollBy({
                    left: rail.current.clientWidth + 24,
                    behavior: 'smooth',
                  })
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        {error ? (
          <div className="error-state" role="alert">
            Không thể kết nối dữ liệu.{' '}
            <button onClick={() => setRetry(retry + 1)}>Thử lại</button>
          </div>
        ) : (
          <div ref={rail} className="teacher-rail" aria-busy={loading} onScroll={updateEdges}>
            {loading
              ? Array.from({ length: 4 }, (_, i) => <TeacherSkeleton key={i} />)
              : teachers.map((teacher) => (
                  <TeacherResultCard key={teacher.id} teacher={teacher} />
                ))}
          </div>
        )}
      </section>
      <section
        id="featured-courses"
        className="shell content-section course-section"
      >
        <div className="section-heading">
          <div>
            <h2>Khóa học tiêu biểu</h2>
            <p className="section-sub">Lộ trình rõ ràng cho từng mục tiêu học tập</p>
          </div>
          <Link className="text-link plain" to="/courses">
            Xem tất cả
          </Link>
        </div>
        <div className="course-grid">
          {loading
            ? Array.from({ length: 3 }, (_, i) => (
                <div className="course-card skeleton" key={i}>
                  <div className="course-art" />
                  <div className="course-body">Đang tải khóa học…</div>
                </div>
              ))
            : courses.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>
      <section className="benefits-band">
        <div className="shell content-section benefits-section">
          <div className="benefits-heading">
            <h2>Vì sao chọn MandarinConnect?</h2>
            <p className="desktop-copy">Học tiếng Trung 1:1 thuận tiện, minh bạch và phù hợp với người Việt</p>
          </div>
          <div className="benefit-grid">
            {benefits.map(({ icon: Icon, title, text, short }) => (
              <div key={title}>
                <span className="benefit-icon">
                  <Icon size={22} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>
                    <span className="desktop-copy">{text}</span>
                    <span className="mobile-copy">{short}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
