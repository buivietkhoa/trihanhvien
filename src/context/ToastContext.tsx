import { createContext, useCallback, useContext, useState } from 'react'
import { CircleCheck, CircleAlert, X } from 'lucide-react'

type Toast = { id: number; title: string; message?: string; tone: 'success' | 'error' }
type ToastValue = (title: string, message?: string, tone?: Toast['tone']) => void

const ToastContext = createContext<ToastValue>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const dismiss = (id: number) => setToasts((list) => list.filter((toast) => toast.id !== id))
  const show = useCallback<ToastValue>((title, message, tone = 'success') => {
    const id = Date.now()
    setToasts((list) => [...list, { id, title, message, tone }])
    setTimeout(() => dismiss(id), 4000)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
            {toast.tone === 'success' ? <CircleCheck size={20} /> : <CircleAlert size={20} />}
            <div>
              <strong>{toast.title}</strong>
              {toast.message && <p>{toast.message}</p>}
            </div>
            <button className="toast-close" aria-label="Đóng thông báo" onClick={() => dismiss(toast.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
