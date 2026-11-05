import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type EventRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  start_time: string;
  end_time: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  budget: number | null;
  guest_count: number | null;
  venue_address: string | null;
  created_at: string;
  updated_at: string;
};

export type EventInput = {
  title: string;
  description?: string | null;
  category?: string;
  location?: string | null;
  start_time: string;
  end_time: string;
  status?: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  budget?: number | null;
  guest_count?: number | null;
  venue_address?: string | null;
};

export type TaskRow = {
  id: string;
  event_id: string;
  user_id: string;
  title: string;
  done: boolean;
  created_at: string;
};

export const CELEBRATION_CATEGORIES = [
  'Wedding',
  'Engagement',
  'Mehndi',
  'Haldi',
  'Sangeet',
  'Reception',
  'Naming Ceremony',
  'Housewarming',
  'Birthday',
  'Anniversary',
  'Festival',
  'Puja & Rituals',
] as const;

export const OFFICE_CATEGORIES = [
  'Meeting',
  'Conference',
  'Workshop',
  'Training',
  'Project Deadline',
  'Team Event',
  'Client Presentation',
  'Review',
] as const;

export const EVENT_CATEGORIES = [
  ...CELEBRATION_CATEGORIES,
  ...OFFICE_CATEGORIES,
  'Other',
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  'Wedding': 'Heart',
  'Engagement': 'Ring',
  'Mehndi': 'Flower',
  'Haldi': 'Sun',
  'Sangeet': 'Music',
  'Reception': 'PartyPopper',
  'Naming Ceremony': 'Baby',
  'Housewarming': 'Home',
  'Birthday': 'Gift',
  'Anniversary': 'HeartHandshake',
  'Festival': 'Sparkles',
  'Puja & Rituals': 'Flame',
  'Meeting': 'Users',
  'Conference': 'Presentation',
  'Workshop': 'Wrench',
  'Training': 'GraduationCap',
  'Project Deadline': 'Flag',
  'Team Event': 'PartyPopper',
  'Client Presentation': 'Presentation',
  'Review': 'ClipboardCheck',
  'Other': 'Calendar',
};

export type ReminderRow = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  due_time: string | null;
  done: boolean;
  completed_at: string | null;
  is_recurring: boolean;
  created_at: string;
};

export type ReminderInput = {
  title: string;
  notes?: string | null;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
  due_time?: string | null;
  done?: boolean;
  completed_at?: string | null;
  is_recurring?: boolean;
};

export const REMINDER_CATEGORIES = [
  'General',
  'Personal',
  'Health',
  'Work',
  'Finance',
  'Family',
  'Shopping',
  'Other',
] as const;

export type DailyTaskRow = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  done: boolean;
  completed_at: string | null;
  created_at: string;
};

export type DailyTaskInput = {
  title: string;
  notes?: string | null;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
  done?: boolean;
  completed_at?: string | null;
};

export const DAILY_TASK_CATEGORIES = [
  'General',
  'Personal',
  'Work',
  'Health',
  'Shopping',
  'Home',
  'Learning',
  'Finance',
  'Other',
] as const;
