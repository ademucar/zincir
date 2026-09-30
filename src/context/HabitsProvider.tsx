import { useCallback, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createSampleHabits } from '../constants/sampleHabits'
import { useToday } from '../hooks/useToday'
import type { IHabit, IHabitFormData } from '../interfaces/habit'
import { createId } from '../utils/id'
import { HabitsContext, type IHabitsContext, type IRemovedHabit } from './habitsContext'
import { createHabitsStore } from './habitsStore'

export function HabitsProvider({ children }: { children: ReactNode }) {
  // Depo (ve LocalStorage okuması) yalnızca bir kez oluşturulur
  const [store] = useState(createHabitsStore)
  const { habits, storageError } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const today = useToday()

  const addHabit = useCallback(
    (data: IHabitFormData): IHabit => {
      const now = new Date().toISOString()
      const habit: IHabit = {
        id: createId(),
        name: data.name.trim(),
        description: data.description.trim(),
        icon: data.icon,
        color: data.color,
        category: data.category,
        completions: [],
        createdAt: now,
        updatedAt: now,
      }
      store.dispatch({ type: 'add', habit })
      return habit
    },
    [store],
  )

  const updateHabit = useCallback(
    (id: string, data: IHabitFormData) => {
      store.dispatch({ type: 'update', id, data, updatedAt: new Date().toISOString() })
    },
    [store],
  )

  const toggleToday = useCallback(
    (id: string) => {
      store.dispatch({ type: 'toggleDay', id, day: today, updatedAt: new Date().toISOString() })
    },
    [store, today],
  )

  const removeHabit = useCallback(
    (id: string): IRemovedHabit | null => {
      const current = store.getSnapshot().habits
      const index = current.findIndex((habit) => habit.id === id)
      if (index === -1) return null
      store.dispatch({ type: 'remove', id })
      return { habit: current[index], index }
    },
    [store],
  )

  const restoreHabit = useCallback(
    (removed: IRemovedHabit) => store.dispatch({ type: 'restore', ...removed }),
    [store],
  )

  const loadSampleHabits = useCallback(
    () => store.dispatch({ type: 'replaceAll', habits: createSampleHabits(today) }),
    [store, today],
  )

  const value = useMemo<IHabitsContext>(
    () => ({
      habits,
      today,
      storageError,
      dismissStorageError: store.dismissStorageError,
      addHabit,
      updateHabit,
      toggleToday,
      removeHabit,
      restoreHabit,
      loadSampleHabits,
    }),
    [habits, today, storageError, store, addHabit, updateHabit, toggleToday, removeHabit, restoreHabit, loadSampleHabits],
  )

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
}
