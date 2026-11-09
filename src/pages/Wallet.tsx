import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, Coins, Wallet as WalletIcon } from 'lucide-react'
import type { Transaction } from '../types'
import { getTransactions } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { EmptyBlock, ErrorBlock, Loading } from '../components/common'
import { TopUpModal } from '../components/modals'
import { formatCoin, formatPrice, signedCoin } from '../utils/format'
import { dateTime, now } from '../utils/time'

const FILTERS = [
  ['all', 'Tất cả'],
  ['topup', 'Nạp'],
  ['payment', 'Thanh toán'],
  ['refund', 'Hoàn'],
] as const
const TYPE_LABELS = { topup: 'Nạp', payment: 'Thanh toán', refund: 'Hoàn' }
const PAGE_SIZE = 10

export default function Wallet() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>('all')
  const [page, setPage] = useState(1)
  const topupOpen = params.get('topup') === '1'

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    setError(false)
    getTransactions(user.id, controller.signal)
      .then(setItems)
      .catch(() => !controller.signal.aborted && setError(true))
      .finally(() => !controller.signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [user?.id, version]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null
  const month = now().getMonth()
  const inMonth = items.filter((item) => new Date(item.createdAt).getMonth() === month)
  const topups = inMonth.filter((item) => item.type === 'topup')
  const payments = inMonth.filter((item) => item.type === 'payment')
  const refunds = inMonth.filter((item) => item.type === 'refund')
  const topupSum = topups.reduce((sum, item) => sum + item.amount, 0)
  const used = [...payments, ...refunds].reduce((sum, item) => sum + item.amount, 0)
  const filtered = filter === 'all' ? items : items.filter((item) => item.type === filter)
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const setTopup = (open: boolean) => setParams(open ? { topup: '1' } : {}, { replace: true })

  return (
    <div className="shell page-pad">
      <header className="page-title">
        <h1>Ví coin</h1>
        <p>1 coin = 1.000đ · Nạp trước, trừ dần theo từng buổi học</p>
      </header>
      <div className="wallet-stats">
        <section className="balance-card">
          <div>
            <small>Số dư hiện tại</small>
            <strong>
              <Coins size={30} /> {formatCoin(user.coinBalance)}
            </strong>
            <span>≈ {formatPrice(user.coinBalance * 1000)}đ</span>
          </div>
          <button className="light-button" onClick={() => setTopup(true)}>
            <Coins size={17} /> Nạp coin
          </button>
        </section>
        <section className="card stat-card">
          <small><WalletIcon size={15} /> Đã nạp trong tháng {month + 1}</small>
          <strong className="positive">{topupSum ? signedCoin(topupSum) : '0 coin'}</strong>
          <span>{topups.length} lần nạp</span>
        </section>
        <section className="card stat-card">
          <small><Calendar size={15} /> Đã dùng trong tháng {month + 1}</small>
          <strong className="negative">{used ? signedCoin(used) : '0 coin'}</strong>
          <span>
            {payments.length} buổi đã thanh toán
            {refunds.length > 0 && ` · đã hoàn lại ${formatCoin(refunds.reduce((sum, item) => sum + item.amount, 0))}`}
          </span>
        </section>
      </div>

      <section className="card table-card">
        <div className="table-head">
          <h2>Lịch sử giao dịch</h2>
          <div className="chips" role="tablist" aria-label="Loại giao dịch">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                className={filter === key ? 'chip is-active' : 'chip'}
                onClick={() => {
                  setFilter(key)
                  setPage(1)
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {error ? (
          <ErrorBlock onRetry={() => setVersion(version + 1)} />
        ) : loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyBlock
            icon={<WalletIcon size={30} />}
            title="Bạn chưa có giao dịch nào"
            message="Nạp coin để bắt đầu đặt lịch học 1:1 với giáo viên. Mọi khoản nạp, thanh toán và hoàn coin sẽ hiển thị tại đây."
          >
            <button className="primary-link" onClick={() => setTopup(true)}>
              <Coins size={17} /> Nạp coin
            </button>
          </EmptyBlock>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Loại</th>
                  <th>Nội dung</th>
                  <th className="num">Số coin</th>
                  <th className="num">Số dư sau</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Thời gian">{dateTime(item.createdAt)}</td>
                    <td data-label="Loại"><span className={`type-tag type-${item.type}`}>{TYPE_LABELS[item.type]}</span></td>
                    <td data-label="Nội dung" className="cell-main">{item.description}</td>
                    <td data-label="Số coin" className={`num ${item.amount > 0 ? 'positive' : 'negative'}`}>{signedCoin(item.amount)}</td>
                    <td data-label="Số dư sau" className="num"><span className="mobile-copy">Số dư: </span>{formatCoin(item.balanceAfter)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-foot">
              <span>
                Hiển thị {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + visible.length} trong {filtered.length} giao dịch ·{' '}
                {PAGE_SIZE} dòng mỗi trang
              </span>
              <nav className="pagination compact" aria-label="Phân trang giao dịch">
                <button className="icon-button" disabled={page === 1} aria-label="Trang trước" onClick={() => setPage(page - 1)}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pages }, (_, i) => (
                  <button key={i} aria-current={page === i + 1 ? 'page' : undefined} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}
                <button className="icon-button" disabled={page === pages} aria-label="Trang sau" onClick={() => setPage(page + 1)}>
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </>
        )}
      </section>
      {topupOpen && (
        <TopUpModal
          onClose={() => setTopup(false)}
          onDone={() => {
            setTopup(false)
            setFilter('all')
            setPage(1)
            setVersion(version + 1)
          }}
        />
      )}
    </div>
  )
}
