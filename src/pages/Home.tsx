import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Calendar, ChevronLeft, ChevronRight, CircleCheck, Coins, GraduationCap, MessageCircle, Sparkles, Star, Target, Video } from 'lucide-react'
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
      <section className="youth-hero">
        <div className="shell youth-hero-inner">
          <div className="youth-hero-copy">
            <p className="eyebrow hero-eyebrow"><Sparkles size={16} /> Một ngôn ngữ mới. Một thế giới mới.</p>
            <h1>Mỗi ngày một chút,<br /><span>tiếng Trung tiến xa.</span></h1>
            <p className="youth-hero-lead">Bắt đầu từ lời chào đầu tiên, tự tin hơn sau mỗi buổi học. Tìm người thầy phù hợp và học theo nhịp riêng của bạn.</p>
            <div className="youth-hero-actions">
              <Link className="primary-link" to="/teachers">Tìm giáo viên của bạn <ArrowRight size={18} /></Link>
              <Link className="youth-secondary" to="/courses"><BookOpen size={18} /> Khám phá khóa học</Link>
            </div>
            <div className="hero-reassurance"><CircleCheck size={16} /> Học 1:1 <span /> Chủ động lịch học <span /> Dễ dàng bắt đầu</div>
            <dl className="youth-stats">
              {HERO_STATS.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}
            </dl>
          </div>
          <div className="youth-hero-visual">
            <div className="hero-orbit" aria-hidden="true" />
            <span className="hero-doodle doodle-one" aria-hidden="true">✳</span>
            <span className="hero-doodle doodle-two" aria-hidden="true">✦</span>
            <div className="language-note" aria-hidden="true"><span>HÔM NAY, MÌNH HỌC...</span><strong lang="zh">你好！</strong><small>Nǐ hǎo · Xin chào</small></div>
            <Link className="lesson-preview" to={`/teachers/${teachers[0]?.id || 't1'}`} aria-label="Khám phá giáo viên và buổi học 1:1">
              <div className="lesson-preview-head"><span><i /> Không gian học 1:1</span><Video size={17} /></div>
              <div className="lesson-preview-photo"><img src={teachers[0]?.avatar || '/images/teachers/portrait-1.jpg'} alt="" fetchPriority="high" /><span className="lesson-photo-label"><MessageCircle size={14} /> Cứ tự tin nói nhé!</span></div>
              <div className="lesson-preview-info"><span><small>GẶP NGƯỜI ĐỒNG HÀNH</small><strong>{teachers[0]?.name || 'Giáo viên của bạn'}</strong></span><span className="lesson-arrow"><ArrowRight size={21} /></span></div>
            </Link>
            <div className="learning-note"><span className="learning-note-icon"><GraduationCap size={24} /></span><span><strong>Tiến bộ từng ngày</strong><small>Một buổi học, thêm một bước tiến.</small></span></div>
          </div>
        </div>
      </section>
      <section className="shell learning-paths" aria-labelledby="learning-paths-title">
        <div><p className="eyebrow">BẮT ĐẦU TỪ CHÍNH BẠN</p><h2 id="learning-paths-title">Bạn muốn học để…</h2></div>
        <Link to="/courses?level=hsk12" className="goal-card goal-peach"><span className="goal-icon"><BookOpen size={23} /></span><span><strong>Bắt đầu từ con số 0</strong><small>Xây nền tảng thật vững</small></span><ArrowRight size={19} /></Link>
        <Link to="/courses?goal=Giao%20ti%E1%BA%BFp" className="goal-card goal-mint"><span className="goal-icon"><MessageCircle size={23} /></span><span><strong>Tự tin giao tiếp</strong><small>Nói nhiều hơn mỗi ngày</small></span><ArrowRight size={19} /></Link>
        <Link to="/courses?goal=Luy%E1%BB%87n%20thi" className="goal-card goal-lilac"><span className="goal-icon"><Target size={23} /></span><span><strong>Chinh phục HSK</strong><small>Tiến gần mục tiêu của bạn</small></span><ArrowRight size={19} /></Link>
      </section>
      <section className="shell content-section featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">NGƯỜI THẦY HỢP VỚI BẠN</p><h2>Học cùng người truyền cảm hứng</h2>
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
            <p className="eyebrow">HỌC CÓ ĐỊNH HƯỚNG</p><h2>Mục tiêu của bạn, lộ trình của bạn</h2>
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
            <p className="eyebrow">NHẸ NHÀNG BẮT ĐẦU, BỀN BỈ TIẾN XA</p><h2>Học vui hơn. Tiến bộ mỗi ngày.</h2>
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
      <section className="shell home-journey" aria-labelledby="journey-title">
        <div className="section-heading"><div><p className="eyebrow">KHÔNG CẦN CHỜ ĐẾN “MỘT NGÀY NÀO ĐÓ”</p><h2 id="journey-title">Buổi học đầu tiên chỉ cách 3 bước</h2></div></div>
        <div className="journey-grid">
          <div><span>01</span><h3>Tìm người thầy hợp ý</h3><p>Khám phá hồ sơ, chuyên môn và đánh giá để chọn giáo viên phù hợp.</p></div>
          <div><span>02</span><h3>Chọn giờ bạn thấy thoải mái</h3><p>Xem khung giờ trống, chọn lịch và xác nhận học phí rõ ràng.</p></div>
          <div><span>03</span><h3>Bắt đầu hành trình mới</h3><p>Học 1:1 theo mục tiêu của bạn và tự tin hơn sau mỗi buổi học.</p></div>
        </div>
        <div className="home-cta"><div><p>Hành trình lớn bắt đầu từ một lời chào.</p><h2>Sẵn sàng nói “你好” với thế giới?</h2></div><Link to="/teachers" className="primary-link">Bắt đầu ngay hôm nay <ArrowRight size={18} /></Link><span aria-hidden="true">你好</span></div>
      </section>
    </>
  )
}
