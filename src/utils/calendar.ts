import type { DateKey } from '../interfaces/habit'
import { addDays, parseDateKey } from './date'

export interface ICalendarWeek {
  /** Pazartesiden pazara 7 gün; bugünden sonraki günler null */
  days: (DateKey | null)[]
  /** Haftanın pazartesisi yeni bir aydaysa ayın kısa adı ("Eyl"), değilse null */
  monthLabel: string | null
}

const monthFormatter = new Intl.DateTimeFormat('tr-TR', { month: 'short' })

/** Haftanın pazartesisi (Türkiye'de hafta pazartesi başlar) */
export function startOfWeek(day: DateKey): DateKey {
  const weekday = (parseDateKey(day).getDay() + 6) % 7 // Pzt = 0 … Paz = 6
  return addDays(day, -weekday)
}

/**
 * Bugünün haftası dahil son `weekCount` haftanın takvim ızgarası.
 * Sütunlar haftalar (eskiden yeniye), satırlar haftanın günleri.
 */
export function buildCalendarWeeks(today: DateKey, weekCount = 12): ICalendarWeek[] {
  const firstMonday = addDays(startOfWeek(today), -7 * (weekCount - 1))
  let previousMonth = -1

  return Array.from({ length: weekCount }, (_, weekIndex) => {
    const monday = addDays(firstMonday, weekIndex * 7)
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(monday, i)
      return day <= today ? day : null
    })

    // Ay etiketi, pazartesisi yeni bir aya düşen haftanın üstüne yazılır.
    // (Pazara göre bakılsaydı henüz gelmemiş ayın adı son sütunda görünebilirdi.)
    const mondayDate = parseDateKey(monday)
    const month = mondayDate.getMonth()
    const monthLabel = month !== previousMonth ? monthFormatter.format(mondayDate) : null
    previousMonth = month

    return { days, monthLabel }
  })
}
