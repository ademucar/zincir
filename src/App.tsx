import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './components/Layout'
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
  return <RouterProvider router={router} />
}
