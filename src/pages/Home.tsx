import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Coins,
  Star,
  Video,
} from 'lucide-react'
import { getCourses, getTeachers } from '../services/api'
import type { TeacherProfile } from '../types/teacher'
import type { Course } from '../types'
import TeacherResultCard, { TeacherSkeleton } from '../components/TeacherResultCard'
import CourseCard from '../components/CourseCard'
import CountUp from '../components/CountUp'
import { formatPrice } from '../utils/format'

// Số liệu nổi bật (theo Figma M04)
const STATS = [
  ['24+', 'Giáo viên đang dạy'],
  ['4,7/5', 'Điểm đánh giá trung bình'],
  ['6', 'Khoá học theo lộ trình'],
  ['1:1', 'Học riêng cùng giáo viên'],
]
const GOALS = [
  { to: '/courses?level=hsk12', han: '入门', title: 'Bắt đầu từ con số 0', text: 'Phát âm, pinyin và 300 từ đầu tiên.' },
  { to: '/courses?goal=Giao%20ti%E1%BA%BFp', han: '会话', title: 'Tự tin giao tiếp', text: 'Nói nhiều hơn trong mỗi buổi học.' },
  { to: '/courses?goal=Luy%E1%BB%87n%20thi', han: '考试', title: 'Chinh phục HSK', text: 'Lộ trình luyện đề theo từng cấp.' },
]
const BENEFITS = [
  { icon: Calendar, title: 'Tự chọn giờ học', text: 'Xem lịch trống của giáo viên và đặt buổi học chỉ trong vài bước.' },
  { icon: Star, title: 'Đánh giá công khai', text: 'Điểm số và nhận xét thật từ học viên sau mỗi buổi học.' },
  { icon: Coins, title: 'Thanh toán bằng ví coin', text: 'Nạp coin một lần, trừ theo từng buổi, huỷ sớm được hoàn coin.' },
  { icon: CircleCheck, title: 'Giao diện tiếng Việt', text: 'Mọi thao tác bằng tiếng Việt, dễ dùng với người mới bắt đầu.' },
]
const STEPS = [
  ['Tìm người thầy hợp ý', 'Khám phá hồ sơ, chuyên môn và đánh giá để chọn giáo viên phù hợp.'],
  ['Chọn giờ bạn thấy thoải mái', 'Xem khung giờ trống, chọn lịch và xác nhận học phí rõ ràng.'],
  ['Bắt đầu hành trình mới', 'Học 1:1 theo mục tiêu của bạn và tự tin hơn sau mỗi buổi học.'],
]
// Lịch minh hoạ trong thẻ đặt lịch ở banner
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const SLOTS = ['08:00', '10:00', '14:00', '19:00', '20:30', '21:00']
const FALLBACK_AVATARS = [1, 2, 3, 4, 5, 6].map((i) => `/images/teachers/portrait-${i}.jpg`)
// Dải thẻ chạy ngang đầu trang: ảnh giáo viên xen kẽ thẻ chữ Hán
const TILES = [
  ['你好', 'Xin chào'],
  ['学习', 'Học tập'],
  ['中文', 'Tiếng Trung'],
  ['加油', 'Cố lên'],
  ['朋友', 'Bạn bè'],
  ['梦想', 'Ước mơ'],
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

  const lead = teachers[0]
  const avatars = FALLBACK_AVATARS.map((src, i) => teachers[i]?.avatar || src)
  const scrollRail = (direction: 1 | -1) =>
    rail.current?.scrollBy({ left: direction * (rail.current.clientWidth + 24), behavior: 'smooth' })

  return (
    <>
      {/* ---------- Banner ---------- */}
      <section className="mx-hero">
        <div className="mx-strip" aria-hidden="true">
          <div className="mx-strip-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="mx-strip-set">
                {TILES.map(([han, vi], i) => (
                  <div key={han} className="mx-strip-pair">
                    <img src={avatars[i]} alt="" loading="lazy" />
                    <span className={`mx-tile tone-${i % 4}`}>
                      <strong lang="zh">{han}</strong>
                      <small>{vi}</small>
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="shell mx-hero-inner">
          <div className="mx-hero-copy">
            <Link to="/teachers" className="mx-badge">
              <span className="mx-badge-dot" /> Giáo viên đang nhận học viên mới
              <ArrowRight size={14} />
            </Link>
            <h1>
              Học tiếng Trung <span className="mx-nowrap">1 kèm 1,</span>
              <br />
              <span className="mx-accent">đúng nhịp của bạn.</span>
            </h1>
            <p className="mx-lead">
              Chọn giáo viên bản ngữ hoặc giáo viên Việt Nam, đặt lịch theo giờ trống và học theo mục tiêu riêng — từ lời
              chào đầu tiên đến chứng chỉ HSK.
            </p>
            <div className="mx-actions">
              <Link className="primary-link mx-cta" to="/teachers">
                Tìm giáo viên <ArrowRight size={18} />
              </Link>
              <Link className="mx-ghost" to="/courses">
                Xem khoá học
              </Link>
            </div>
            <div className="mx-proof">
              <div className="mx-avatars" aria-hidden="true">
                {avatars.slice(0, 3).map((src) => (
                  <img key={src} src={src} alt="" />
                ))}
              </div>
              <div>
                <span className="mx-stars" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </span>
                <small>4,7/5 từ học viên sau mỗi buổi học</small>
              </div>
            </div>
          </div>

          {/* Thẻ minh hoạ: đặt lịch với giáo viên */}
          <div className="mx-hero-visual">
            <Link to={`/teachers/${lead?.id || 't1'}`} className="mx-booking" aria-label="Xem hồ sơ và lịch trống của giáo viên">
              <div className="mx-booking-head">
                <img src={avatars[0]} alt="" />
                <div>
                  <strong>{lead?.name || 'Giáo viên của bạn'}</strong>
                  <small>
                    <Star size={12} fill="currentColor" /> {lead ? lead.rating.toFixed(1) : '4.9'} · HSK {lead?.hsk ?? 6} ·
                    Online
                  </small>
                </div>
                <span className="mx-live">
                  <i /> Có lịch trống
                </span>
              </div>
              <div className="mx-booking-body">
                <p>Lịch trống tuần này</p>
                <div className="mx-days">
                  {DAYS.map((day, i) => (
                    <span key={day} className={i === 2 ? 'is-on' : ''}>
                      {day}
                      <b>{18 + i}</b>
                    </span>
                  ))}
                </div>
                <div className="mx-slots">
                  {SLOTS.map((slot, i) => (
                    <span key={slot} className={i === 3 ? 'is-on' : i === 1 ? 'is-off' : ''}>
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mx-booking-foot">
                <div>
                  <small>Học phí</small>
                  <strong>{formatPrice(lead?.price ?? 280000)}đ</strong>
                  <small> / giờ</small>
                </div>
                <span className="mx-book-btn">
                  Đặt lịch <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
            <div className="mx-float mx-float-word" aria-hidden="true">
              <strong lang="zh">你好</strong>
              <span>
                nǐ hǎo
                <small>Xin chào</small>
              </span>
            </div>
            <div className="mx-float mx-float-call" aria-hidden="true">
              <span>
                <Video size={16} />
              </span>
              <div>
                <strong>Buổi học bắt đầu</strong>
                <small>19:00 · Google Meet</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Số liệu ---------- */}
      <section className="shell mx-stats" aria-label="Số liệu nổi bật">
        {STATS.map(([value, label]) => (
          <div key={label}>
            <strong>
              <CountUp value={value} />
            </strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      {/* ---------- Mục tiêu ---------- */}
      <section className="shell mx-section" aria-labelledby="goals-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Bắt đầu từ chính bạn</p>
            <h2 id="goals-title">Bạn muốn học để…</h2>
          </div>
        </div>
        <div className="mx-goals">
          {GOALS.map(({ to, han, title, text }) => (
            <Link key={title} to={to} className="goal-card">
              <span className="goal-icon goal-han" lang="zh" aria-hidden="true">
                {han}
              </span>
              <strong>{title}</strong>
              <small>{text}</small>
              <span className="goal-more">
                Xem lộ trình <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Giáo viên ---------- */}
      <section className="shell mx-section featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Giáo viên nổi bật</p>
            <h2>Học cùng người truyền cảm hứng</h2>
            <p className="section-sub">Chọn một người đồng hành, bắt đầu hành trình của riêng bạn.</p>
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
                onClick={() => scrollRail(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                title="Giáo viên tiếp theo"
                aria-label="Giáo viên tiếp theo"
                className="icon-button round"
                disabled={edges.end}
                onClick={() => scrollRail(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        {error ? (
          <div className="error-state" role="alert">
            Không thể kết nối dữ liệu. <button onClick={() => setRetry(retry + 1)}>Thử lại</button>
          </div>
        ) : (
          <div ref={rail} className="teacher-rail" aria-busy={loading} onScroll={updateEdges}>
            {loading
              ? Array.from({ length: 4 }, (_, i) => <TeacherSkeleton key={i} />)
              : teachers.map((teacher) => <TeacherResultCard key={teacher.id} teacher={teacher} />)}
          </div>
        )}
      </section>

      {/* ---------- Khoá học ---------- */}
      <section id="featured-courses" className="shell mx-section course-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Khoá học theo lộ trình</p>
            <h2>Mục tiêu của bạn, lộ trình của bạn</h2>
            <p className="section-sub">Lộ trình rõ ràng cho từng mục tiêu học tập.</p>
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

      {/* ---------- Lợi ích ---------- */}
      <section className="mx-band">
        <div className="shell mx-benefits">
          <div className="mx-benefits-head">
            <p className="eyebrow">Vì sao chọn Tri Hành Viện</p>
            <h2>Học vui hơn. Tiến bộ mỗi ngày.</h2>
            <p>Học tiếng Trung 1:1 thuận tiện, minh bạch và phù hợp với người Việt.</p>
            <Link to="/faq" className="text-link plain">
              Câu hỏi thường gặp <ArrowRight size={16} />
            </Link>
          </div>
          <div className="benefit-grid">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <span className="benefit-icon">
                  <Icon size={20} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 3 bước ---------- */}
      <section className="shell mx-section mx-steps-section" aria-labelledby="journey-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Bắt đầu thật đơn giản</p>
            <h2 id="journey-title">Buổi học đầu tiên chỉ cách 3 bước</h2>
          </div>
        </div>
        <ol className="journey-grid">
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <span>
                <span className="step-han" lang="zh" aria-hidden="true">
                  {['一', '二', '三'][i]}
                </span>
                <span className="step-no">Bước {i + 1}</span>
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="home-cta">
          <span className="home-cta-han" lang="zh" aria-hidden="true">
            加油
          </span>
          <div>
            <p>Hành trình lớn bắt đầu từ một lời chào.</p>
            <h2>
              Sẵn sàng nói “<span lang="zh">你好</span>” với <span className="mx-nowrap">thế giới?</span>
            </h2>
          </div>
          <div className="home-cta-actions">
            <Link to="/teachers" className="primary-link">
              Bắt đầu ngay hôm nay <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="mx-ghost on-dark">
              Tạo tài khoản
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
