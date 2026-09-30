import { useContext } from 'react'
import { HabitsContext } from '../context/habitsContext'

/** Alışkanlık verisine ve işlemlerine erişim (HabitsProvider içinde kullanılmalı) */
export function useHabits() {
  const context = useContext(HabitsContext)
  if (!context) {
    throw new Error('useHabits, HabitsProvider içinde kullanılmalıdır.')
  }
  return context
}
