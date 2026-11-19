import { useEffect, useRef, useState } from 'react'

/**
 * Đếm tăng dần phần số đầu tiên của chuỗi khi xuất hiện trên màn hình,
 * giữ nguyên phần chữ còn lại: "24+" → 0+ … 24+, "4,7/5" → 0,0/5 … 4,7/5.
 */
export default function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const match = value.match(/^(\d+)(?:,(\d+))?(.*)$/)
  const target = match ? Number(`${match[1]}.${match[2] ?? 0}`) : 0
  const decimals = match?.[2]?.length ?? 0
  const suffix = match?.[3] ?? ''
  const ref = useRef<HTMLSpanElement>(null)
  // null = hiện đúng giá trị (khi người dùng tắt chuyển động)
  const [current, setCurrent] = useState<number | null>(() =>
    match && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : null,
  )

  useEffect(() => {
    const el = ref.current
    if (!match || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        setCurrent(target * (1 - Math.pow(1 - t, 3)))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  if (!match) return <>{value}</>
  const shown = current === null ? value : `${current.toFixed(decimals).replace('.', ',')}${suffix}`
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">{shown}</span>
    </span>
  )
}
