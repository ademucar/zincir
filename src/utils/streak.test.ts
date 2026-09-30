import { describe, expect, it } from 'vitest'
import type { IHabit } from '../interfaces/habit'
import {
  getCompletionRate,
  getCurrentStreak,
  getHabitStats,
  getLongestStreak,
  toggleCompletion,
} from './streak'

const TODAY = '2026-10-12'

describe('getCurrentStreak', () => {
  it('hiç yapılmamışsa 0', () => {
    expect(getCurrentStreak([], TODAY)).toBe(0)
  })

  it('bugün dahil kesintisiz günleri sayar', () => {
    expect(getCurrentStreak(['2026-10-10', '2026-10-11', '2026-10-12'], TODAY)).toBe(3)
  })

  it('bugün henüz yapılmadıysa zincir kırılmaz, dünden sayar', () => {
    expect(getCurrentStreak(['2026-10-10', '2026-10-11'], TODAY)).toBe(2)
  })

  it('dün de yapılmadıysa zincir kırılmıştır', () => {
    expect(getCurrentStreak(['2026-10-09', '2026-10-10'], TODAY)).toBe(0)
  })

  it('boşluktan öncesini saymaz', () => {
    expect(getCurrentStreak(['2026-10-08', '2026-10-10', '2026-10-11', '2026-10-12'], TODAY)).toBe(3)
  })

  it('ay geçişinde de kesintisiz sayar', () => {
    expect(getCurrentStreak(['2026-09-29', '2026-09-30', '2026-10-01'], '2026-10-01')).toBe(3)
  })
})

describe('getLongestStreak', () => {
  it('en uzun kesintisiz seriyi bulur', () => {
    const days = ['2026-10-01', '2026-10-02', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-09']
    expect(getLongestStreak(days)).toBe(3)
  })

  it('sırasız ve tekrarlı veride de doğru çalışır', () => {
    expect(getLongestStreak(['2026-10-03', '2026-10-01', '2026-10-02', '2026-10-02'])).toBe(3)
  })

  it('boş listede 0', () => {
    expect(getLongestStreak([])).toBe(0)
  })
})

describe('getCompletionRate', () => {
  it('son 30 günün yüzdesini hesaplar', () => {
    const done = Array.from({ length: 15 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`)
    // 12 Ekim'den geriye 30 gün: 13 Eylül – 12 Ekim; 1–12 Ekim arası 12 gün yapılmış
    expect(getCompletionRate(done, TODAY, '2026-01-01')).toBe(40)
  })

  it('yeni alışkanlıkta oluşturulduğu günden itibaren hesaplar', () => {
    expect(getCompletionRate(['2026-10-10', '2026-10-11', '2026-10-12'], TODAY, '2026-10-10')).toBe(100)
  })

  it('bugün oluşturulup yapılmadıysa 0, yapıldıysa 100', () => {
    expect(getCompletionRate([], TODAY, TODAY)).toBe(0)
    expect(getCompletionRate([TODAY], TODAY, TODAY)).toBe(100)
  })
})

describe('toggleCompletion', () => {
  it('yoksa ekler ve sıralı tutar', () => {
    expect(toggleCompletion(['2026-10-10', '2026-10-12'], '2026-10-11')).toEqual([
      '2026-10-10',
      '2026-10-11',
      '2026-10-12',
    ])
  })

  it('varsa çıkarır', () => {
    expect(toggleCompletion(['2026-10-11', '2026-10-12'], '2026-10-12')).toEqual(['2026-10-11'])
  })
})

describe('getHabitStats', () => {
  it('tüm değerleri birlikte üretir', () => {
    const habit: IHabit = {
      id: '1',
      name: 'Kitap oku',
      description: '',
      icon: '📚',
      color: 'violet',
      category: 'egitim',
      completions: ['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-11', '2026-10-12'],
      createdAt: new Date(2026, 9, 6, 10, 0).toISOString(),
      updatedAt: new Date(2026, 9, 12, 10, 0).toISOString(),
    }

    const stats = getHabitStats(habit, TODAY)

    expect(stats.doneToday).toBe(true)
    expect(stats.currentStreak).toBe(2)
    expect(stats.longestStreak).toBe(3)
    expect(stats.totalCompletions).toBe(5)
    expect(stats.rate30).toBe(71) // 7 günde 5 gün
    expect(stats.last7Days.map((d) => d.done)).toEqual([true, true, true, false, false, true, true])
    expect(stats.last7Days[6].date).toBe(TODAY)
  })
})
