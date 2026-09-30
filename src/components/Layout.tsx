import { Moon, Sun, TriangleAlert, X } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'
import { useHabits } from '../hooks/useHabits'
import { useTheme } from '../hooks/useTheme'
import { Logo } from './Logo'

const navItems = [
  { to: '/', label: 'Bugün', end: true },
  { to: '/istatistikler', label: 'İstatistikler', end: false },
]

export function Layout() {
  const { theme, toggleTheme } = useTheme()
  const { storageError, dismissStorageError } = useHabits()
  const isDark = theme === 'dark'

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow dark:focus:bg-zinc-900"
      >
        İçeriğe geç
      </a>

      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 rounded-lg">
            <Logo />
            <span className="text-lg font-bold tracking-tight">Zincir</span>
          </Link>

          <nav aria-label="Ana menü" className="ml-auto flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-200/70 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            className="grid size-9 place-items-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label={isDark ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
            title={isDark ? 'Aydınlık tema' : 'Karanlık tema'}
          >
            {isDark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
          </button>
        </div>
      </header>

      <main id="icerik" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {storageError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
          >
            <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p className="flex-1">{storageError}</p>
            <button
              type="button"
              onClick={dismissStorageError}
              className="-my-1 grid size-7 place-items-center rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20"
              aria-label="Uyarıyı kapat"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )}
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200/80 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 dark:border-zinc-800/80">
        Zincir · Verileriniz yalnızca bu tarayıcıda saklanır.
      </footer>
    </div>
  )
}

