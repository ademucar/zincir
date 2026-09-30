import type { DateKey, IHabit, IHabitFormData } from '../interfaces/habit'
import { toggleCompletion } from '../utils/streak'

export type HabitsAction =
  | { type: 'add'; habit: IHabit }
  | { type: 'update'; id: string; data: IHabitFormData; updatedAt: string }
  | { type: 'toggleDay'; id: string; day: DateKey; updatedAt: string }
  | { type: 'remove'; id: string }
  /** Silmeyi geri al: alışkanlık eski sırasına döner */
  | { type: 'restore'; habit: IHabit; index: number }
  /** Örnek veri yükleme veya başka sekmedeki değişikliği alma */
  | { type: 'replaceAll'; habits: IHabit[] }

/** Saf reducer: aynı girdi → aynı çıktı; tarih/id gibi değerler eylemle birlikte gelir. */
export function habitsReducer(state: IHabit[], action: HabitsAction): IHabit[] {
  switch (action.type) {
    case 'add':
      return [...state, action.habit]

    case 'update':
      return state.map((habit) =>
        habit.id === action.id
          ? {
              ...habit,
              ...action.data,
              name: action.data.name.trim(),
              description: action.data.description.trim(),
              updatedAt: action.updatedAt,
            }
          : habit,
      )

    case 'toggleDay':
      return state.map((habit) =>
        habit.id === action.id
          ? {
              ...habit,
              completions: toggleCompletion(habit.completions, action.day),
              updatedAt: action.updatedAt,
            }
          : habit,
      )

    case 'remove':
      return state.filter((habit) => habit.id !== action.id)

    case 'restore': {
      if (state.some((habit) => habit.id === action.habit.id)) return state
      const next = [...state]
      next.splice(Math.min(action.index, next.length), 0, action.habit)
      return next
    }

    case 'replaceAll':
      return action.habits
  }
}
