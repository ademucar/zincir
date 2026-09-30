import { createContext } from 'react'
import type { DateKey, IHabit, IHabitFormData } from '../interfaces/habit'

/** Silinen alışkanlık ve eski konumu; "geri al" için saklanır */
export interface IRemovedHabit {
  habit: IHabit
  index: number
}

export interface IHabitsContext {
  habits: IHabit[]
  /** Bugünün anahtarı; gece yarısı kendiliğinden güncellenir */
  today: DateKey
  /** Depolama okunamadı / yazılamadı uyarısı */
  storageError: string | null
  dismissStorageError: () => void

  addHabit: (data: IHabitFormData) => IHabit
  updateHabit: (id: string, data: IHabitFormData) => void
  toggleToday: (id: string) => void
  /** Geçmiş bir günü işaretler / kaldırır (unutulan günü düzeltmek için); gelecek günler yok sayılır */
  toggleDay: (id: string, day: DateKey) => void
  removeHabit: (id: string) => IRemovedHabit | null
  restoreHabit: (removed: IRemovedHabit) => void
  loadSampleHabits: () => void
}

export const HabitsContext = createContext<IHabitsContext | null>(null)
