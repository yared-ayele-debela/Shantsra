import { BadgeCheck, CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react'
import { orderSummary } from '../data/mockData.js'

function CheckoutPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
      <section className="space-y-4">
        <div className="surface-card p-5 sm:p-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Booking checkout</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review your traveler, protected pricing, and release conditions before confirming.
          </p>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Payment details</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label>
              <span className="label-text">Cardholder name</span>
              <input className="input-field" defaultValue="Mimi Tesfaye" />
            </label>
            <label>
              <span className="label-text">Card number</span>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <input className="input-field pl-11" defaultValue="4242 4242 4242 4242" />
              </div>
            </label>
            <label>
              <span className="label-text">Expiry</span>
              <input className="input-field" defaultValue="08 / 28" />
            </label>
            <label>
              <span className="label-text">CVV</span>
              <input className="input-field" defaultValue="123" />
            </label>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          <div className="surface-muted mt-4 space-y-3 p-4 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <span>Shipment</span>
              <span className="font-medium text-slate-900">{orderSummary.shipment}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Route</span>
              <span className="font-medium text-slate-900">{orderSummary.route}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Traveler</span>
              <span className="font-medium text-slate-900">{orderSummary.traveler}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Travel date</span>
              <span className="font-medium text-slate-900">{orderSummary.travelDate}</span>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between gap-4">
                <span>Base price</span>
                <span>{orderSummary.basePrice}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <span>Platform commission</span>
                <span>{orderSummary.commission}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <span>Protection fee</span>
                <span>{orderSummary.insurance}</span>
              </div>
              <div className="mt-4 flex justify-between gap-4 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{orderSummary.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            Trust badges
          </div>
          <div className="mt-4 space-y-3">
            {[
              'Verified traveler identity',
              'Funds protected in escrow',
              'Support available until delivery',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3">
                <BadgeCheck className="h-5 w-5 text-brand-600" />
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-4">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            <LockKeyhole className="h-4 w-4" />
            Protected payment
          </div>
          <button type="button" className="btn-primary w-full">
            Confirm Booking
          </button>
        </div>
      </aside>
    </div>
  )
}

export default CheckoutPage
