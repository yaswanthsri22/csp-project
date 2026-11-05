import { useState, type FormEvent } from 'react';
import { X, Loader2, AlertCircle, CheckSquare, Calendar } from 'lucide-react';
import { supabase, type DailyTaskRow, type DailyTaskInput, DAILY_TASK_CATEGORIES } from '@/lib/supabase';

type Props = {
  userId: string;
  task?: DailyTaskRow | null;
  onClose: () => void;
  onSaved: () => void;
};

const PRIORITIES: DailyTaskRow['priority'][] = ['low', 'medium', 'high'];

export default function DailyTaskForm({ userId, task, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [category, setCategory] = useState(task?.category ?? 'General');
  const [priority, setPriority] = useState<DailyTaskRow['priority']>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!task;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }

    const payload: DailyTaskInput = {
      title: title.trim(),
      notes: notes.trim() || null,
      category,
      priority,
      due_date: dueDate || null,
    };

    setLoading(true);
    let result;
    if (isEdit && task) {
      result = await supabase.from('daily_tasks').update(payload).eq('id', task.id).eq('user_id', userId);
    } else {
      result = await supabase.from('daily_tasks').insert({ ...payload, user_id: userId });
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
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-maroon-900 border border-gold-500/15 rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-maroon-900/95 backdrop-blur border-b border-gold-500/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-saffron-400" />
            <h2 className="text-xl font-bold">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          </div>
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

          <div>
            <label className={labelClass}>Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Finish quarterly report"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add any extra details..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {DAILY_TASK_CATEGORIES.map((c) => <option key={c} value={c} className="bg-maroon-800">{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as DailyTaskRow['priority'])} className={inputClass}>
                {PRIORITIES.map((p) => <option key={p} value={p} className="bg-maroon-800">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Due Date</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-300/40" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`${inputClass} pl-11`}
              />
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEdit ? 'Save Changes' : 'Add Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
