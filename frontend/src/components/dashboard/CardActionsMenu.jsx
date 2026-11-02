import React, { useEffect, useRef, useState } from 'react';
import { Edit3, Eye, MoreVertical, RefreshCcw, Trash2 } from 'lucide-react';

export default function CardActionsMenu({ copy, onView, onEdit, onToggle, onDelete, paused }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const action = (callback) => {
    setOpen(false);
    callback?.();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label={copy.menu}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[#D2DDD8] text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3326]"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-[#D2DDD8] bg-white p-1 shadow-lg">
          <button type="button" role="menuitem" onClick={() => action(onView)} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Eye className="h-4 w-4" aria-hidden="true" /> {copy.viewDetails}
          </button>
          <button type="button" role="menuitem" onClick={() => action(onEdit)} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Edit3 className="h-4 w-4" aria-hidden="true" /> {copy.edit}
          </button>
          {onToggle && (
            <button type="button" role="menuitem" onClick={() => action(onToggle)} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <RefreshCcw className="h-4 w-4" aria-hidden="true" /> {paused ? copy.reactivate : copy.deactivate}
            </button>
          )}
          <button type="button" role="menuitem" onClick={() => action(onDelete)} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> {copy.delete}
          </button>
        </div>
      )}
    </div>
  );
}
