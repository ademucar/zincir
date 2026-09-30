import type { DateKey, IHabit } from '../interfaces/habit'
import type { IDayStatus, IHabitStats } from '../interfaces/stats'
import { addDays, diffInDays, lastNDays, toDateKey } from './date'

/**
 * Bugünkü seri: bugünden geriye kesintisiz yapılan gün sayısı.
 * Bugün henüz yapılmadıysa zincir kırılmış sayılmaz; seri dünden itibaren hesaplanır.
 */
export function getCurrentStreak(completions: readonly DateKey[], today: DateKey): number {
  const done = new Set(completions)
  let day = done.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (done.has(day)) {
    streak += 1
    day = addDays(day, -1)
  }
  return streak
}

/** Tüm zamanların en uzun kesintisiz serisi */
export function getLongestStreak(completions: readonly DateKey[]): number {
  const days = [...new Set(completions)].sort()
  let longest = 0
  let current = 0
  for (let i = 0; i < days.length; i++) {
    current = i > 0 && diffInDays(days[i - 1], days[i]) === 1 ? current + 1 : 1
    longest = Math.max(longest, current)
  }
  return longest
}

/** Belirtilen günlerin yapıldı / yapılmadı durumu */
export function getDayStatuses(completions: readonly DateKey[], days: readonly DateKey[]): IDayStatus[] {
  const done = new Set(completions)
  return days.map((date) => ({ date, done: done.has(date) }))
}

/**
 * Son `period` gündeki tamamlanma yüzdesi (tam sayı).
 * Alışkanlık daha yeni oluşturulduysa oluşturulduğu günden itibaren hesaplanır:
 * 3 gün önce eklenip 3 gündür yapılan alışkanlık %10 değil %100 görünür.
 */
export function getCompletionRate(
  completions: readonly DateKey[],
  today: DateKey,
  createdAt: DateKey,
  period = 30,
): number {
  const daysSinceCreated = diffInDays(createdAt, today) + 1
  const span = Math.max(1, Math.min(period, daysSinceCreated))
  const window = new Set(lastNDays(span, today))
  const doneInWindow = new Set(completions.filter((day) => window.has(day))).size
  return Math.round((doneInWindow / span) * 100)
}

/** Bir alışkanlığın tüm hesaplanan değerleri */
export function getHabitStats(habit: IHabit, today: DateKey): IHabitStats {
  const createdDay = toDateKey(new Date(habit.createdAt))
  return {
    doneToday: habit.completions.includes(today),
    currentStreak: getCurrentStreak(habit.completions, today),
    longestStreak: getLongestStreak(habit.completions),
    last7Days: getDayStatuses(habit.completions, lastNDays(7, today)),
    rate30: getCompletionRate(habit.completions, today, createdDay),
    totalCompletions: new Set(habit.completions).size,
  }
}

/** Bugünü tamamlandı / tamamlanmadı yapar; dizi sıralı ve tekrarsız kalır */
export function toggleCompletion(completions: readonly DateKey[], day: DateKey): DateKey[] {
  return completions.includes(day)
    ? completions.filter((d) => d !== day)
    : [...completions, day].sort()
}
