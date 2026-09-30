import { useEffect, useMemo, useRef, useState } from 'react'
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
}

const WEEKDAY_LABELS = ['Pzt', '', 'Çar', '', 'Cum', '', 'Paz']

// Ölçüler Tailwind sınıflarıyla aynı: kare size-7 (28px), aralık gap-1.5 (6px), gün adları sütunu w-8 (32px)
const CELL = 28
const GAP = 6
const LABEL_COLUMN = 32 + GAP
const MIN_WEEKS = 8
const MAX_WEEKS = 26

/** Genişliğe sığan hafta sayısı: mobilde en az 8, geniş ekranda en fazla 26 (≈6 ay) */
function weeksThatFit(width: number): number {
  const fit = Math.floor((width - LABEL_COLUMN + GAP) / (CELL + GAP))
  return Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, fit))
}

/**
 * Takvim görünümü: her kare bir gün, dolu kareler yapılan günler.
 * Gösterilen hafta sayısı kartın genişliğine göre ayarlanır.
 */
export function CalendarHeatmap({ completions, today, createdDay, color, onToggleDay }: CalendarHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [weekCount, setWeekCount] = useState(12)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWeekCount(weeksThatFit(entry.contentRect.width)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const weeks = useMemo(() => buildCalendarWeeks(today, weekCount), [today, weekCount])
  const done = useMemo(() => new Set(completions), [completions])
  const palette = HABIT_COLORS[color]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold tracking-tight">Son {weekCount} hafta</h2>
        <p className="text-xs text-zinc-500">Unuttuğun bir günü işaretlemek için o güne tıkla.</p>
      </div>

      <div ref={containerRef} className="overflow-x-auto [scrollbar-width:thin]">
        <div className="inline-flex gap-1.5">
          {/* Gün adları */}
          <div className="grid w-8 grid-rows-[1.25rem_repeat(7,1.75rem)] gap-1.5 text-[11px] text-zinc-500" aria-hidden>
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

      {/* Gösterge: renklerin anlamı */}
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400" aria-label="Takvim göstergesi">
        <li className="flex items-center gap-1.5">
          <span className={`size-3.5 rounded ${palette.solid}`} aria-hidden />
          Yapıldı
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3.5 rounded bg-zinc-200/70 dark:bg-zinc-800" aria-hidden />
          Yapılmadı
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3.5 rounded border border-dashed border-zinc-300 dark:border-zinc-700" aria-hidden />
          Henüz eklenmemişti
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3.5 rounded ring-2 ring-zinc-900 ring-offset-1 ring-offset-white dark:ring-white dark:ring-offset-zinc-900" aria-hidden />
          Bugün
        </li>
      </ul>
    </div>
  )
}
