import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSampleHabits } from '../constants/sampleHabits'
import { BACKUP_KEY, isValidHabit, loadHabits, saveHabits, STORAGE_KEY } from './storage'

/** Testler Node'da çalıştığı için basit bir bellek içi localStorage */
function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => [...store.keys()][index] ?? null,
    removeItem: (key) => void store.delete(key),
    setItem: (key, value) => void store.set(key, String(value)),
  }
}

beforeEach(() => vi.stubGlobal('localStorage', createMemoryStorage()))
afterEach(() => vi.unstubAllGlobals())

describe('storage', () => {
  it('kayıt yoksa boş liste ve hatasız döner', () => {
    expect(loadHabits()).toEqual({ habits: [], error: null })
  })

  it('kaydedilen alışkanlıkları aynen geri okur', () => {
    const habits = createSampleHabits('2026-10-12')
    expect(saveHabits(habits)).toBe(true)
    expect(loadHabits()).toEqual({ habits, error: null })
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).version).toBe(1)
  })

  it('bozuk JSON uygulamayı çökertmez, ham veri yedeklenir', () => {
    localStorage.setItem(STORAGE_KEY, '{ bozuk veri')
    const result = loadHabits()
    expect(result.habits).toEqual([])
    expect(result.error).toMatch(/okunamadı/)
    expect(localStorage.getItem(BACKUP_KEY)).toBe('{ bozuk veri')
  })

  it('tek tek bozuk kayıtları atlar, sağlam olanları yükler', () => {
    const [valid] = createSampleHabits('2026-10-12')
    const broken = { ...valid, id: 'x', completions: ['2026-02-30'] }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, habits: [valid, broken, 42] }))

    const result = loadHabits()
    expect(result.habits).toEqual([valid])
    expect(result.error).toMatch(/2 kayıt/)
    expect(localStorage.getItem(BACKUP_KEY)).not.toBeNull()
  })

  it('depolama yazılamazsa false döner (kota dolu, gizli mod)', () => {
    vi.stubGlobal('localStorage', {
      ...createMemoryStorage(),
      setItem: () => {
        throw new DOMException('QuotaExceededError')
      },
    })
    expect(saveHabits([])).toBe(false)
  })
})

describe('createSampleHabits', () => {
  it('tüm örnekler geçerli ve bugüne göre tarihlenmiş', () => {
    const habits = createSampleHabits('2026-10-12')
    expect(habits).toHaveLength(6)
    expect(habits.every(isValidHabit)).toBe(true)
    habits.forEach((h) => h.completions.forEach((d) => expect(d <= '2026-10-12').toBe(true)))
  })
})
