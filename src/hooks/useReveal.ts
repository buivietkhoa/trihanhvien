import { useLayoutEffect } from 'react'

/** Các khối sẽ hiện dần (mờ → rõ, trượt lên) khi cuộn tới */
const SELECTOR = [
  '.section-heading',
  '.benefits-heading',
  '.goal-card',
  '.teacher-card',
  '.course-card',
  '.benefit-grid > div',
  '.journey-grid > li',
  '.mx-stats > div',
  '.home-cta',
  '.stat-card',
  '.section-card',
].join(',')

/**
 * Tự gắn lớp `.reveal` cho các khối khớp SELECTOR (kể cả khối được thêm sau khi tải dữ liệu)
 * và thêm `.is-visible` khi khối đi vào màn hình. Bỏ qua nếu người dùng tắt chuyển động.
 */
export function useReveal(root: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const host = root.current
    if (!host || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    )
    const seen = new WeakSet<Element>()
    const scan = () =>
      host.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        // Các thẻ cùng hàng hiện lần lượt
        const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0
        el.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 80}ms`)
        el.classList.add('reveal')
        io.observe(el)
      })

    scan()
    const mo = new MutationObserver(scan)
    mo.observe(host, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [root])
}
