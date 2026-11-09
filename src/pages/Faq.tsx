import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import type { Faq as FaqItem } from '../types'
import { getFaqs } from '../services/api'
import { EmptyBlock, ErrorBlock, Loading } from '../components/common'

const CATEGORIES = ['Ví coin', 'Đặt lịch', 'Buổi học', 'Tài khoản']
// Thứ tự chip lọc theo Figma M17
const CHIP_ORDER = ['Tài khoản', 'Đặt lịch', 'Ví coin', 'Buổi học']
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')

export default function Faq() {
  const [params, setParams] = useSearchParams()
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string[]>(['f1', 'f3'])
  const category = CATEGORIES.includes(params.get('category') || '') ? params.get('category')! : ''

  useEffect(() => {
    const controller = new AbortController()
    setError(false)
    getFaqs(controller.signal)
      .then(setFaqs)
      .catch(() => !controller.signal.aborted && setError(true))
      .finally(() => !controller.signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [retry])

  // Tìm không phân biệt dấu: "hoan coin" vẫn khớp "hoàn coin"
  const words = normalize(query).split(/\s+/).filter(Boolean)
  const matched = faqs.filter(
    (faq) =>
      (!category || faq.category === category) &&
      words.every((word) => normalize(`${faq.question} ${faq.answer}`).includes(word)),
  )
  const groups = CATEGORIES.map((name) => ({ name, items: matched.filter((faq) => faq.category === name) })).filter(
    (group) => group.items.length,
  )
  const toggle = (id: string) => setOpen(open.includes(id) ? open.filter((item) => item !== id) : [...open, id])

  return (
    <div className="shell page-pad">
      <section className="faq-hero">
        <h1>Câu hỏi thường gặp</h1>
        <p>Tìm nhanh câu trả lời về tài khoản, đặt lịch, ví coin và buổi học</p>
        <label className="faq-search">
          <Search size={18} />
          <input value={query} aria-label="Tìm câu hỏi" placeholder="Nhập câu hỏi, ví dụ: hoàn coin" onChange={(event) => setQuery(event.target.value)} />
        </label>
      </section>
      <div className="chips faq-chips">
        {['', ...CHIP_ORDER].map((name) => (
          <button
            key={name || 'all'}
            className={category === name ? 'chip is-active' : 'chip'}
            aria-pressed={category === name}
            onClick={() => setParams(name ? { category: name } : {})}
          >
            {name || 'Tất cả'}
          </button>
        ))}
      </div>
      {error ? (
        <ErrorBlock onRetry={() => setRetry(retry + 1)} />
      ) : loading ? (
        <Loading />
      ) : groups.length === 0 ? (
        <div className="card">
          <EmptyBlock icon={<Search size={30} />} title="Không tìm thấy câu hỏi phù hợp" message="Thử từ khoá khác hoặc gửi yêu cầu cho đội ngũ hỗ trợ." />
        </div>
      ) : (
        <div className="faq-grid">
          {/* Figma: cột trái Ví coin, Buổi học; cột phải Đặt lịch, Tài khoản. Mobile gộp thành 1 cột theo thứ tự gốc */}
          {[0, 1].map((column) => (
            <div key={column} className="faq-column">
              {groups
                .filter((_, index) => index % 2 === column)
                .map((group) => (
                  <section key={group.name} className="card faq-group" style={{ order: groups.indexOf(group) }}>
              <h2>
                {group.name} <small>{group.items.length} câu hỏi</small>
              </h2>
              {group.items.map((faq) => {
                const expanded = open.includes(faq.id) || words.length > 0
                return (
                  <div key={faq.id} className={expanded ? 'faq-item is-open' : 'faq-item'}>
                    <button aria-expanded={expanded} aria-controls={`faq-${faq.id}`} onClick={() => toggle(faq.id)}>
                      {faq.question}
                      <ChevronDown size={18} />
                    </button>
                    {expanded && <p id={`faq-${faq.id}`}>{faq.answer}</p>}
                  </div>
                )
              })}
            </section>
                ))}
            </div>
          ))}
        </div>
      )}
      <section className="card cta-card">
        <div>
          <h2>Không tìm thấy câu trả lời?</h2>
          <p className="muted">Gửi yêu cầu, chúng tôi phản hồi trong vòng 24 giờ.</p>
        </div>
        <Link to="/contact" className="primary-link">
          <ChevronRight size={18} /> Liên hệ hỗ trợ
        </Link>
      </section>
    </div>
  )
}
