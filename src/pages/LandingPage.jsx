import {
  ArrowRight,
  BadgeCheck,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  appStats,
  howItWorks,
  testimonials,
  trustIndicators,
} from '../data/mockData.js'

function LandingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 pb-28 sm:px-6 lg:px-8 lg:pb-8">
      <header className="surface-card sticky top-4 z-30 mb-6 flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-700 font-bold text-white">
            PB
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">PeerBridge</p>
            <p className="text-xs text-slate-500">Trusted delivery between UAE and Ethiopia</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 lg:flex">
          <a href="#how-it-works" className="transition hover:text-slate-900">
            How it works
          </a>
          <a href="#testimonials" className="transition hover:text-slate-900">
            Reviews
          </a>
          <a href="#faq" className="transition hover:text-slate-900">
            FAQ
          </a>
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Link to="/travelers" className="btn-secondary">
            Browse Travelers
          </Link>
          <Link to="/dashboard" className="btn-primary">
            Open App
          </Link>
        </div>
      </header>

      <section className="mb-6">
        <div className="relative overflow-hidden rounded-[28px] border border-white/70 shadow-(--shadow-card)">
          <div className="absolute inset-0 grid md:grid-cols-2">
            <div
              className="min-h-[220px] bg-cover bg-center"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, rgba(15,23,42,0.2), rgba(15,23,42,0.45)), url("https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1600")',
              }}
            />
            <div
              className="min-h-[220px] bg-cover bg-center"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, rgba(15,23,42,0.28), rgba(15,23,42,0.52)), url("https://images.pexels.com/photos/30177512/pexels-photo-30177512.jpeg?auto=compress&cs=tinysrgb&w=1600")',
              }}
            />
          </div>

          <div className="absolute inset-0 bg-linear-to-r from-slate-950/88 via-slate-950/62 to-slate-900/50" />

          <div className="relative z-10 flex min-h-[320px] flex-col justify-between p-6 sm:min-h-[360px] sm:p-8 lg:p-10">
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <span className="rounded-full bg-white/14 px-3 py-2 text-white backdrop-blur">
                Dubai skyline
              </span>
              <span className="rounded-full bg-white/14 px-3 py-2 text-white backdrop-blur">
                Addis Ababa skyline
              </span>
              <span className="rounded-full bg-brand-500/30 px-3 py-2 text-brand-50 backdrop-blur">
                Trusted cross-border handoff
              </span>
            </div>

            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 mt-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                UAE to Ethiopia delivery network
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                A professional delivery experience connecting Dubai and Ethiopia
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                Match with verified travelers, protect payments, and keep customers confident with
                clear pricing, fast communication, and reliable handoff tracking.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/post-shipment"
                  className="btn-primary border-white/25 shadow-none w-full sm:w-auto"
                >
                  Send Package
                </Link>
                <Link
                  to="/travelers"
                  className="btn-secondary w-full border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/15 hover:text-white sm:w-auto"
                >
                  Explore Travelers
                </Link>
              </div>
            </div>

            
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="surface-card overflow-hidden p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
            <Sparkles className="h-4 w-4" />
            Simple and trusted delivery
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Send packages easily between UAE and Ethiopia
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Find a trusted traveler, agree on the route, and track your package with less stress.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/post-shipment" className="btn-primary w-full sm:w-auto">
              Send Package
            </Link>
            <Link to="/travelers" className="btn-secondary w-full sm:w-auto">
              Become a Traveler
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              Safe payment
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
              <BadgeCheck className="h-4 w-4 text-brand-600" />
              Verified traveler
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {appStats.map((stat) => (
              <div key={stat.label} className="surface-muted p-4">
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-5 w-5 text-brand-600" />
              Why people trust PeerBridge
            </div>
            <div className="mt-4 space-y-3">
              {trustIndicators.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <BadgeCheck className="h-5 w-5 text-brand-600" />
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/travelers" className="btn-secondary mt-5 w-full">
              See Trusted Travelers
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Popular routes this week</p>
                <p className="mt-1 text-sm text-slate-500">Choose a route and start quickly</p>
              </div>
              <Plane className="h-5 w-5 text-accent-600" />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ['Dubai', 'Addis Ababa', '48 open requests'],
                ['Abu Dhabi', 'Addis Ababa', '29 open requests'],
                ['Sharjah', 'Dire Dawa', '17 open requests'],
              ].map(([from, to, demand]) => (
                <div key={`${from}-${to}`} className="surface-muted p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">
                      {from} <span className="text-slate-300">to</span> {to}
                    </p>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{demand}</p>
                </div>
              ))}
            </div>
          </div>
      </section>

      <section id="how-it-works" className="mt-6">
        <div className="surface-card p-6 sm:p-8">
          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-600">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              3 simple steps
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {howItWorks.map((step, index) => (
              <div key={step.title} className="surface-muted p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-700 text-sm font-semibold text-white">
                  0{index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="mt-6 grid gap-4">
        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-600">
                Real users
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Simple and trusted for senders
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
              <Star className="h-4 w-4 fill-current" />
              4.9 average rating
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="surface-muted p-5">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{testimonial.text}</p>
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="surface-card overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-600">
                Start now
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Choose a route and connect with a trusted traveler
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                Post your package or browse available travelers in a few taps.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link to="/post-shipment" className="btn-primary w-full sm:w-auto">
                Send Package
              </Link>
              <Link to="/travelers" className="btn-secondary w-full sm:w-auto">
                Explore Travelers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-6 hidden lg:block">
        <div className="surface-card px-6 py-5">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-base font-semibold text-slate-900">PeerBridge</p>
              <p className="mt-1 text-sm text-slate-500">
                Trusted package delivery between UAE and Ethiopia.
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#how-it-works" className="transition hover:text-slate-900">
                How it works
              </a>
              <a href="#testimonials" className="transition hover:text-slate-900">
                Reviews
              </a>
              <a href="#faq" className="transition hover:text-slate-900">
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <a
                href="https://instagram.com/peerbridge"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-slate-900"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/peerbridge"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-slate-900"
              >
                Facebook
              </a>
              <a
                href="https://x.com/peerbridge"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-slate-900"
              >
                X
              </a>
              <a
                href="https://linkedin.com/company/peerbridge"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-slate-900"
              >
                LinkedIn
              </a>
            </div>
          </div>
          <div className="mt-4 border-t border-brand-100 pt-4 text-sm text-slate-400">
            © 2026 PeerBridge
          </div>
        </div>
      </footer>

      <div className="surface-card fixed inset-x-4 bottom-4 z-40 p-3 lg:hidden">
        <div className="flex gap-3">
          <Link to="/post-shipment" className="btn-primary flex-1">
            Send Package
          </Link>
          <Link to="/travelers" className="btn-secondary flex-1">
            Find Traveler
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
