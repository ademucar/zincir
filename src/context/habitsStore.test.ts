import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { IHabit } from '../interfaces/habit'
import { STORAGE_KEY } from '../utils/storage'
import { createHabitsStore, SAVE_FAILED_MESSAGE } from './habitsStore'

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

const habit = (id: string): IHabit => ({
  id,
  name: `Alışkanlık ${id}`,
  description: '',
  icon: '💧',
  color: 'sky',
  category: 'saglik',
  completions: [],
  createdAt: '2026-10-01T09:00:00.000Z',
  updatedAt: '2026-10-01T09:00:00.000Z',
})

/** Başka bir sekmenin LocalStorage'ı değiştirdiğini taklit eder */
function fireStorageEvent(key: string) {
  window.dispatchEvent(Object.assign(new Event('storage'), { key }))
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createMemoryStorage())
  vi.stubGlobal('window', new EventTarget())
})
afterEach(() => vi.unstubAllGlobals())

describe('habitsStore', () => {
  it('başlangıçta LocalStorage içeriğini okur', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, habits: [habit('a')] }))
    expect(createHabitsStore().getSnapshot().habits.map((h) => h.id)).toEqual(['a'])
  })

  it('dispatch sonucu hemen kaydeder ve dinleyicileri haberdar eder', () => {
    const store = createHabitsStore()
    const listener = vi.fn()
    store.subscribe(listener)

    store.dispatch({ type: 'add', habit: habit('a') })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).habits[0].id).toBe('a')
  })

  it('değişiklik yaratmayan eylemde snapshot aynı kalır, render tetiklenmez', () => {
    const store = createHabitsStore()
    store.dispatch({ type: 'add', habit: habit('a') })
    const before = store.getSnapshot()
    const listener = vi.fn()
    store.subscribe(listener)

    // Zaten listede olan alışkanlığı "geri almak" durumu değiştirmez
    store.dispatch({ type: 'restore', habit: habit('a'), index: 0 })

    expect(store.getSnapshot()).toBe(before)
    expect(listener).not.toHaveBeenCalled()
  })

  it('kaydetme başarısız olursa uyarı gösterir, uyarı kapatılabilir', () => {
    const store = createHabitsStore()
    vi.stubGlobal('localStorage', {
      ...createMemoryStorage(),
      setItem: () => {
        throw new DOMException('QuotaExceededError')
      },
    })

    store.dispatch({ type: 'add', habit: habit('a') })
    expect(store.getSnapshot().storageError).toBe(SAVE_FAILED_MESSAGE)
    expect(store.getSnapshot().habits).toHaveLength(1) // oturum boyunca çalışmaya devam eder

    store.dismissStorageError()
    expect(store.getSnapshot().storageError).toBeNull()
  })

  it('başka sekmedeki değişikliği alır', () => {
    const store = createHabitsStore()
    const listener = vi.fn()
    store.subscribe(listener)

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, habits: [habit('x')] }))
    fireStorageEvent(STORAGE_KEY)

    expect(store.getSnapshot().habits.map((h) => h.id)).toEqual(['x'])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('ilgisiz anahtar değişikliklerini ve abonelik bittikten sonraki olayları yok sayar', () => {
    const store = createHabitsStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    fireStorageEvent('zincir.theme')
    expect(listener).not.toHaveBeenCalled()

    unsubscribe()
    fireStorageEvent(STORAGE_KEY)
    expect(listener).not.toHaveBeenCalled()
  })
})
