import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}

/**
 * Tarayıcının yerleşik <dialog> elementi üzerine kurulu pencere.
 * Odak pencere içinde kalır, Esc ile kapanır, arka plana tıklayınca kapanır,
 * kapanınca odak pencereyi açan düğmeye geri döner. İlk odaklanacak öğe
 * içerikte `data-autofocus` ile işaretlenir.
 */
export function Modal({ open, onClose, title, description, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // <dialog> varsayılan olarak ilk odaklanabilir öğeye (kapat düğmesi) odaklanır;
      // içerik data-autofocus ile başka bir öğe işaretlediyse odak oraya taşınır.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        // İç kutu tüm pencereyi kapladığı için hedef <dialog> ise tıklama arka plana yapılmıştır
        if (event.target === dialogRef.current) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-0 text-zinc-900 shadow-2xl ring-1 ring-zinc-200 backdrop:bg-zinc-950/50 backdrop:backdrop-blur-sm open:animate-slide-up dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-800"
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex-1">
              <h2 id={titleId} className="text-lg font-semibold tracking-tight">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-2 grid size-9 place-items-center rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Pencereyi kapat"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
