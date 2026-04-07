import { ArrowRight, BellDot, PackageCheck, SearchCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { quickActions, recentActivities } from '../data/mockData.js'

function DashboardPage() {
  return (
    <div className="space-y-4">
      <section className="surface-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Hi Mimi, what do you want to do today?
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Start with one action and keep everything easy to follow.
            </p>
          </div>

          <div className="surface-muted flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <BellDot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">1 important update</p>
              <p className="text-sm text-slate-500">One traveler accepted your request</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-card p-5 sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white">
            <PackageCheck className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
            Main action
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Send a package</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Add route, date, and weight. Then choose a trusted traveler.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/post-shipment" className="btn-primary w-full sm:w-auto">
              Send Package
            </Link>
            <Link to="/travelers" className="btn-secondary w-full sm:w-auto">
              Find Traveler
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.title} to={action.href} className="surface-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{action.description}</p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                  {index === 0 ? <PackageCheck className="h-5 w-5" /> : <SearchCheck className="h-5 w-5" />}
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-600">
                Open
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
            <p className="mt-1 text-sm text-slate-500">Latest updates only</p>
          </div>
          <Link to="/tracking" className="text-sm font-semibold text-accent-600">
            View tracking
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {recentActivities.map((activity) => (
            <article key={activity.title} className="surface-muted flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                <p className="mt-1 text-sm text-slate-500">{activity.meta}</p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {activity.status}
                </span>
                <p className="mt-2 text-xs text-slate-400">{activity.time}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
