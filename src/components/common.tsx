import { useEffect, useRef, useState } from 'react'
import { Check, Eye, EyeOff, Star, UserRound, X } from 'lucide-react'
import { passwordStrength } from '../utils/format'

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])
  return (
    <dialog
      ref={ref}
      className={wide ? 'modal modal-wide' : 'modal'}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-button plain" aria-label="Đóng" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}

export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="rating-stars" aria-label={`${value} trên 5 sao`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={size} fill={index < Math.round(value) ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}

export function Avatar({ src, size = 40 }: { src?: string; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size }} aria-hidden="true">
      {src ? <img src={src} alt="" /> : <UserRound size={size * 0.45} />}
    </span>
  )
}

export function PasswordInput({
  id,
  value,
  onChange,
  invalid,
  autoComplete,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  autoComplete?: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className={invalid ? 'input-icon is-invalid' : 'input-icon'}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export function StrengthMeter({ value, showLabel = true }: { value: string; showLabel?: boolean }) {
  if (!value) return null
  const { score, label } = passwordStrength(value)
  return (
    <div className={`strength strength-${score}`}>
      <div>
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} className={index < score ? 'on' : ''} />
        ))}
      </div>
      {showLabel && <small>{label}</small>}
    </div>
  )
}

export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const labels = ['Chọn giờ', 'Xác nhận', 'Hoàn tất']
  return (
    <ol className="stepper card">
      {labels.map((label, index) => {
        const current = index + 1
        const state = current < step || step === 3 ? 'done' : current === step ? 'active' : ''
        return (
          <li key={label} className={state}>
            <span>{state === 'done' ? <Check size={14} strokeWidth={3} /> : current}</span>
            {label}
          </li>
        )
      })}
    </ol>
  )
}

export function EmptyBlock({
  icon,
  title,
  message,
  children,
}: {
  icon: React.ReactNode
  title: string
  message: string
  children?: React.ReactNode
}) {
  return (
    <div className="empty-block">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{message}</p>
      {children}
    </div>
  )
}

export function Loading({ label = 'Đang tải dữ liệu…' }: { label?: string }) {
  return (
    <div className="loading-block" role="status">
      {label}
    </div>
  )
}

export function ErrorBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="error-state" role="alert">
      Không thể kết nối dữ liệu. Hãy kiểm tra Mock API (npm run mock).{' '}
      <button onClick={onRetry}>Thử lại</button>
    </div>
  )
}
