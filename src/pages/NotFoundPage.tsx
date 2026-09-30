import { Unlink } from 'lucide-react'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <title>Sayfa bulunamadı · Zincir</title>
      <div className="grid size-16 place-items-center rounded-2xl bg-zinc-200/70 text-zinc-500 dark:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-400">
        <Unlink className="size-8" aria-hidden />
      </div>
      <p className="mt-6 text-sm font-semibold text-emerald-700 dark:text-emerald-400">404</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Bu halka zincirde yok</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
      >
        Bugün sayfasına dön
      </Link>
    </section>
  )
}
