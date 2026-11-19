import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { useReveal } from '../hooks/useReveal'

export default function MainLayout({
  children,
  tinted = false,
  compactFooter = false,
}: {
  children: React.ReactNode
  tinted?: boolean
  compactFooter?: boolean
}) {
  const frame = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const [showTop, setShowTop] = useState(false)
  useReveal(frame)

  // Sang trang mới thì về đầu trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 640)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={frame} className={tinted ? 'app-frame tinted' : 'app-frame'}>
      <Header />
      <main>{children}</main>
      <Footer compact={compactFooter} />
      <button
        type="button"
        className={showTop ? 'back-to-top is-shown' : 'back-to-top'}
        aria-label="Về đầu trang"
        tabIndex={showTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  )
}
