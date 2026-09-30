import { Check } from 'lucide-react'
import { HABIT_COLORS } from '../constants/habit'
import type { DateKey, HabitColor } from '../interfaces/habit'
import type { IDayStatus } from '../interfaces/stats'
import { formatDayMonth, formatShortWeekday } from '../utils/date'

interface ChainDotsProps {
  days: IDayStatus[]
  today: DateKey
  color: HabitColor
}

/**
 * Son günlerin halkaları. Art arda yapılan günler bir çizgiyle bağlanır;
 * böylece seri gerçekten bir zincir gibi görünür.
 */
export function ChainDots({ days, today, color }: ChainDotsProps) {
  const palette = HABIT_COLORS[color]

  return (
    <ol className="flex items-start" aria-label="Son 7 gün">
      {days.map((day, index) => {
        const linkedToPrevious = index > 0 && day.done && days[index - 1].done
        const isToday = day.date === today
        return (
          <li key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative flex w-full justify-center">
              {/* Önceki güne bağlanan çizgi; halkalar z-10 ile çizginin üstünde kalır */}
              {index > 0 && (
                <span
                  aria-hidden
                  className={`absolute top-1/2 right-1/2 h-0.5 w-full -translate-y-1/2 ${
                    linkedToPrevious ? palette.solid : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              )}
              <span
                className={`relative z-10 grid size-6 place-items-center rounded-full ${
                  day.done
                    ? `${palette.solid} text-white`
                    : 'border-2 border-dashed border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                } ${isToday ? 'ring-2 ring-zinc-900/80 ring-offset-2 ring-offset-white dark:ring-white/80 dark:ring-offset-zinc-900' : ''}`}
              >
                {day.done && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
              </span>
            </div>
            <span
              className={`text-[11px] leading-none ${isToday ? 'font-semibold text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
              aria-hidden
            >
              {isToday ? 'Bugün' : formatShortWeekday(day.date)}
            </span>
            <span className="sr-only">
              {formatDayMonth(day.date)}: {day.done ? 'yapıldı' : 'yapılmadı'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
