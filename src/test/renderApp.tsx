import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ToastProvider } from '../components/ToastProvider'
import { HabitsProvider } from '../context/HabitsProvider'
import { routes } from '../routes'

/** Uygulamayı gerçek sayfa tanımları ve sağlayıcılarla, bellek içi yönlendirmeyle çizer */
export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  const utils = render(
    <HabitsProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </HabitsProvider>,
  )
  return { ...utils, user, router }
}

/** LocalStorage'daki alışkanlıklar */
export function storedHabits(): { name: string; category: string; completions: string[] }[] {
  return JSON.parse(localStorage.getItem('zincir.habits.v1') ?? '{"habits":[]}').habits
}
