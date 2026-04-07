import { CheckCheck, Circle } from 'lucide-react'

function StatusTimeline({ steps }) {
  return (
    <div className="surface-card p-5">
      <div className="space-y-5">
        {steps.map((step, index) => {
          const isComplete = step.status === 'complete'
          const isCurrent = step.status === 'current'

          return (
            <div key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'flex h-10 w-10 items-center justify-center rounded-full border',
                    isComplete
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : isCurrent
                        ? 'border-accent-500 bg-accent-50 text-accent-600'
                        : 'border-slate-200 bg-white text-slate-300',
                  ].join(' ')}
                >
                  {isComplete ? <CheckCheck className="h-5 w-5" /> : <Circle className="h-4 w-4 fill-current" />}
                </div>
                {index < steps.length - 1 ? <div className="mt-2 h-full w-px bg-slate-200" /> : null}
              </div>
              <div className="pb-6">
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-sm text-slate-500">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StatusTimeline
