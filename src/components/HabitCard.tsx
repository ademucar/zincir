import { Check, Flame, Pencil, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { HABIT_CATEGORIES, HABIT_COLORS } from '../constants/habit'
import type { DateKey, IHabit } from '../interfaces/habit'
import type { IHabitStats } from '../interfaces/stats'
import { ChainDots } from './ChainDots'

interface HabitCardProps {
  habit: IHabit
  stats: IHabitStats
  today: DateKey
  onToggle: (habit: IHabit) => void
  onEdit: (habit: IHabit) => void
  onDelete: (habit: IHabit) => void
}

export function HabitCard({ habit, stats, today, onToggle, onEdit, onDelete }: HabitCardProps) {
  const palette = HABIT_COLORS[habit.color]
  const { doneToday, currentStreak } = stats

  return (
    <article
      className={`group flex flex-col rounded-2xl border bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:bg-zinc-900 ${
        doneToday ? 'border-transparent ring-1 ring-zinc-200 dark:ring-zinc-800' : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <header className="flex items-start gap-3.5">
        <span className={`grid size-12 shrink-0 place-items-center rounded-xl text-2xl ${palette.soft}`} aria-hidden>
          {habit.icon}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold tracking-tight">
            <Link to={`/aliskanlik/${habit.id}`} className="rounded hover:underline">
              {habit.name}
            </Link>
          </h2>
          <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
            <span className={`font-medium ${palette.text}`}>{HABIT_CATEGORIES[habit.category]}</span>
            {habit.description && <> · {habit.description}</>}
          </p>
        </div>

        {/* Dokunmatik ekranlarda her zaman, farede üzerine gelince belirgin */}
        <div className="-mt-1 -mr-2 flex opacity-100 transition-opacity sm:opacity-60 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          <IconButton label={`${habit.name} alışkanlığını düzenle`} onClick={() => onEdit(habit)}>
            <Pencil className="size-4" aria-hidden />
          </IconButton>
          <IconButton label={`${habit.name} alışkanlığını sil`} onClick={() => onDelete(habit)} danger>
            <Trash2 className="size-4" aria-hidden />
          </IconButton>
        </div>
      </header>

      <div className="mt-5">
        <ChainDots days={stats.last7Days} today={today} color={habit.color} />
      </div>

      <footer className="mt-5 flex items-center justify-between gap-3">
        <p
          className={`flex items-center gap-1.5 text-sm font-medium ${
            currentStreak > 0 ? 'text-orange-700 dark:text-orange-400' : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Flame className={`size-4 ${currentStreak > 0 ? 'fill-orange-500/20' : ''}`} aria-hidden />
          {currentStreak > 0 ? `${currentStreak} günlük seri` : 'Seri yok'}
        </p>

        <button
          type="button"
          onClick={() => onToggle(habit)}
          aria-pressed={doneToday}
          className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-colors ${
            doneToday
              ? `${palette.button} text-white`
              : 'border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800'
          }`}
        >
          <Check className={`size-4 ${doneToday ? 'animate-pop' : ''}`} strokeWidth={3} aria-hidden />
          {doneToday ? 'Yapıldı' : 'Bugün yaptım'}
        </button>
      </footer>
    </article>
  )
}

interface IconButtonProps {
  label: string
  onClick: () => void
  danger?: boolean
  children: ReactNode
}

function IconButton({ label, onClick, danger, children }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-9 place-items-center rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
        danger ? 'hover:text-rose-600 dark:hover:text-rose-400' : 'hover:text-zinc-900 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
