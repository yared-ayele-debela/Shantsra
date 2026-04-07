import { useState } from 'react'
import { CalendarDays, PackageOpen, ShieldCheck } from 'lucide-react'

function PostShipmentPage() {
  const [shipment, setShipment] = useState({
    from: 'Dubai',
    to: 'Addis Ababa',
    weight: '2.5 kg',
    description: 'Mobile phone, charger, and signed documents',
    date: '2026-04-16',
  })

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <section className="surface-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <PackageOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Post a shipment</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Keep typing minimal and let travelers match your route, weight, and preferred date.
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label-text">From</span>
              <select
                className="input-field"
                value={shipment.from}
                onChange={(event) => setShipment({ ...shipment, from: event.target.value })}
              >
                <option>Dubai</option>
                <option>Abu Dhabi</option>
                <option>Sharjah</option>
              </select>
            </label>

            <label>
              <span className="label-text">To</span>
              <select
                className="input-field"
                value={shipment.to}
                onChange={(event) => setShipment({ ...shipment, to: event.target.value })}
              >
                <option>Addis Ababa</option>
                <option>Dire Dawa</option>
                <option>Adama</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label-text">Weight</span>
              <select
                className="input-field"
                value={shipment.weight}
                onChange={(event) => setShipment({ ...shipment, weight: event.target.value })}
              >
                <option>1 kg</option>
                <option>2.5 kg</option>
                <option>5 kg</option>
                <option>10 kg</option>
              </select>
            </label>

            <label>
              <span className="label-text">Preferred date</span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  className="input-field pl-11"
                  value={shipment.date}
                  onChange={(event) => setShipment({ ...shipment, date: event.target.value })}
                />
              </div>
            </label>
          </div>

          <label>
            <span className="label-text">Description</span>
            <textarea
              className="min-h-36 w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              value={shipment.description}
              onChange={(event) => setShipment({ ...shipment, description: event.target.value })}
            />
          </label>
        </form>
      </section>

      <aside className="space-y-4">
        <div className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Shipment preview</h2>
          <div className="surface-muted mt-4 space-y-3 p-4 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <span>Route</span>
              <span className="font-medium text-slate-900">
                {shipment.from} to {shipment.to}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Weight</span>
              <span className="font-medium text-slate-900">{shipment.weight}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Date</span>
              <span className="font-medium text-slate-900">{shipment.date}</span>
            </div>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            Posting tips
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li>Use exact weight brackets so travelers can accept faster.</li>
            <li>Describe fragile or high-value items clearly for trust.</li>
            <li>Upload invoices later during secure checkout.</li>
          </ul>
        </div>
      </aside>

      <div className="surface-card fixed inset-x-4 bottom-24 z-30 p-3 lg:sticky lg:bottom-6 lg:col-span-2 lg:ml-auto lg:w-[22rem]">
        <button type="button" className="btn-primary w-full">
          Submit Shipment Request
        </button>
      </div>
    </div>
  )
}

export default PostShipmentPage
