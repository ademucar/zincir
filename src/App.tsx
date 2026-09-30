import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/ToastProvider'
import { HabitsProvider } from './context/HabitsProvider'
import { HabitDetailPage } from './pages/HabitDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { StatsPage } from './pages/StatsPage'
import { TodayPage } from './pages/TodayPage'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'aliskanlik/:id', element: <HabitDetailPage /> },
      { path: 'istatistikler', element: <StatsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return (
    <HabitsProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </HabitsProvider>
  )
}
