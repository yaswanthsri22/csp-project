import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Clock, MapPin, IndianRupee, Users, Loader2, AlertCircle, Plus, Trash2, CheckCircle2, Circle, Edit3, Calendar, Tag, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type EventRow, type TaskRow } from '@/lib/supabase';
import EventForm from './EventForm';

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getDuration(start: string, end: string): string {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.round((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatINR(amount: number | null): string {
  if (!amount) return 'Not set';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

type Props = {
  event: EventRow;
  onBack: () => void;
};

export default function EventDetail({ event, onBack }: Props) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: true });
    setLoadingTasks(false);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks(data ?? []);
  }, [event.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async () => {
    if (!newTask.trim() || !user) return;
    setAddingTask(true);
    const { data, error } = await supabase
      .from('tasks')
      .insert({ event_id: event.id, user_id: user.id, title: newTask.trim() })
      .select()
      .single();
    setAddingTask(false);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => [...prev, data]);
    setNewTask('');
  };

  const handleToggleTask = async (task: TaskRow) => {
    setTogglingId(task.id);
    const { error } = await supabase
      .from('tasks')
      .update({ done: !task.done })
      .eq('id', task.id);
    setTogglingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done: !t.done } : t));
  };

  const handleDeleteTask = async (id: string) => {
    setDeletingTaskId(id);
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    setDeletingTaskId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completedTasks = tasks.filter((t) => t.done).length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-maroon-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-maroon-950/80 border-b border-gold-500/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gold-200/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <button
            onClick={() => setShowEditForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-gold-500/15 text-sm font-medium transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit Event
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Event header card */}
        <div className="rounded-2xl bg-gradient-to-br from-maroon-900 to-maroon-950/50 border border-gold-500/15 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[event.status]}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full ${PRIORITY_STYLES[event.priority]}`}>
                {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          {event.description && (
            <p className="text-gold-200/60 leading-relaxed mb-6">{event.description}</p>
          )}

          {/* Info grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-saffron-500/15 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-saffron-400" />
              </div>
              <div>
                <p className="text-xs text-gold-200/50">Date</p>
                <p className="text-sm font-medium">{formatDate(event.start_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-gold-500/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-xs text-gold-200/50">Time</p>
                <p className="text-sm font-medium">{formatTime(event.start_time)} – {formatTime(event.end_time)}</p>
                <p className="text-xs text-gold-200/40">{getDuration(event.start_time, event.end_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-maroon-500/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-maroon-300" />
              </div>
              <div>
                <p className="text-xs text-gold-200/50">Guests</p>
                <p className="text-sm font-medium">{event.guest_count ?? 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gold-200/50">Budget</p>
                <p className="text-sm font-medium">{formatINR(event.budget)}</p>
              </div>
            </div>
          </div>

          {/* Category and location */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gold-200/60">
              <Tag className="w-4 h-4 text-saffron-400" />
              {event.category}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-gold-200/60">
                <MapPin className="w-4 h-4 text-saffron-400" />
                {event.location}
              </div>
            )}
          </div>
          {event.venue_address && (
            <div className="mt-2 p-3 rounded-xl bg-white/5 text-sm text-gold-200/50">
              <MapPin className="w-4 h-4 inline mr-2 text-gold-300/40" />
              {event.venue_address}
            </div>
          )}
        </div>

        {/* Task checklist */}
        <div className="rounded-2xl bg-white/5 border border-gold-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-saffron-400" />
              <h2 className="text-lg font-bold">Task Checklist</h2>
            </div>
            {tasks.length > 0 && (
              <span className="text-sm text-gold-200/60">{completedTasks} / {tasks.length} done</span>
            )}
          </div>

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div className="mb-4">
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-saffron-500 to-maroon-600 transition-all duration-500"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
              <p className="text-xs text-gold-200/40 mt-1">{taskProgress}% complete</p>
            </div>
          )}

          {/* Add task */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a task (e.g. Book caterer, Prepare agenda, Send invites)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-gold-500/15 focus:border-saffron-500/50 focus:ring-2 focus:ring-saffron-500/20 outline-none transition-all text-white placeholder:text-gold-300/30 text-sm"
            />
            <button
              onClick={handleAddTask}
              disabled={addingTask || !newTask.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 font-medium transition-all shadow-lg shadow-saffron-500/20 disabled:opacity-50 flex items-center gap-2 text-sm whitespace-nowrap"
            >
              {addingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Task list */}
          {loadingTasks ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-saffron-400" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <Circle className="w-8 h-8 text-gold-300/30 mx-auto mb-2" />
              <p className="text-sm text-gold-200/40">No tasks yet. Add tasks above to start planning.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-gold-500/5 hover:border-gold-500/15 transition-all"
                >
                  <button
                    onClick={() => handleToggleTask(task)}
                    disabled={togglingId === task.id}
                    className="flex-shrink-0"
                  >
                    {togglingId === task.id ? (
                      <Loader2 className="w-5 h-5 text-saffron-400 animate-spin" />
                    ) : task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 hover:scale-110 transition-transform" />
                    ) : (
                      <Circle className="w-5 h-5 text-gold-300/40 hover:text-saffron-400 transition-colors" />
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${task.done ? 'line-through text-gold-200/30' : 'text-gold-200/80'}`}>
                    {task.title}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={deletingTaskId === task.id}
                    className="w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  >
                    {deletingTaskId === task.id ? (
                      <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-gold-200/40 group-hover:text-red-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit form modal */}
      {showEditForm && user && (
        <EventForm
          userId={user.id}
          event={event}
          onClose={() => setShowEditForm(false)}
          onSaved={() => { setShowEditForm(false); onBack(); }}
        />
      )}
    </div>
  );
}
