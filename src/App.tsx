import { createBrowserRouter, RouterProvider } from 'react-router'
import { ToastProvider } from './components/ToastProvider'
import { HabitsProvider } from './context/HabitsProvider'
import { routes } from './routes'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <HabitsProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </HabitsProvider>
  )
}
