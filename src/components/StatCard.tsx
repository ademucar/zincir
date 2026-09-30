import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  hint?: string
}

/** Tek bir istatistik kutucuğu */
export function StatCard({ icon, label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  )
}
