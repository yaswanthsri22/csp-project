import { useEffect, useState, useCallback } from 'react';
import { CheckSquare, Plus, Search, Loader2, AlertCircle, Trash2, Edit3, Filter, X, CheckCircle2, Circle, Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type DailyTaskRow, DAILY_TASK_CATEGORIES } from '@/lib/supabase';

const PRIORITY_DOT: Record<DailyTaskRow['priority'], string> = {
  'low': 'bg-gold-400',
  'medium': 'bg-saffron-400',
  'high': 'bg-maroon-400',
};

const PRIORITY_STYLES: Record<DailyTaskRow['priority'], string> = {
  'low': 'bg-gold-500/15 text-gold-400',
  'medium': 'bg-saffron-500/15 text-saffron-300',
  'high': 'bg-maroon-500/15 text-maroon-300',
};

const CATEGORY_STYLES: Record<string, string> = {
  'General': 'bg-gold-500/15 text-gold-300',
  'Personal': 'bg-saffron-500/15 text-saffron-300',
  'Work': 'bg-blue-500/15 text-blue-300',
  'Health': 'bg-emerald-500/15 text-emerald-300',
  'Shopping': 'bg-purple-500/15 text-purple-300',
  'Home': 'bg-rose-500/15 text-rose-300',
  'Learning': 'bg-cyan-500/15 text-cyan-300',
  'Finance': 'bg-maroon-500/15 text-maroon-300',
  'Other': 'bg-gray-500/15 text-gray-300',
  'Diet':'bg-gray-500/15 text-gray-300',
};

