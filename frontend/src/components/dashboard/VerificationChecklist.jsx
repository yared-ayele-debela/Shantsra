import React from 'react';
import { CheckCircle2, FileCheck2, Pencil, Phone, ShieldCheck } from 'lucide-react';

export default function VerificationChecklist({ user, copy, onContinue, onEdit }) {
  const checks = [
    { label: copy.phone, done: Boolean(user.phone), icon: Phone },
    { label: copy.uploadedDocument, done: user.id_document_status === 'approved', icon: FileCheck2 },
    { label: copy.profile, done: Boolean(user.name && user.email), icon: Pencil },
  ];
  const completed = checks.filter((check) => check.done).length;

  return (
    <section className="rounded-2xl border border-[#B8D5C7] bg-white p-4 shadow-sm sm:p-5" aria-labelledby="verification-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="verification-title" className="flex items-center gap-2 font-display text-sm font-bold text-[#0D3326]">
            <ShieldCheck className="h-5 w-5 text-[#8F6C3D]" aria-hidden="true" /> {copy.verification}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{completed} of {checks.length} verified</p>
        </div>
        <span className="rounded-full bg-[#E5F0EB] px-2 py-1 text-[10px] font-extrabold text-[#0D3326]">
          {Math.round((completed / checks.length) * 100)}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#20C073] transition-all" style={{ width: `${(completed / checks.length) * 100}%` }} />
      </div>
      <ul className="mt-3 space-y-2">
        {checks.map(({ label, done, icon: Icon }) => (
          <li key={label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-600"><Icon className="h-4 w-4 text-slate-400" aria-hidden="true" /> {label}</span>
            {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label={copy.verified} /> : <span className="text-slate-400">{copy.pending}</span>}
          </li>
        ))}
      </ul>
      <button type="button" onClick={completed < checks.length ? onContinue : onEdit} className="mt-4 min-h-11 w-full rounded-xl bg-[#0D3326] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#144937] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3326]">
        {completed < checks.length ? copy.continueVerification : copy.editProfile}
      </button>
    </section>
  );
}
