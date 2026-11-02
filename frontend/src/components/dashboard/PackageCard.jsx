import React from 'react';
import { ArrowRight, Handshake, Phone, Star } from 'lucide-react';
import CardActionsMenu from './CardActionsMenu';

function getAction(item) {
  const deal = String(item.deal_status || '').toLowerCase();
  const status = String(item.status || '').toLowerCase();
  if (item.reviewed) return null;
  if (status === 'delivered' || status === 'completed') return 'review';
  if (deal === 'confirmed' || deal === 'deal_made' || status === 'deal_made') return 'delivered';
  if (item.inquiry_count > 0 || item.is_paused_by_inquiries) return 'confirm';
  return 'contact';
}

export default function DashboardPackageCard({ item, copy, onAction, onEdit, onToggle, onDelete, onView }) {
  const action = getAction(item);
  const route = item.from_city && item.to_city
    ? `${item.from_city} → ${item.to_city}`
    : item.route === 'ADD_TO_DXB' ? 'Addis Ababa → Dubai' : 'Dubai → Addis Ababa';
  const status = item.status === 'delivered' || item.status === 'completed' ? 'Completed' : item.deal_status === 'confirmed' ? 'Deal confirmed' : item.inquiry_count > 0 ? 'Deal discussed' : 'Open';
  const actionLabels = { contact: copy.contact, confirm: copy.confirmDeal, delivered: copy.markDelivered, review: copy.leaveReview };

  return (
    <article className="rounded-2xl border border-[#D2DDD8] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-xs font-extrabold text-[#0D3326]">
            <span className="truncate">{route}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#B89358]" aria-hidden="true" />
          </p>
          <h3 className="mt-1 truncate text-sm font-bold text-[#0D3326]">{item.title}</h3>
        </div>
        <p className="shrink-0 text-sm font-extrabold text-[#8F6C3D]">{item.reward}</p>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
        <span className="rounded-full bg-[#E5F0EB] px-2 py-1 font-bold text-[#0D3326]">{status}</span>
        <span>{item.weight} {copy.weight}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">{item.desc}</p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#D2DDD8] pt-3">
        {action ? (
          <button type="button" onClick={() => onAction(action, item)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0D3326] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#144937] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3326]">
            {action === 'contact' ? <Phone className="h-4 w-4" aria-hidden="true" /> : action === 'confirm' ? <Handshake className="h-4 w-4" aria-hidden="true" /> : action === 'review' ? <Star className="h-4 w-4" aria-hidden="true" /> : null}
            {actionLabels[action]}
          </button>
        ) : <span className="text-xs font-semibold text-emerald-700">{copy.reviewed}</span>}
        <CardActionsMenu copy={copy} paused={item.is_paused_by_inquiries} onView={() => onView(item)} onEdit={() => onEdit(item)} onToggle={onToggle ? () => onToggle(item) : undefined} onDelete={() => onDelete(item)} />
      </div>
    </article>
  );
}
