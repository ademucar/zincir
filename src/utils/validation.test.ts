import { describe, expect, it } from 'vitest'
import { EMPTY_HABIT_FORM } from '../constants/habit'
import type { IHabit, IHabitFormData } from '../interfaces/habit'
import { hasErrors, validateHabitForm } from './validation'

const form = (overrides: Partial<IHabitFormData> = {}): IHabitFormData => ({
  ...EMPTY_HABIT_FORM,
  name: 'Kitap oku',
  ...overrides,
})

const existing: IHabit[] = [
  {
    id: 'a',
    name: 'Su İç',
    description: '',
    icon: '💧',
    color: 'sky',
    category: 'saglik',
    completions: [],
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
  },
]

describe('validateHabitForm', () => {
  it('geçerli formda hata yok', () => {
    expect(hasErrors(validateHabitForm(form(), existing))).toBe(false)
  })

  it('boş ve çok kısa adı reddeder', () => {
    expect(validateHabitForm(form({ name: '   ' }), []).name).toBe('Alışkanlığa bir ad ver.')
    expect(validateHabitForm(form({ name: 'a' }), []).name).toMatch(/en az 2/)
  })

  it('çok uzun ad ve açıklamayı reddeder', () => {
    expect(validateHabitForm(form({ name: 'x'.repeat(41) }), []).name).toMatch(/en fazla 40/)
    expect(validateHabitForm(form({ description: 'x'.repeat(151) }), []).description).toMatch(/en fazla 150/)
  })

  it('aynı adı büyük/küçük harf ve Türkçe karakter duyarsız yakalar', () => {
    expect(validateHabitForm(form({ name: 'su iç' }), existing).name).toMatch(/zaten var/)
    expect(validateHabitForm(form({ name: '  SU İÇ ' }), existing).name).toMatch(/zaten var/)
  })

  it('düzenlenen alışkanlık kendi adını koruyabilir', () => {
    expect(validateHabitForm(form({ name: 'Su İç' }), existing, 'a').name).toBeUndefined()
  })

  it('listede olmayan simge, renk ve kategoriyi reddeder', () => {
    const errors = validateHabitForm(
      form({ icon: '🦄', color: 'pink' as never, category: 'oyun' as never }),
      [],
    )
    expect(Object.keys(errors).sort()).toEqual(['category', 'color', 'icon'])
  })
})
