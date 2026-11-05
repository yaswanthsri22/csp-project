import { useEffect, useState, useCallback } from 'react';
import { Bell, Plus, Clock, Repeat, Search, Loader2, AlertCircle, Trash2, Edit3, Filter, X, CheckCircle2, Circle, Calendar, Repeat as RepeatIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type ReminderRow, REMINDER_CATEGORIES } from '@/lib/supabase';
import ReminderForm from './ReminderForm';

const PRIORITY_DOT: Record<ReminderRow['priority'], string> = {
  'low': 'bg-gold-400',
  'medium': 'bg-saffron-400',
  'high': 'bg-maroon-400',
};

const PRIORITY_STYLES: Record<ReminderRow['priority'], string> = {
  'low': 'bg-gold-500/15 text-gold-400',
  'medium': 'bg-saffron-500/15 text-saffron-300',
  'high': 'bg-maroon-500/15 text-maroon-300',
};

const CATEGORY_STYLES: Record<string, string> = {
  'General': 'bg-gold-500/15 text-gold-300',
  'Personal': 'bg-saffron-500/15 text-saffron-300',
  'Health': 'bg-emerald-500/15 text-emerald-300',
  'Work': 'bg-blue-500/15 text-blue-300',
  'Finance': 'bg-maroon-500/15 text-maroon-300',
  'Family': 'bg-rose-500/15 text-rose-300',
  'Shopping': 'bg-purple-500/15 text-purple-300',
  'Other': 'bg-gray-500/15 text-gray-300',
};

