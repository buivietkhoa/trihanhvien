import Footer from '../components/Footer'
import Header from '../components/Header'

export default function MainLayout({
  children,
  tinted = false,
  compactFooter = false,
}: {
  children: React.ReactNode
  tinted?: boolean
  compactFooter?: boolean
}) {
  return (
    <div className={tinted ? 'app-frame tinted' : 'app-frame'}>
      <Header />
      <main>{children}</main>
      <Footer compact={compactFooter} />
    </div>
  )
}
