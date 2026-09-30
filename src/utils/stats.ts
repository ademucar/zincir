import type { DateKey, IHabit } from '../interfaces/habit'
import { addDays, lastNDays, parseDateKey, toDateKey } from './date'
import { getHabitStats } from './streak'

const percent = (part: number, total: number) => (total === 0 ? 0 : Math.round((part / total) * 100))

const createdDayOf = (habit: IHabit) => toDateKey(new Date(habit.createdAt))

export interface IDailyRate {
  date: DateKey
  done: number
  /** O gün var olan alışkanlık sayısı */
  total: number
  rate: number
}

/**
 * Son `days` günün her biri için tamamlanma oranı.
 * O gün henüz eklenmemiş alışkanlıklar paydaya katılmaz; yeni bir alışkanlık
 * geçmiş günlerin oranını haksız yere düşürmez.
 */
export function getDailyRates(habits: readonly IHabit[], today: DateKey, days = 14): IDailyRate[] {
  const prepared = habits.map((h) => ({ created: createdDayOf(h), done: new Set(h.completions) }))
  return lastNDays(days, today).map((date) => {
    const active = prepared.filter((h) => h.created <= date)
    const done = active.filter((h) => h.done.has(date)).length
    return { date, done, total: active.length, rate: percent(done, active.length) }
  })
}

export interface IWeekdayRate {
  /** 0 = Pazartesi … 6 = Pazar */
  weekday: number
  done: number
  total: number
  rate: number
}

/**
 * Son `weeks` haftada haftanın her günü için tamamlanma oranı.
 * Bugün henüz bitmediği için hesaba katılmaz (dünden geriye bakılır).
 */
export function getWeekdayRates(habits: readonly IHabit[], today: DateKey, weeks = 8): IWeekdayRate[] {
  const result = Array.from({ length: 7 }, (_, weekday) => ({ weekday, done: 0, total: 0, rate: 0 }))
  const prepared = habits.map((h) => ({ created: createdDayOf(h), done: new Set(h.completions) }))

  for (const date of lastNDays(weeks * 7, addDays(today, -1))) {
    const weekday = (parseDateKey(date).getDay() + 6) % 7
    for (const habit of prepared) {
      if (habit.created > date) continue
      result[weekday].total += 1
      if (habit.done.has(date)) result[weekday].done += 1
    }
  }
  return result.map((r) => ({ ...r, rate: percent(r.done, r.total) }))
}

export interface IConsistencyItem {
  habit: IHabit
  rate30: number
  currentStreak: number
  longestStreak: number
}

/** Alışkanlıklar son 30 günlük tamamlanma oranına göre (yüksekten düşüğe) */
export function getConsistencyRanking(habits: readonly IHabit[], today: DateKey): IConsistencyItem[] {
  return habits
    .map((habit) => {
      const stats = getHabitStats(habit, today)
      return {
        habit,
        rate30: stats.rate30,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
      }
    })
    .sort((a, b) => b.rate30 - a.rate30 || b.currentStreak - a.currentStreak || a.habit.name.localeCompare(b.habit.name, 'tr'))
}

export interface IOverview {
  totalHabits: number
  doneToday: number
  /** Alışkanlıkların son 30 gün oranlarının ortalaması */
  averageRate30: number
  /** En uzun seriye sahip alışkanlık */
  best: { habit: IHabit; longestStreak: number } | null
  totalCompletions: number
}

export function getOverview(habits: readonly IHabit[], today: DateKey): IOverview {
  const ranking = getConsistencyRanking(habits, today)
  const best = ranking.reduce<IOverview['best']>(
    (top, item) =>
      item.longestStreak > (top?.longestStreak ?? 0) ? { habit: item.habit, longestStreak: item.longestStreak } : top,
    null,
  )
  return {
    totalHabits: habits.length,
    doneToday: habits.filter((h) => h.completions.includes(today)).length,
    averageRate30: ranking.length ? Math.round(ranking.reduce((sum, r) => sum + r.rate30, 0) / ranking.length) : 0,
    best,
    totalCompletions: habits.reduce((sum, h) => sum + new Set(h.completions).size, 0),
  }
}
