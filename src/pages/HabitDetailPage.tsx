import { ArrowLeft, CalendarCheck, Check, Flame, Pencil, Percent, SearchX, Trash2, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CalendarHeatmap } from '../components/CalendarHeatmap'
import { EmptyState } from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { HABIT_CATEGORIES, HABIT_COLORS } from '../constants/habit'
import { useHabitDialogs } from '../hooks/useHabitDialogs'
import { useHabits } from '../hooks/useHabits'
import { formatDayMonth, toDateKey } from '../utils/date'
import { getHabitStats } from '../utils/streak'

export function HabitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { habits, today, toggleToday, toggleDay } = useHabits()
  const { openEdit, openDelete, dialogs } = useHabitDialogs({ onDeleted: () => navigate('/') })

  const habit = habits.find((h) => h.id === id)
  const stats = useMemo(() => (habit ? getHabitStats(habit, today) : null), [habit, today])

  if (!habit || !stats) {
    return (
      <section className="py-8">
        <title>Alışkanlık bulunamadı · Zincir</title>
        <EmptyState
          icon={<SearchX className="size-7" aria-hidden />}
          title="Alışkanlık bulunamadı"
          description="Silinmiş olabilir ya da bağlantı hatalı."
        >
          <Link
            to="/"
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            Bugün sayfasına dön
          </Link>
        </EmptyState>
        {dialogs}
      </section>
    )
  }

  const palette = HABIT_COLORS[habit.color]
  const createdDay = toDateKey(new Date(habit.createdAt))

  return (
    <section>
      <title>{`${habit.name} · Zincir`}</title>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Bugün
      </Link>

      {/* Başlık */}
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className={`grid size-16 shrink-0 place-items-center rounded-2xl text-3xl ${palette.soft}`} aria-hidden>
          {habit.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${palette.text}`}>{HABIT_CATEGORIES[habit.category]}</p>
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">{habit.name}</h1>
          {habit.description && <p className="mt-1 text-zinc-600 dark:text-zinc-400">{habit.description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleToday(habit.id)}
            aria-pressed={stats.doneToday}
            className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-colors ${
              stats.doneToday
                ? `${palette.button} text-white`
                : 'border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Check className="size-4" strokeWidth={3} aria-hidden />
            {stats.doneToday ? 'Bugün yapıldı' : 'Bugün yaptım'}
          </button>
          <button
            type="button"
            onClick={() => openEdit(habit)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Pencil className="size-4" aria-hidden />
            Düzenle
          </button>
          <button
            type="button"
            onClick={() => openDelete(habit)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-50 dark:border-zinc-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <Trash2 className="size-4" aria-hidden />
            Sil
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Flame className="size-4 text-orange-500" aria-hidden />}
          label="Güncel seri"
          value={`${stats.currentStreak} gün`}
          hint={stats.currentStreak > 0 && !stats.doneToday ? 'Bugün yaparsan zincir uzar' : undefined}
        />
        <StatCard
          icon={<Trophy className="size-4 text-amber-500" aria-hidden />}
          label="En uzun seri"
          value={`${stats.longestStreak} gün`}
        />
        <StatCard
          icon={<Percent className="size-4 text-sky-500" aria-hidden />}
          label="Son 30 gün"
          value={`%${stats.rate30}`}
        />
        <StatCard
          icon={<CalendarCheck className="size-4 text-emerald-500" aria-hidden />}
          label="Toplam"
          value={`${stats.totalCompletions} gün`}
          hint={`${formatDayMonth(createdDay)} tarihinden beri`}
        />
      </div>

      {/* Takvim */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold tracking-tight">Son 12 hafta</h2>
          <p className="text-xs text-zinc-500">Unuttuğun bir günü işaretlemek için o güne tıkla.</p>
        </div>
        <CalendarHeatmap
          completions={habit.completions}
          today={today}
          createdDay={createdDay}
          color={habit.color}
          onToggleDay={(day) => toggleDay(habit.id, day)}
        />
      </div>

      {dialogs}
    </section>
  )
}
