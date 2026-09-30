import { CircleCheck, Info, Trash2, X } from 'lucide-react'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type IToast, type IToastOptions, type ToastTone } from '../context/toastContext'

const DURATION_MS = 4000
/** "Geri al" gibi bir eylem varsa kullanıcıya daha fazla süre tanınır */
const DURATION_WITH_ACTION_MS = 7000
const MAX_TOASTS = 3

const TONE_ICON: Record<ToastTone, ReactNode> = {
  success: <CircleCheck className="size-5 text-emerald-400" aria-hidden />,
  info: <Info className="size-5 text-sky-400" aria-hidden />,
  danger: <Trash2 className="size-5 text-rose-400" aria-hidden />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<IToast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ tone = 'success', ...options }: IToastOptions) => {
      const id = nextId.current++
      setToasts((current) => [...current, { id, tone, ...options }].slice(-MAX_TOASTS))
      window.setTimeout(() => dismiss(id), options.action ? DURATION_WITH_ACTION_MS : DURATION_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Ekran okuyucular yeni bildirimleri kesintiye uğratmadan okur */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-center gap-3 rounded-xl bg-zinc-900 py-3 pr-2 pl-4 text-sm text-white shadow-lg ring-1 ring-white/10 dark:bg-zinc-800"
          >
            {TONE_ICON[toast.tone]}
            <p className="flex-1">{toast.message}</p>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick()
                  dismiss(toast.id)
                }}
                className="rounded-lg px-2.5 py-1.5 font-semibold text-emerald-400 transition-colors hover:bg-white/10"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="grid size-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Bildirimi kapat"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
