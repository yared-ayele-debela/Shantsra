import { BadgeCheck, CalendarDays, MapPin, Star, Weight } from 'lucide-react'

function TravelerCard({ traveler, onRequest }) {
  return (
    <article className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-base font-semibold text-brand-800">
            {traveler.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">{traveler.name}</h3>
              {traveler.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-slate-700">{traveler.rating}</span>
              <span>({traveler.reviews} reviews)</span>
            </div>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {traveler.price}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent-600" />
          <span>{traveler.route}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-accent-600" />
          <span>{traveler.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Weight className="h-4 w-4 text-accent-600" />
          <span>{traveler.weight}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">{traveler.language}</p>
        <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => onRequest(traveler)}>
          Request Delivery
        </button>
      </div>
    </article>
  )
}

export default TravelerCard