type ViewMode = 'today' | 'upcoming' | 'all' | 'done';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(task: DailyTaskRow): boolean {
  if (!task.due_date || task.done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.due_date + 'T00:00:00');
  return due < today;
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const due = new Date(dateStr + 'T00:00:00');
  return today.toDateString() === due.toDateString();
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyTasksView() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<DailyTaskRow | null>(null);
  const [showInlineEdit, setShowInlineEdit] = useState<string | null>(null);
  const [inlineEditTitle, setInlineEditTitle] = useState('');
  const [quickAddTitle, setQuickAddTitle] = useState('');

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .order('done', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks(data ?? []);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleQuickAdd = async () => {
    if (!quickAddTitle.trim() || !user) return;
    const { data, error } = await supabase
      .from('daily_tasks')
      .insert({
        user_id: user.id,
        title: quickAddTitle.trim(),
        due_date: todayISO(),
      })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => [data, ...prev]);
    setQuickAddTitle('');
  };

  const handleToggle = async (task: DailyTaskRow) => {
    setTogglingId(task.id);
    const updates = {
      done: !task.done,
      completed_at: !task.done ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from('daily_tasks').update(updates).eq('id', task.id);
    setTogglingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, ...updates } : t));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('daily_tasks').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleInlineEdit = async (task: DailyTaskRow) => {
    if (!inlineEditTitle.trim()) {
      setShowInlineEdit(null);
      return;
    }
    const { error } = await supabase
      .from('daily_tasks')
      .update({ title: inlineEditTitle.trim() })
      .eq('id', task.id);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, title: inlineEditTitle.trim() } : t));
    setShowInlineEdit(null);
  };

  const handleEditCategory = async (task: DailyTaskRow, newCategory: string) => {
    const { error } = await supabase.from('daily_tasks').update({ category: newCategory }).eq('id', task.id);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, category: newCategory } : t));
  };

  const handleEditPriority = async (task: DailyTaskRow, newPriority: DailyTaskRow['priority']) => {
    const { error } = await supabase.from('daily_tasks').update({ priority: newPriority }).eq('id', task.id);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, priority: newPriority } : t));
  };

  const handleEditDueDate = async (task: DailyTaskRow, newDate: string) => {
    const { error } = await supabase.from('daily_tasks').update({ due_date: newDate || null }).eq('id', task.id);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, due_date: newDate || null } : t));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let filtered = tasks;

  if (viewMode === 'today') {
    filtered = filtered.filter((t) => !t.done && (t.due_date ? isToday(t.due_date) : true));
  } else if (viewMode === 'upcoming') {
    filtered = filtered.filter((t) => !t.done && t.due_date && new Date(t.due_date + 'T00:00:00') > today);
  } else if (viewMode === 'done') {
    filtered = filtered.filter((t) => t.done);
  }

  if (filterCategory !== 'all') {
    filtered = filtered.filter((t) => t.category === filterCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      (t.notes?.toLowerCase().includes(q) ?? false) ||
      t.category.toLowerCase().includes(q)
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
    return 0;
  });

  const todayCount = tasks.filter((t) => !t.done && (t.due_date ? isToday(t.due_date) : true)).length;
  const overdueCount = tasks.filter((t) => isOverdue(t)).length;
  const doneCount = tasks.filter((t) => t.done).length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'To Do Today', value: todayCount.toString(), color: 'saffron', icon: CheckSquare },
          { label: 'Overdue', value: overdueCount.toString(), color: 'maroon', icon: AlertTriangle },
          { label: 'Completed', value: doneCount.toString(), color: 'emerald', icon: CheckCircle2 },
          { label: 'Completion Rate', value: `${completionRate}%`, color: 'gold', icon: CheckCircle2 },
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

      {/* Quick add bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-saffron-400" />
          <input
            type="text"
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            placeholder="Add a task and press Enter (e.g. Finish quarterly report)"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-gold-500/15 focus:border-saffron-500/50 focus:ring-2 focus:ring-saffron-500/20 outline-none transition-all text-white placeholder:text-gold-300/30 text-sm"
          />
        </div>
        <button
          onClick={handleQuickAdd}
          disabled={!quickAddTitle.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 font-semibold transition-all shadow-lg shadow-saffron-500/25 disabled:opacity-50 flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
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
              {mode === 'today' ? 'Today' : mode === 'upcoming' ? 'Upcoming' : mode === 'all' ? 'All Tasks' : 'Done'}
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
              placeholder="Search tasks..."
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
              {DAILY_TASK_CATEGORIES.map((c) => <option key={c} value={c} className="bg-maroon-800">{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-300 underline">Dismiss</button>
          </div>
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
            <CheckSquare className="w-8 h-8 text-gold-300/40" />
          </div>
          <h3 className="text-lg font-semibold text-gold-200/80 mb-1">
            {searchQuery || filterCategory !== 'all' ? 'No tasks found' : viewMode === 'done' ? 'No completed tasks yet' : 'No tasks for today'}
          </h3>
          <p className="text-sm text-gold-200/40 mb-6">
            {searchQuery || filterCategory !== 'all' ? 'Try adjusting your filters' : viewMode === 'done' ? 'Complete some tasks to see them here' : 'Add a task above to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedFiltered.map((task) => {
            const overdue = isOverdue(task);
            return (
              <div
                key={task.id}
                className={`group flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                  task.done
                    ? 'bg-white/[0.02] border-gold-500/5 opacity-50'
                    : overdue
                    ? 'bg-white/5 border-red-500/20 hover:border-red-500/30'
                    : 'bg-white/5 border-gold-500/10 hover:border-saffron-500/25 hover:bg-white/[0.07]'
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(task)}
                  disabled={togglingId === task.id}
                  className="flex-shrink-0 mt-0.5"
                >
                  {togglingId === task.id ? (
                    <Loader2 className="w-6 h-6 text-saffron-400 animate-spin" />
                  ) : task.done ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 hover:scale-110 transition-transform" />
                  ) : (
                    <Circle className="w-6 h-6 text-gold-300/40 hover:text-saffron-400 transition-colors" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {showInlineEdit === task.id ? (
                    <input
                      type="text"
                      value={inlineEditTitle}
                      onChange={(e) => setInlineEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInlineEdit(task);
                        if (e.key === 'Escape') setShowInlineEdit(null);
                      }}
                      onBlur={() => handleInlineEdit(task)}
                      autoFocus
                      className="w-full px-3 py-1.5 rounded-lg bg-white/10 border border-saffron-500/50 outline-none text-sm text-white"
                    />
                  ) : (
                    <p
                      className={`text-sm font-medium cursor-pointer ${task.done ? 'line-through text-gold-200/30' : 'text-gold-200/90'}`}
                      onClick={() => { setInlineEditTitle(task.title); setShowInlineEdit(task.id); }}
                    >
                      {task.title}
                    </p>
                  )}
                  {task.notes && (
                    <p className={`text-xs mt-1 ${task.done ? 'text-gold-200/20' : 'text-gold-200/50'}`}>{task.notes}</p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Category dropdown */}
                    <select
                      value={task.category}
                      onChange={(e) => handleEditCategory(task, e.target.value)}
                      className={`text-xs px-2 py-0.5 rounded border-0 outline-none cursor-pointer appearance-none ${CATEGORY_STYLES[task.category] ?? CATEGORY_STYLES['Other']}`}
                      style={{ backgroundColor: 'transparent' }}
                    >
                      {DAILY_TASK_CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-maroon-800">{c}</option>
                      ))}
                    </select>

                    {/* Priority dropdown */}
                    <select
                      value={task.priority}
                      onChange={(e) => handleEditPriority(task, e.target.value as DailyTaskRow['priority'])}
                      className={`text-xs px-2 py-0.5 rounded border-0 outline-none cursor-pointer appearance-none ${PRIORITY_STYLES[task.priority]}`}
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <option value="low" className="bg-maroon-800">Low</option>
                      <option value="medium" className="bg-maroon-800">Medium</option>
                      <option value="high" className="bg-maroon-800">High</option>
                    </select>

                    {/* Due date */}
                    <div className="flex items-center gap-1">
                      <Calendar className={`w-3 h-3 ${overdue ? 'text-red-400' : 'text-gold-300/40'}`} />
                      <input
                        type="date"
                        value={task.due_date ?? ''}
                        onChange={(e) => handleEditDueDate(task, e.target.value)}
                        className={`text-xs bg-transparent border-0 outline-none cursor-pointer ${overdue ? 'text-red-400' : 'text-gold-200/50'}`}
                      />
                      {task.due_date && overdue && (
                        <span className="text-xs text-red-400">Overdue</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setInlineEditTitle(task.title); setShowInlineEdit(task.id); }}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gold-200/60" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    className="w-8 h-8 rounded-lg hover:bg-red-500/15 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {deletingId === task.id ? (
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
    </div>
  );
}
