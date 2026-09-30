import { useContext } from 'react'
import { ToastContext } from '../context/toastContext'

/** Ekranın altında kısa süreli bildirim gösterir (ToastProvider içinde kullanılmalı) */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast, ToastProvider içinde kullanılmalıdır.')
  }
  return context
}
