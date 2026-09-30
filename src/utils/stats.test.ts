import { describe, expect, it } from 'vitest'
import type { IHabit } from '../interfaces/habit'
import { getConsistencyRanking, getDailyRates, getOverview, getWeekdayRates } from './stats'

const TODAY = '2026-09-30' // Çarşamba

const habit = (name: string, createdDay: string, completions: string[]): IHabit => ({
  id: name,
  name,
  description: '',
  icon: '💧',
  color: 'sky',
  category: 'saglik',
  completions,
  createdAt: new Date(`${createdDay}T09:00:00`).toISOString(),
  updatedAt: new Date(`${createdDay}T09:00:00`).toISOString(),
})

const a = habit('A', '2026-09-01', ['2026-09-28', '2026-09-29', '2026-09-30'])
const b = habit('B', '2026-09-29', ['2026-09-30'])

describe('getDailyRates', () => {
  it('her gün için yapılan / var olan alışkanlık oranını verir', () => {
    expect(getDailyRates([a, b], TODAY, 3)).toEqual([
      { date: '2026-09-28', done: 1, total: 1, rate: 100 }, // B henüz yoktu
      { date: '2026-09-29', done: 1, total: 2, rate: 50 },
      { date: '2026-09-30', done: 2, total: 2, rate: 100 },
    ])
  })

  it('hiç alışkanlık yokken oran 0', () => {
    expect(getDailyRates([], TODAY, 2).map((d) => d.rate)).toEqual([0, 0])
  })
})

describe('getWeekdayRates', () => {
  it('bugünü saymaz, günleri haftanın gününe göre toplar', () => {
    const rates = getWeekdayRates([a, b], TODAY, 1)
    // Son 7 gün (dün dahil): 23–29 Eylül. Pazartesi = 28 Eylül, Salı = 29 Eylül
    expect(rates[0]).toEqual({ weekday: 0, done: 1, total: 1, rate: 100 }) // Pzt: yalnız A vardı
    expect(rates[1]).toEqual({ weekday: 1, done: 1, total: 2, rate: 50 }) // Sal: A yaptı, B yapmadı
    expect(rates[2]).toEqual({ weekday: 2, done: 0, total: 1, rate: 0 }) // Çar 23 Eylül; bugün (30) sayılmaz
  })
})

describe('getConsistencyRanking', () => {
  it('son 30 gün oranına göre sıralar; yeni alışkanlık kendi süresine göre değerlendirilir', () => {
    const ranking = getConsistencyRanking([a, b], TODAY)
    // A: 30 günde 3 gün (%10) · B: eklendiği 2 günün 1'inde (%50)
    expect(ranking.map((r) => [r.habit.name, r.rate30])).toEqual([
      ['B', 50],
      ['A', 10],
    ])
  })
})

describe('getOverview', () => {
  it('genel özeti hesaplar', () => {
    expect(getOverview([a, b], TODAY)).toMatchObject({
      totalHabits: 2,
      doneToday: 2,
      totalCompletions: 4,
      best: { habit: a, longestStreak: 3 },
    })
  })

  it('alışkanlık yokken boş özet', () => {
    expect(getOverview([], TODAY)).toEqual({
      totalHabits: 0,
      doneToday: 0,
      averageRate30: 0,
      best: null,
      totalCompletions: 0,
    })
  })
})
