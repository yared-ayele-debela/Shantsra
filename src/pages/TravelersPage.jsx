import { useMemo, useState } from 'react'
import { BadgeCheck, Filter, ShieldCheck } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import TravelerCard from '../components/TravelerCard.jsx'
import { travelers } from '../data/mockData.js'

const filters = {
  from: ['Dubai', 'Abu Dhabi', 'Sharjah'],
  to: ['Addis Ababa', 'Dire Dawa'],
  date: ['Apr 16, 2026', 'Apr 18, 2026', 'Apr 22, 2026'],
  weight: ['Up to 3 kg', 'Up to 5 kg', 'Up to 10 kg'],
}

function TravelersPage() {
  const [selectedTraveler, setSelectedTraveler] = useState(null)
  const [form, setForm] = useState({
    from: 'Dubai',
    to: 'Addis Ababa',
    date: 'Apr 16, 2026',
    weight: 'Up to 5 kg',
  })

  const visibleTravelers = useMemo(
    () =>
      travelers.filter((traveler) => {
        const routeMatches =
          traveler.route.includes(form.from) &&
          traveler.route.includes(form.to)

        const dateMatches = traveler.date === form.date
        return routeMatches && dateMatches
      }),
    [form],
  )

  return (
    <div className="space-y-4">
      <section className="surface-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Find travelers</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Search active routes, compare ratings, and request delivery from verified travelers.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 sm:inline-flex">
            <ShieldCheck className="h-4 w-4" />
            Verified travelers only
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(filters).map(([key, options]) => (
            <label key={key}>
              <span className="label-text capitalize">{key}</span>
              <select
                className="input-field"
                value={form[key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="h-4 w-4" />
            <span>{visibleTravelers.length} travelers match your route</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <BadgeCheck className="h-4 w-4 text-brand-600" />
            Ratings and ID checks shown on every card
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {visibleTravelers.map((traveler) => (
            <TravelerCard key={traveler.id} traveler={traveler} onRequest={setSelectedTraveler} />
          ))}
        </div>
      </section>

      <Modal
        open={Boolean(selectedTraveler)}
        onClose={() => setSelectedTraveler(null)}
        title={selectedTraveler ? `Request ${selectedTraveler.name}` : ''}
        description="Send a protected delivery request before moving to secure checkout."
      >
        {selectedTraveler ? (
          <div className="space-y-4">
            <div className="surface-muted p-4">
              <p className="text-sm font-semibold text-slate-900">{selectedTraveler.route}</p>
              <p className="mt-1 text-sm text-slate-500">
                {selectedTraveler.date} • {selectedTraveler.weight}
              </p>
            </div>
            <label>
              <span className="label-text">Package summary</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                defaultValue="2.5 kg parcel containing electronics and documents."
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" className="btn-secondary w-full" onClick={() => setSelectedTraveler(null)}>
                Keep browsing
              </button>
              <a href="/checkout" className="btn-primary w-full text-center">
                Continue to Checkout
              </a>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default TravelersPage