type ViewMode = 'today' | 'upcoming' | 'all' | 'done';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(reminder: ReminderRow): boolean {
  if (!reminder.due_date || reminder.done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(reminder.due_date + 'T00:00:00');
  return due < today;
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const due = new Date(dateStr + 'T00:00:00');
  return today.toDateString() === due.toDateString();
}

export default function RemindersView() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderRow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('due_time', { ascending: true, nullsFirst: false });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setReminders(data ?? []);
  }, [user]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleToggle = async (reminder: ReminderRow) => {
    setTogglingId(reminder.id);
    const updates = {
      done: !reminder.done,
      completed_at: !reminder.done ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from('reminders').update(updates).eq('id', reminder.id);
    setTogglingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setReminders((prev) => prev.map((r) => r.id === reminder.id ? { ...r, ...updates } : r));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingReminder(null);
    fetchReminders();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let filtered = reminders;

  if (viewMode === 'today') {
    filtered = filtered.filter((r) => !r.done && (r.is_recurring || (r.due_date && isToday(r.due_date))));
  } else if (viewMode === 'upcoming') {
    filtered = filtered.filter((r) => !r.done && r.due_date && new Date(r.due_date + 'T00:00:00') > today);
  } else if (viewMode === 'done') {
    filtered = filtered.filter((r) => r.done);
  }

  if (filterCategory !== 'all') {
    filtered = filtered.filter((r) => r.category === filterCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      (r.notes?.toLowerCase().includes(q) ?? false) ||
      r.category.toLowerCase().includes(q)
    );
  }

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.due_date && b.due_date) {
      const cmp = a.due_date.localeCompare(b.due_date);
      if (cmp !== 0) return cmp;
    } else if (a.due_date && !b.due_date) {
      return -1;
    } else if (!a.due_date && b.due_date) {
      return 1;
    }
    if (a.due_time && b.due_time) return a.due_time.localeCompare(b.due_time);
    return 0;
  });

  const todayCount = reminders.filter((r) => !r.done && (r.is_recurring || (r.due_date && isToday(r.due_date)))).length;
  const overdueCount = reminders.filter((r) => isOverdue(r)).length;
  const doneCount = reminders.filter((r) => r.done).length;
  const recurringCount = reminders.filter((r) => r.is_recurring).length;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Due Today', value: todayCount.toString(), color: 'saffron', icon: Bell },
          { label: 'Overdue', value: overdueCount.toString(), color: 'maroon', icon: AlertCircle },
          { label: 'Completed', value: doneCount.toString(), color: 'emerald', icon: CheckCircle2 },
          { label: 'Recurring', value: recurringCount.toString(), color: 'gold', icon: Repeat },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl bg-white/5 border border-gold-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gold-200/60">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/15 flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
              </div>
            </div>
            <p className="font-bold text-3xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['today', 'upcoming', 'all', 'done'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-gradient-to-r from-saffron-500 to-maroon-600 text-white shadow-lg shadow-saffron-500/20'
                  : 'bg-white/5 border border-gold-500/10 text-gold-200/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {mode === 'today' ? 'Today' : mode === 'upcoming' ? 'Upcoming' : mode === 'all' ? 'All' : 'Done'}
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
              placeholder="Search reminders..."
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
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-gold-500/10 focus:border-saffron-500/50 outline-none transition-all text-white text-sm appearance-none cursor-pointer"
            >
              <option value="all" className="bg-maroon-800">All Categories</option>
              {REMINDER_CATEGORIES.map((c) => <option key={c} value={c} className="bg-maroon-800">{c}</option>)}
            </select>
          </div>

          <button
            onClick={() => { setEditingReminder(null); setShowForm(true); }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 font-semibold transition-all shadow-lg shadow-saffron-500/25 flex items-center gap-2 whitespace-nowrap text-sm"
          >
            <Plus className="w-4 h-4" />
            New Reminder
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
      ) : sortedFiltered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gold-300/40" />
          </div>
          <h3 className="text-lg font-semibold text-gold-200/80 mb-1">
            {searchQuery || filterCategory !== 'all' ? 'No reminders found' : 'No reminders yet'}
          </h3>
          <p className="text-sm text-gold-200/40 mb-6">
            {searchQuery || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Add a reminder for your daily activities'}
          </p>
          {!searchQuery && filterCategory === 'all' && (
            <button
              onClick={() => { setEditingReminder(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 font-semibold transition-all shadow-lg shadow-saffron-500/25 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedFiltered.map((reminder) => {
            const overdue = isOverdue(reminder);
            return (
              <div
                key={reminder.id}
                className={`group flex items-center gap-3 p-4 rounded-2xl bg-white/5 border transition-all ${
                  reminder.done
                    ? 'border-gold-500/5 opacity-50'
                    : overdue
                    ? 'border-red-500/20 hover:border-red-500/30'
                    : 'border-gold-500/10 hover:border-saffron-500/25 hover:bg-white/[0.07]'
                }`}
              >
                <button
                  onClick={() => handleToggle(reminder)}
                  disabled={togglingId === reminder.id}
                  className="flex-shrink-0"
                >
                  {togglingId === reminder.id ? (
                    <Loader2 className="w-6 h-6 text-saffron-400 animate-spin" />
                  ) : reminder.done ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 hover:scale-110 transition-transform" />
                  ) : (
                    <Circle className="w-6 h-6 text-gold-300/40 hover:text-saffron-400 transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${reminder.done ? 'line-through text-gold-200/30' : 'text-gold-200/90'}`}>
                      {reminder.title}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[reminder.priority]}`} />
                    <span className={`text-xs px-1.5 py-0.5 rounded ${CATEGORY_STYLES[reminder.category] ?? CATEGORY_STYLES['Other']}`}>
                      {reminder.category}
                    </span>
                    {reminder.is_recurring && (
                      <span className="text-xs flex items-center gap-1 text-saffron-300">
                        <RepeatIcon className="w-3 h-3" /> Daily
                      </span>
                    )}
                  </div>
                  {reminder.notes && (
                    <p className={`text-xs mt-1 ${reminder.done ? 'text-gold-200/20' : 'text-gold-200/50'}`}>{reminder.notes}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {reminder.due_date && (
                      <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-gold-200/50'}`}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(reminder.due_date)}
                        {overdue && ' · Overdue'}
                      </span>
                    )}
                    {reminder.due_time && (
                      <span className="text-xs flex items-center gap-1 text-gold-200/50">
                        <Clock className="w-3 h-3" />
                        {reminder.due_time}
                      </span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${PRIORITY_STYLES[reminder.priority]}`}>
                      {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingReminder(reminder); setShowForm(true); }}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gold-200/60" />
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    disabled={deletingId === reminder.id}
                    className="w-8 h-8 rounded-lg hover:bg-red-500/15 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {deletingId === reminder.id ? (
                      <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-gold-200/60 group-hover:text-red-400" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && user && (
        <ReminderForm
          userId={user.id}
          reminder={editingReminder}
          onClose={() => { setShowForm(false); setEditingReminder(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
