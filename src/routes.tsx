import type { RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { HabitDetailPage } from './pages/HabitDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { StatsPage } from './pages/StatsPage'
import { TodayPage } from './pages/TodayPage'

/** Uygulamanın sayfa tanımları (App ve testler aynı listeyi kullanır) */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'aliskanlik/:id', element: <HabitDetailPage /> },
      { path: 'istatistikler', element: <StatsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
