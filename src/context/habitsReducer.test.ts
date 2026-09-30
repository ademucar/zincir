import { describe, expect, it } from 'vitest'
import type { IHabit } from '../interfaces/habit'
import { habitsReducer } from './habitsReducer'

const habit = (id: string, overrides: Partial<IHabit> = {}): IHabit => ({
  id,
  name: `Alışkanlık ${id}`,
  description: '',
  icon: '💧',
  color: 'sky',
  category: 'saglik',
  completions: [],
  createdAt: '2026-10-01T09:00:00.000Z',
  updatedAt: '2026-10-01T09:00:00.000Z',
  ...overrides,
})

const T = '2026-10-12T10:00:00.000Z'

describe('habitsReducer', () => {
  it('add: sona ekler', () => {
    const state = habitsReducer([habit('a')], { type: 'add', habit: habit('b') })
    expect(state.map((h) => h.id)).toEqual(['a', 'b'])
  })

  it('update: form alanlarını değiştirir, completions ve createdAt korunur', () => {
    const before = habit('a', { completions: ['2026-10-11'] })
    const [after] = habitsReducer([before], {
      type: 'update',
      id: 'a',
      data: { name: '  Yeni ad ', description: ' açıklama ', icon: '📚', color: 'violet', category: 'egitim' },
      updatedAt: T,
    })
    expect(after).toEqual({
      ...before,
      name: 'Yeni ad',
      description: 'açıklama',
      icon: '📚',
      color: 'violet',
      category: 'egitim',
      updatedAt: T,
    })
  })

  it('toggleDay: günü ekler ve tekrar çağrılınca çıkarır', () => {
    let state = habitsReducer([habit('a')], { type: 'toggleDay', id: 'a', day: '2026-10-12', updatedAt: T })
    expect(state[0].completions).toEqual(['2026-10-12'])
    state = habitsReducer(state, { type: 'toggleDay', id: 'a', day: '2026-10-12', updatedAt: T })
    expect(state[0].completions).toEqual([])
  })

  it('remove + restore: silinen alışkanlık eski sırasına döner', () => {
    const initial = [habit('a'), habit('b'), habit('c')]
    const removed = habitsReducer(initial, { type: 'remove', id: 'b' })
    expect(removed.map((h) => h.id)).toEqual(['a', 'c'])

    const restored = habitsReducer(removed, { type: 'restore', habit: initial[1], index: 1 })
    expect(restored.map((h) => h.id)).toEqual(['a', 'b', 'c'])
  })

  it('restore: iki kez geri alınırsa kopya oluşmaz', () => {
    const state = habitsReducer([habit('a')], { type: 'restore', habit: habit('a'), index: 0 })
    expect(state).toHaveLength(1)
  })

  it('durumu değiştirmez (yeni dizi döner)', () => {
    const initial = [habit('a')]
    const frozen = Object.freeze([...initial])
    expect(() => habitsReducer(frozen as IHabit[], { type: 'remove', id: 'a' })).not.toThrow()
    expect(frozen).toHaveLength(1)
  })
})
