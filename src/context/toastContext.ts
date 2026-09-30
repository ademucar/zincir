import { createContext } from 'react'

export type ToastTone = 'success' | 'info' | 'danger'

export interface IToastOptions {
  message: string
  tone?: ToastTone
  /** Örn. silme sonrası "Geri al" */
  action?: { label: string; onClick: () => void }
}

export interface IToast extends IToastOptions {
  id: number
  tone: ToastTone
}

export interface IToastContext {
  showToast: (options: IToastOptions) => void
}

export const ToastContext = createContext<IToastContext | null>(null)
