import {
  House,
  MessageCircleMore,
  PackagePlus,
  Search,
  ShieldCheck,
  UserCircle2,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Home', icon: House, to: '/dashboard' },
  { label: 'Search', icon: Search, to: '/travelers' },
  { label: 'Post', icon: PackagePlus, to: '/post-shipment' },
  { label: 'Messages', icon: MessageCircleMore, to: '/messages' },
  { label: 'Profile', icon: UserCircle2, to: '/profile' },
]

function AppShell() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 pb-24 pt-4 lg:px-6 lg:pb-6">
      <aside className="surface-card sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 p-5 lg:flex lg:flex-col">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-700 font-bold text-white">
            PB
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">PeerBridge</p>
            <p className="text-sm text-slate-500">UAE to Ethiopia</p>
          </div>
        </NavLink>

        <nav className="mt-8 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex min-h-13 items-center gap-3 rounded-2xl px-4 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-700 text-white shadow-lg shadow-brand-200'
                    : 'text-slate-600 hover:bg-brand-50 hover:text-brand-800',
                ].join(' ')
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="surface-muted mt-auto p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            Protected payments
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Funds stay secured until sender and receiver confirm a safe handoff.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="surface-card mb-4 flex items-center justify-between px-3 py-3 lg:hidden">
          <a href="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-700 font-bold text-white">
            PB
          </div>
          </a>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
            <ShieldCheck className="h-4 w-4" />
            Verified network
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <nav className="surface-card fixed inset-x-4 bottom-4 z-40 flex items-center justify-around px-3 py-2 lg:hidden">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex min-w-14 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition',
                isActive ? 'bg-brand-700 text-white' : 'text-slate-500',
              ].join(' ')
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AppShell
