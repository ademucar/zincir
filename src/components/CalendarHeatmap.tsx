import { useMemo } from 'react'
import { HABIT_COLORS } from '../constants/habit'
import type { DateKey, HabitColor } from '../interfaces/habit'
import { buildCalendarWeeks } from '../utils/calendar'
import { formatLongDate } from '../utils/date'

interface CalendarHeatmapProps {
  completions: readonly DateKey[]
  today: DateKey
  /** Alışkanlığın oluşturulduğu gün; öncesi soluk gösterilir ve işaretlenemez */
  createdDay: DateKey
  color: HabitColor
  /** Bir güne tıklanınca (geçmiş günü düzeltmek için) */
  onToggleDay: (day: DateKey) => void
  weekCount?: number
}

const WEEKDAY_LABELS = ['Pzt', '', 'Çar', '', 'Cum', '', 'Paz']

/** Son haftaların takvimi; her kare bir gün, dolu kareler yapılan günler. */
export function CalendarHeatmap({
  completions,
  today,
  createdDay,
  color,
  onToggleDay,
  weekCount = 12,
}: CalendarHeatmapProps) {
  const weeks = useMemo(() => buildCalendarWeeks(today, weekCount), [today, weekCount])
  const done = useMemo(() => new Set(completions), [completions])
  const palette = HABIT_COLORS[color]

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <div className="inline-flex gap-1.5">
        {/* Gün adları */}
        <div className="grid grid-rows-[1.25rem_repeat(7,1.75rem)] gap-1.5 pr-1 text-[11px] text-zinc-500" aria-hidden>
          <span />
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i} className="flex items-center">
              {label}
            </span>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-[1.25rem_repeat(7,1.75rem)] gap-1.5">
            <span className="text-[11px] whitespace-nowrap text-zinc-500" aria-hidden>
              {week.monthLabel}
            </span>
            {week.days.map((day, dayIndex) => {
              if (!day) return <span key={dayIndex} className="size-7" aria-hidden />
              const isDone = done.has(day)
              const isToday = day === today
              if (day < createdDay && !isDone) {
                return (
                  <span
                    key={day}
                    className="size-7 rounded-md border border-dashed border-zinc-200 dark:border-zinc-800"
                    title={`${formatLongDate(day)} · Alışkanlık henüz eklenmemişti`}
                    aria-hidden
                  />
                )
              }
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onToggleDay(day)}
                  aria-pressed={isDone}
                  aria-label={`${formatLongDate(day)}${isToday ? ' (bugün)' : ''}: ${isDone ? 'yapıldı' : 'yapılmadı'}`}
                  title={`${formatLongDate(day)} · ${isDone ? 'Yapıldı' : 'Yapılmadı'}`}
                  className={`size-7 rounded-md transition-transform hover:scale-110 ${
                    isDone ? palette.solid : 'bg-zinc-200/70 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                  } ${isToday ? 'ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-zinc-900' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
