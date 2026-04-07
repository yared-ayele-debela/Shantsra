import { BadgeCheck, MapPin, ShieldCheck, Star } from 'lucide-react'
import { pastDeliveries, profile, reviews } from '../data/mockData.js'

function ProfilePage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-4">
        <div className="surface-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-700 text-xl font-semibold text-white">
              MT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{profile.name}</h1>
                {profile.verified ? <BadgeCheck className="h-5 w-5 text-brand-600" /> : null}
              </div>
              <p className="mt-2 text-sm text-slate-500">{profile.email}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-accent-600" />
                {profile.city}
              </div>
              <p className="mt-3 text-sm text-slate-500">{profile.joined}</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600">{profile.bio}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="surface-muted p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {profile.rating} rating
              </div>
              <p className="mt-2 text-sm text-slate-500">{profile.reviews} public reviews</p>
            </div>
            <div className="surface-muted p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                Verification badge
              </div>
              <p className="mt-2 text-sm text-slate-500">Identity and phone number confirmed</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="surface-card p-5">
          <h2 className="text-xl font-semibold text-slate-900">Ratings and reviews</h2>
          <div className="mt-5 space-y-4">
            {reviews.map((review) => (
              <article key={review.author} className="surface-muted p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-900">{review.author}</p>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">{review.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-xl font-semibold text-slate-900">Past deliveries</h2>
          <div className="mt-5 space-y-3">
            {pastDeliveries.map((delivery) => (
              <div key={delivery.id} className="surface-muted flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{delivery.id}</p>
                  <p className="mt-1 text-sm text-slate-500">{delivery.route}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{delivery.date}</p>
                  <p className="mt-1 text-xs font-semibold text-brand-700">{delivery.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProfilePage
