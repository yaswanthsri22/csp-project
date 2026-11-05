import { useEffect, useState, useCallback } from 'react';
import { Calendar, Plus, Clock, MapPin, Search, LogOut, Loader2, AlertCircle, Trash2, Edit3, Filter, X, IndianRupee, Users, ChevronRight, Bell, CheckSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type EventRow } from '@/lib/supabase';
import EventForm from './EventForm';
import RemindersView from './RemindersView';
import DailyTasksView from './DailyTasksView';

type Tab = 'events' | 'reminders' | 'tasks';

const STATUS_STYLES: Record<EventRow['status'], string> = {
  'planned': 'bg-gold-500/15 text-gold-300 border-gold-500/20',
  'in-progress': 'bg-saffron-500/15 text-saffron-300 border-saffron-500/20',
  'completed': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'cancelled': 'bg-red-500/15 text-red-300 border-red-500/20',
};

const PRIORITY_STYLES: Record<EventRow['priority'], string> = {
  'low': 'bg-gold-500/15 text-gold-400',
  'medium': 'bg-saffron-500/15 text-saffron-300',
  'high': 'bg-maroon-500/15 text-maroon-300',
};

const PRIORITY_DOT: Record<EventRow['priority'], string> = {
  'low': 'bg-gold-400',
  'medium': 'bg-saffron-400',
  'high': 'bg-maroon-400',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatINR(amount: number | null): string {
  if (!amount) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

type ViewMode = 'upcoming' | 'all' | 'today';

type Props = {
  onOpenEvent: (event: EventRow) => void;
};

export default function Dashboard({ onOpenEvent }: Props) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('events');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('upcoming');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEvents(data ?? []);
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    const { error } = await supabase.from('events').delete().eq('id', id).eq('user_id', user.id);
    setDeletingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingEvent(null);
    fetchEvents();
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86400000);

  let filtered = events;

  if (viewMode === 'upcoming') {
    filtered = filtered.filter((e) => new Date(e.start_time) >= now && e.status !== 'cancelled' && e.status !== 'completed');
  } else if (viewMode === 'today') {
    filtered = filtered.filter((e) => {
      const s = new Date(e.start_time);
      return s >= startOfToday && s < endOfToday;
    });
  }

  if (filterStatus !== 'all') {
    filtered = filtered.filter((e) => e.status === filterStatus);
  }

  if (filterCategory !== 'all') {
    filtered = filtered.filter((e) => e.category === filterCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      (e.description?.toLowerCase().includes(q) ?? false) ||
      (e.location?.toLowerCase().includes(q) ?? false) ||
      e.category.toLowerCase().includes(q)
    );
  }

  const totalEvents = events.length;
  const upcomingCount = events.filter((e) => new Date(e.start_time) >= now && e.status === 'planned').length;
  const completedCount = events.filter((e) => e.status === 'completed').length;
  const totalBudget = events.reduce((sum, e) => sum + (e.budget ?? 0), 0);
  const totalGuests = events.reduce((sum, e) => sum + (e.guest_count ?? 0), 0);

  const categories = Array.from(new Set(events.map((e) => e.category)));

  return (
    <div className="min-h-screen bg-maroon-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-maroon-950/80 border-b border-gold-500/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron-400 to-maroon-600 flex items-center justify-center shadow-lg shadow-saffron-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Event<span className="text-saffron-400">Planner</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gold-200/60 hidden sm:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-gold-500/15 text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab toggle */}
        <div className="flex gap-2 mb-8 p-1 rounded-xl bg-white/5 border border-gold-500/10 w-fit">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'events'
                ? 'bg-gradient-to-r from-saffron-500 to-maroon-600 text-white shadow-lg shadow-saffron-500/20'
                : 'text-gold-200/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Events
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'reminders'
                ? 'bg-gradient-to-r from-saffron-500 to-maroon-600 text-white shadow-lg shadow-saffron-500/20'
                : 'text-gold-200/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bell className="w-4 h-4" />
            Reminders
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-saffron-500 to-maroon-600 text-white shadow-lg shadow-saffron-500/20'
                : 'text-gold-200/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Tasks
          </button>
        </div>

        {activeTab === 'reminders' ? (
          <RemindersView />
        ) : activeTab === 'tasks' ? (
          <DailyTasksView />
        ) : (
        <>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Events', value: totalEvents.toString(), color: 'saffron', icon: Calendar },
            { label: 'Upcoming', value: upcomingCount.toString(), color: 'gold', icon: Clock },
            { label: 'Total Budget', value: formatINR(totalBudget), color: 'maroon', icon: IndianRupee, small: true },
            { label: 'Total Guests', value: totalGuests.toString(), color: 'emerald', icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl bg-white/5 border border-gold-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gold-200/60">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/15 flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                </div>
              </div>
              <p className={`font-bold ${stat.small ? 'text-xl' : 'text-3xl'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(['upcoming', 'today', 'all'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-saffron-500 to-maroon-600 text-white shadow-lg shadow-saffron-500/20'
                    : 'bg-white/5 border border-gold-500/10 text-gold-200/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {mode === 'upcoming' ? 'Upcoming' : mode === 'today' ? 'Today' : 'All Events'}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-300/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-gold-500/10 focus:border-saffron-500/50 focus:ring-2 focus:ring-saffron-500/20 outline-none transition-all text-white placeholder:text-gold-300/30 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-300/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-300/40 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-gold-500/10 focus:border-saffron-500/50 outline-none transition-all text-white text-sm appearance-none cursor-pointer"
              >
                <option value="all" className="bg-maroon-800">All Status</option>
                <option value="planned" className="bg-maroon-800">Planned</option>
                <option value="in-progress" className="bg-maroon-800">In Progress</option>
                <option value="completed" className="bg-maroon-800">Completed</option>
                <option value="cancelled" className="bg-maroon-800">Cancelled</option>
              </select>
            </div>

            {categories.length > 0 && (
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-3 pr-8 py-2.5 rounded-xl bg-white/5 border border-gold-500/10 focus:border-saffron-500/50 outline-none transition-all text-white text-sm appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-maroon-800">All Types</option>
                  {categories.map((c) => <option key={c} value={c} className="bg-maroon-800">{c}</option>)}
                </select>
              </div>
            )}

            <button
              onClick={() => { setEditingEvent(null); setShowForm(true); }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 font-semibold transition-all shadow-lg shadow-saffron-500/25 flex items-center gap-2 whitespace-nowrap text-sm"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-saffron-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gold-300/40" />
            </div>
            <h3 className="text-lg font-semibold text-gold-200/80 mb-1">
              {searchQuery || filterStatus !== 'all' || filterCategory !== 'all' ? 'No events found' : 'No events yet'}
            </h3>
            <p className="text-sm text-gold-200/40 mb-6">
              {searchQuery || filterStatus !== 'all' || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Plan your first event to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && filterCategory === 'all' && (
              <button
                onClick={() => { setEditingEvent(null); setShowForm(true); }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 font-semibold transition-all shadow-lg shadow-saffron-500/25 text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event) => (
              <div
                key={event.id}
                className="group p-5 rounded-2xl bg-white/5 border border-gold-500/10 hover:border-saffron-500/25 hover:bg-white/[0.07] transition-all cursor-pointer"
                onClick={() => onOpenEvent(event)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${PRIORITY_DOT[event.priority]}`} />
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[event.status]}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setEditingEvent(event); setShowForm(true); }}
                      className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-gold-200/60" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="w-8 h-8 rounded-lg hover:bg-red-500/15 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      {deletingId === event.id ? (
                        <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-gold-200/60 group-hover:text-red-400" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-1.5 leading-snug">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-gold-200/50 mb-3 line-clamp-2 leading-relaxed">{event.description}</p>
                )}

                <div className="space-y-2 text-sm text-gold-200/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold-300/40" />
                    <span>{formatDate(event.start_time)} · {formatTime(event.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-saffron-500/15 text-saffron-300">{event.category}</span>
                    {event.guest_count && (
                      <span className="text-xs flex items-center gap-1 text-gold-200/50">
                        <Users className="w-3 h-3" /> {event.guest_count}
                      </span>
                    )}
                    {event.budget && (
                      <span className="text-xs flex items-center gap-1 text-gold-200/50">
                        <IndianRupee className="w-3 h-3" /> {formatINR(event.budget)}
                      </span>
                    )}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gold-300/40" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gold-500/10 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES[event.priority]}`}>
                    {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
                  </span>
                  <ChevronRight className="w-4 h-4 text-gold-300/30 group-hover:text-saffron-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form modal */}
        {showForm && user && (
          <EventForm
            userId={user.id}
            event={editingEvent}
            onClose={() => { setShowForm(false); setEditingEvent(null); }}
            onSaved={handleSaved}
          />
        )}
        </>
        )}
      </div>
    </div>
  );
}
