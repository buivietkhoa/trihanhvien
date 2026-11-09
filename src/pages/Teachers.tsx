import { useEffect, useId, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Funnel,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  Users,
} from 'lucide-react'
import { getTeachers } from '../services/api'
import type { TeacherProfile } from '../types/teacher'
import TeacherResultCard, {
  formatPrice,
  TeacherSkeleton,
} from '../components/TeacherResultCard'

type Filters = {
  hsk: string
  maxPrice: string
  mode: string
  minRating: string
}
const emptyFilters: Filters = {
  hsk: '',
  maxPrice: '',
  mode: '',
  minRating: '',
}

const MODES = [
  ['online', 'Online'],
  ['offline', 'Offline'],
  ['hybrid', 'Kết hợp'],
] as const
// Desktop: danh sách có icon sao; ngăn kéo mobile: chip ngắn (theo Figma M05)
const RATINGS = [
  ['4.8', '4.8 sao trở lên', '4.8+'],
  ['4.5', '4.5 sao trở lên', '4.5+'],
  ['4', '4.0 sao trở lên', '4.0+'],
  ['', 'Tất cả', 'Tất cả'],
] as const

function FilterFields({
  values,
  onChange,
  compact = false,
}: {
  values: Filters
  onChange: (key: keyof Filters, value: string) => void
  compact?: boolean
}) {
  const id = useId()
  const ratings = compact ? [RATINGS[3], RATINGS[2], RATINGS[1], RATINGS[0]] : RATINGS
  return (
    <div className={compact ? 'filter-fields compact' : 'filter-fields'}>
      <fieldset>
        <legend>Trình độ HSK</legend>
        <div className="hsk-options">
          {['1', '2', '3', '4', '5', '6'].map((value) => (
            <button
              key={value}
              type="button"
              className={values.hsk === value ? 'hsk-chip is-active' : 'hsk-chip'}
              aria-pressed={values.hsk === value}
              aria-label={`HSK ${value}`}
              onClick={() => onChange('hsk', values.hsk === value ? '' : value)}
            >
              {compact ? value : `HSK ${value}`}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="filter-group">
        <label className="filter-row" htmlFor={`${id}-max-price`}>
          <span>Học phí tối đa</span>
          <em>{values.maxPrice ? `≤ ${formatPrice(Number(values.maxPrice))}đ` : 'Không giới hạn'}</em>
        </label>
        <input
          id={`${id}-max-price`}
          type="range"
          min="50000"
          max="500000"
          step="10000"
          value={values.maxPrice || '500000'}
          onChange={(event) => onChange('maxPrice', event.target.value === '500000' ? '' : event.target.value)}
        />
        {!compact && (
          <div className="range-labels">
            <span>50.000đ</span>
            <span>500.000đ</span>
          </div>
        )}
      </div>
      <fieldset className="mode-options">
        <legend>Hình thức học</legend>
        <div>
          {MODES.map(([value, label]) => (
            <label key={value}>
              <input
                type="checkbox"
                checked={values.mode.split(',').includes(value)}
                onChange={(event) => {
                  const selected = values.mode.split(',').filter(Boolean)
                  onChange('mode', (event.target.checked ? [...selected, value] : selected.filter((mode) => mode !== value)).join(','))
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="rating-options">
        <legend>Đánh giá tối thiểu</legend>
        <div>
          {ratings.map(([value, label, short]) =>
            compact ? (
              <button
                key={label}
                type="button"
                className={values.minRating === value ? 'chip is-picked' : 'chip'}
                aria-pressed={values.minRating === value}
                onClick={() => onChange('minRating', value)}
              >
                {short}
              </button>
            ) : (
              <label key={label}>
                <input type="radio" name={`${id}-rating`} checked={values.minRating === value} onChange={() => onChange('minRating', value)} />
                {value && <Star size={16} fill="currentColor" className="rating-star" />}
                <span>{label}</span>
              </label>
            ),
          )}
        </div>
      </fieldset>
    </div>
  )
}

export default function Teachers() {
  const [params, setParams] = useSearchParams()
  const query = params.toString()
  const q = params.get('q') || ''
  const page = Math.max(1, Math.floor(Number(params.get('page')) || 1))
  const filters: Filters = {
    hsk: params.get('hsk') || '',
    maxPrice: params.get('maxPrice') || '',
    mode: params.get('mode') || '',
    minRating: params.get('minRating') || '',
  }
  const [search, setSearch] = useState(q)
  const [result, setResult] = useState<{
    data: TeacherProfile[]
    total: number
  }>({ data: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [draft, setDraft] = useState<Filters>(emptyFilters)
  // Tổng số giáo viên (không lọc) cho dòng giới thiệu "24 giáo viên ... đang nhận học viên"
  const [allCount, setAllCount] = useState<number | null>(null)
  useEffect(() => {
    getTeachers({ limit: '1' })
      .then((data) => setAllCount(data.total))
      .catch(() => {})
  }, [])
  const [mobile, setMobile] = useState(
    () => window.matchMedia('(max-width: 767px)').matches,
  )
  const drawer = useRef<HTMLDialogElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const change = () => setMobile(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    setSearch(q)
    clearTimeout(timer.current)
  }, [q])
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    const parsed = Object.fromEntries(new URLSearchParams(query))
    getTeachers(
      {
        ...parsed,
        page: mobile ? '1' : String(page),
        limit: mobile ? String(page * 9) : '9',
      },
      controller.signal,
    )
      .then((data) => {
        const lastPage = Math.max(1, Math.ceil(data.total / 9))
        if (page > lastPage) {
          setParams(
            (previous) => {
              const next = new URLSearchParams(previous)
              next.set('page', String(lastPage))
              return next
            },
            { replace: true },
          )
          return
        }
        setResult(data)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [query, retry, mobile, page, setParams])
  function update(key: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      value ? next.set(key, value) : next.delete(key)
      next.delete('page')
      return next
    })
  }
  function reset() {
    clearTimeout(timer.current)
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      Object.keys(emptyFilters).forEach((key) => next.delete(key))
      next.delete('page')
      return next
    })
  }
  function goPage(value: number) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      next.set('page', String(value))
      return next
    })
    if (!mobile) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const pages = Math.ceil(result.total / 9)
  const activeCount = Object.values(filters).filter(Boolean).length
  return (
    <div className="shell teachers-page">
      <nav className="breadcrumb desktop-only" aria-label="Breadcrumb">
        <Link to="/">Trang chủ</Link> / <span>Giáo viên</span>
      </nav>
      <h1>
        <span className="desktop-copy">Tìm giáo viên phù hợp với bạn</span>
        <span className="mobile-copy">Tìm giáo viên phù hợp</span>
      </h1>
      <p className="page-intro">
        {allCount ?? 24}
        <span className="desktop-copy"> giáo viên bản ngữ và giáo viên Việt Nam đang nhận học viên</span>
        <span className="mobile-copy"> giáo viên đang nhận học viên</span>
      </p>
      <div className="teachers-layout">
        <aside className="desktop-filters">
          <div className="filter-heading">
            <h2>Bộ lọc</h2>
            <button className="reset-link" onClick={reset}>
              Xoá bộ lọc
            </button>
          </div>
          <FilterFields values={filters} onChange={update} />
        </aside>
        <section className="results-section" aria-label="Kết quả tìm kiếm">
          <div className="list-controls">
            <div className="list-search">
              <Search size={20} />
              <input
                aria-label="Tìm theo tên hoặc chủ đề"
                placeholder={mobile ? 'Tên giáo viên hoặc chủ đề…' : 'Tìm theo tên giáo viên hoặc chủ đề học…'}
                value={search}
                onChange={(event) => {
                  const value = event.target.value
                  setSearch(value)
                  clearTimeout(timer.current)
                  timer.current = setTimeout(
                    () => update('q', value.trim()),
                    400,
                  )
                }}
              />
              {search && (
                <button
                  className="icon-button"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => {
                    clearTimeout(timer.current)
                    setSearch('')
                    update('q', '')
                  }}
                >
                  <X size={17} />
                </button>
              )}
            </div>
            <div className="control-row">
              <button
                className="filter-toggle"
                onClick={() => {
                  setDraft(filters)
                  drawer.current?.showModal()
                }}
              >
                <Funnel size={18} /> Bộ lọc
                {activeCount > 0 && ` (${activeCount})`}
              </button>
              <select
                className="list-sort"
                aria-label="Sắp xếp giáo viên"
                value={params.get('sort') || 'rating'}
                onChange={(event) => update('sort', event.target.value)}
              >
                {[
                  ['rating', 'Đánh giá cao nhất'],
                  ['price-asc', 'Học phí tăng dần'],
                  ['price-desc', 'Học phí giảm dần'],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {mobile ? label : `Sắp xếp: ${label}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="results-toolbar">
            <p aria-live="polite">
              {loading ? (
                'Đang tìm giáo viên…'
              ) : error ? (
                'Chưa tải được dữ liệu'
              ) : (
                <>
                  Tìm thấy <strong>{result.total}</strong> giáo viên
                </>
              )}
            </p>
            {!loading && !error && pages > 0 && !mobile && (
              <span className="page-count">
                Trang {page}/{pages}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <div className="active-filters">
              {Object.entries(filters)
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <button key={key} onClick={() => update(key, '')}>
                    {key === 'hsk'
                      ? `HSK ${value}`
                      : key === 'maxPrice'
                        ? `≤ ${formatPrice(Number(value))} ₫`
                        : key === 'minRating'
                          ? `≥ ${value} sao`
                          : value
                              .split(',')
                              .map((mode) =>
                                mode === 'hybrid'
                                  ? 'Kết hợp'
                                  : mode === 'online'
                                    ? 'Online'
                                    : 'Offline',
                              )
                              .join(', ')}
                    <X size={13} />
                  </button>
                ))}
            </div>
          )}
          {loading ? (
            <div
              className="teachers-grid"
              role="status"
              aria-label="Đang tải giáo viên"
            >
              {Array.from({ length: 9 }, (_, i) => (
                <TeacherSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="empty-state" role="alert">
              <h2>Không thể tải danh sách giáo viên</h2>
              <p>Vui lòng kiểm tra kết nối tới máy chủ dữ liệu.</p>
              <button
                className="primary-link"
                onClick={() => setRetry(retry + 1)}
              >
                Thử lại <RotateCcw size={16} />
              </button>
            </div>
          ) : result.total === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h2>Không tìm thấy giáo viên phù hợp</h2>
              <p>Thử từ khóa khác hoặc mở rộng điều kiện tìm kiếm.</p>
              <button
                className="primary-link"
                onClick={() => {
                  clearTimeout(timer.current)
                  setSearch('')
                  setParams({})
                }}
              >
                Xóa bộ lọc <RotateCcw size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="teachers-grid">
                {result.data.map((teacher) => (
                  <TeacherResultCard key={teacher.id} teacher={teacher} />
                ))}
              </div>
              {pages > 1 && (
                <nav className="pagination" aria-label="Phân trang giáo viên">
                  <button
                    className="icon-button"
                    disabled={page === 1}
                    aria-label="Trang trước"
                    onClick={() => goPage(page - 1)}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  {Array.from({ length: pages }, (_, i) => (
                    <button
                      key={i}
                      aria-current={page === i + 1 ? 'page' : undefined}
                      onClick={() => goPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="icon-button"
                    disabled={page >= pages}
                    aria-label="Trang sau"
                    onClick={() => goPage(page + 1)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </nav>
              )}
              {mobile && page < pages && (
                <button className="load-more" onClick={() => goPage(page + 1)}>
                  Xem thêm giáo viên <ChevronRight size={17} />
                </button>
              )}
            </>
          )}
        </section>
      </div>
      <dialog
        ref={drawer}
        className="filter-drawer"
        aria-labelledby="drawer-title"
      >
        <span className="sheet-handle" aria-hidden="true" />
        <div className="filter-heading">
          <h2 id="drawer-title">Bộ lọc</h2>
          <button
            className="icon-button plain"
            aria-label="Đóng bộ lọc"
            onClick={() => drawer.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        {mobile && (
          <FilterFields
            values={draft}
            compact
            onChange={(key, value) =>
              setDraft((previous) => ({ ...previous, [key]: value }))
            }
          />
        )}
        <div className="drawer-actions">
          <button className="outline-button" onClick={() => setDraft(emptyFilters)}>
            Xoá bộ lọc
          </button>
          <button
            className="primary-link"
            onClick={() => {
              setParams((previous) => {
                const next = new URLSearchParams(previous)
                Object.entries(draft).forEach(([key, value]) =>
                  value ? next.set(key, value) : next.delete(key),
                )
                next.delete('page')
                return next
              })
              drawer.current?.close()
            }}
          >
            Áp dụng
          </button>
        </div>
      </dialog>
    </div>
  )
}
