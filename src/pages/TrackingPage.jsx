import { MapPin, ShieldCheck, Truck } from 'lucide-react'
import StatusTimeline from '../components/StatusTimeline.jsx'
import { trackingSteps } from '../data/mockData.js'

function TrackingPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <section className="surface-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Tracking</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Follow every delivery milestone from request creation to final handoff.
            </p>
          </div>
        </div>

        <div className="surface-muted mt-6 grid gap-4 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Order ID</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">PB-2841</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Route</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Dubai to Addis Ababa</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current state</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">In transit</p>
          </div>
        </div>

        <div className="mt-6">
          <StatusTimeline steps={trackingSteps} />
        </div>
      </section>

      <aside className="space-y-4">
        <div className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Live handoff details</h2>
          <div className="mt-4 space-y-4">
            <div className="surface-muted p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="h-4 w-4 text-accent-600" />
                Addis Ababa airport meetup
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Receiver will be notified once the traveler lands and confirms baggage claim.
              </p>
            </div>
            <div className="surface-muted p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                Release protection
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Funds remain secured until the receiver confirms the parcel is delivered.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default TrackingPage
