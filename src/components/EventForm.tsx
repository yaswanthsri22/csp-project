import { useState, type FormEvent } from 'react';
import { X, Loader2, AlertCircle, IndianRupee, Users, MapPin } from 'lucide-react';
import { supabase, type EventRow, type EventInput, CELEBRATION_CATEGORIES, OFFICE_CATEGORIES } from '@/lib/supabase';

type Props = {
  userId: string;
  event?: EventRow | null;
  onClose: () => void;
  onSaved: () => void;
};

const STATUSES: EventRow['status'][] = ['planned', 'in-progress', 'completed', 'cancelled'];
const PRIORITIES: EventRow['priority'][] = ['low', 'medium', 'high'];

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

export default function EventForm({ userId, event, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [category, setCategory] = useState(event?.category ?? 'Wedding');
  const [isOffice, setIsOffice] = useState(() => {
    if (event) return (OFFICE_CATEGORIES as readonly string[]).includes(event.category);
    return false;
  });
  const [location, setLocation] = useState(event?.location ?? '');
  const [startTime, setStartTime] = useState(event ? toLocalInput(event.start_time) : '');
  const [endTime, setEndTime] = useState(event ? toLocalInput(event.end_time) : '');
  const [status, setStatus] = useState<EventRow['status']>(event?.status ?? 'planned');
  const [priority, setPriority] = useState<EventRow['priority']>(event?.priority ?? 'medium');
  const [budget, setBudget] = useState(event?.budget?.toString() ?? '');
  const [guestCount, setGuestCount] = useState(event?.guest_count?.toString() ?? '');
  const [venueAddress, setVenueAddress] = useState(event?.venue_address ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!event;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter an event title.');
      return;
    }
    if (!startTime || !endTime) {
      setError('Please set both start and end times.');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setError('End time must be after the start time.');
      return;
    }

    const payload: EventInput = {
      title: title.trim(),
      description: description.trim() || null,
      category,
      location: location.trim() || null,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      status,
      priority,
      budget: budget ? parseFloat(budget) : null,
      guest_count: guestCount ? parseInt(guestCount, 10) : null,
      venue_address: venueAddress.trim() || null,
    };

    setLoading(true);
    let result;
    if (isEdit && event) {
      result = await supabase.from('events').update(payload).eq('id', event.id).eq('user_id', userId);
    } else {
      result = await supabase.from('events').insert({ ...payload, user_id: userId });
    }
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    onSaved();
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gold-500/15 focus:border-saffron-500/50 focus:ring-2 focus:ring-saffron-500/20 outline-none transition-all text-white placeholder:text-gold-300/30';
  const labelClass = 'block text-sm font-medium text-gold-200/80 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-maroon-900 border border-gold-500/15 rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-maroon-900/95 backdrop-blur border-b border-gold-500/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">{isEdit ? 'Edit Event' : 'Plan New Event'}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-gold-200/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Event type toggle */}
          <div>
            <label className={labelClass}>Event Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setIsOffice(false); setCategory(CELEBRATION_CATEGORIES[0]); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  !isOffice ? 'bg-gradient-to-r from-saffron-500 to-maroon-600 text-white shadow-lg shadow-saffron-500/20' : 'bg-white/5 border border-gold-500/15 text-gold-200/60 hover:bg-white/10'
                }`}
              >
                Celebration
              </button>
              <button
                type="button"
                onClick={() => { setIsOffice(true); setCategory(OFFICE_CATEGORIES[0]); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isOffice ? 'bg-gradient-to-r from-saffron-500 to-maroon-600 text-white shadow-lg shadow-saffron-500/20' : 'bg-white/5 border border-gold-500/15 text-gold-200/60 hover:bg-white/10'
                }`}
              >
                Office / Work
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Event Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={isOffice ? "e.g. Q3 Strategy Review" : "e.g. Ananya & Rahul's Wedding"}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add details about this event..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                <optgroup label="Celebrations" className="bg-maroon-800">
                  {CELEBRATION_CATEGORIES.map((c) => <option key={c} value={c} className="bg-maroon-800">{c}</option>)}
                </optgroup>
                <optgroup label="Office / Work" className="bg-maroon-800">
                  {OFFICE_CATEGORIES.map((c) => <option key={c} value={c} className="bg-maroon-800">{c}</option>)}
                </optgroup>
                <option value="Other" className="bg-maroon-800">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Location / Venue Name</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isOffice ? "e.g. Conference Room A" : "e.g. Grand Palace, Hyderabad"}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{isOffice ? 'Meeting Address / Link' : 'Venue Address'}</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-300/40" />
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder={isOffice ? "Address or video call link" : "Full address of the venue"}
                className={`${inputClass} pl-11`}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date & Time *</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date & Time *</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{isOffice ? 'Cost (INR)' : 'Budget (INR)'}</label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-300/40" />
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min="0"
                  placeholder="50000"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{isOffice ? 'Attendees' : 'Expected Guests'}</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-300/40" />
                <input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  min="0"
                  placeholder="200"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as EventRow['status'])} className={inputClass}>
                {STATUSES.map((s) => <option key={s} value={s} className="bg-maroon-800">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as EventRow['priority'])} className={inputClass}>
                {PRIORITIES.map((p) => <option key={p} value={p} className="bg-maroon-800">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-gold-500/15 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 font-semibold transition-all shadow-lg shadow-saffron-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEdit ? 'Save Changes' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
