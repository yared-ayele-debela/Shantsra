import React, { useState } from 'react';
import { X, Plane } from 'lucide-react';

export default function FlightVerificationModal({ isOpen, onClose, onSubmit }) {
  const [carrier, setCarrier] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!carrier || !flightNumber) return;

    onSubmit({
      carrier,
      flightNumber,
      departureDate,
      route: 'ADD ➔ DXB'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C160F]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-amber-100 max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Plane className="w-4 h-4" />
            </span>
            <h3 className="font-display text-lg font-bold text-[#1C160F]">Verify Flight Booking</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-[#1C160F]">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs text-slate-500">
          Add your flight details to show travelers that your trip has been verified.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Airline Carrier
            </label>
            <input 
              type="text" 
              placeholder="e.g. Emirates" 
              required 
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full border border-amber-200/80 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Flight Number
              </label>
              <input 
                type="text" 
                placeholder="e.g. EK724" 
                required 
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                className="w-full border border-amber-200/80 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Departure Date
              </label>
              <input 
                type="text" 
                placeholder="e.g. July 28, 2026" 
                required 
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full border border-amber-200/80 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500" 
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-50">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-[#1C160F] hover:bg-amber-500 hover:text-[#1C160F] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            >
              Verify Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
