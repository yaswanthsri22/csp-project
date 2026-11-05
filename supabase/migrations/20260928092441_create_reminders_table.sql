/*
# Create reminders table for daily activity reminders

## Purpose
Adds a `reminders` table so users can track personal daily activities and reminders
(e.g. "Take medicine", "Morning walk", "Pay electricity bill", "Call mom").

## New Tables
- `reminders`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid() — references auth.users)
  - `title` (text, not null) — the reminder text
  - `notes` (text, nullable) — optional extra details
  - `category` (text, not null, default 'General') — Personal, Health, Work, Finance, Family, Shopping, Other
  - `priority` (text, not null, default 'medium') — low, medium, high
  - `due_date` (date, nullable) — when the reminder is due (nullable for undated reminders)
  - `due_time` (time, nullable) — optional time of day
  - `done` (boolean, not null, default false) — whether it's completed
  - `completed_at` (timestamptz, nullable) — when it was marked done
  - `is_recurring` (boolean, not null, default false) — whether it repeats daily
  - `created_at` (timestamptz, defaults to now())

## Security
- RLS enabled on `reminders`.
- Four owner-scoped policies (SELECT, INSERT, UPDATE, DELETE) restricted to `authenticated`.
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy WITH CHECK.

## Notes
1. `due_date` is nullable so users can create reminders without a specific date.
2. `is_recurring` flags daily-repeating reminders (e.g. "Take medicine every morning").
3. `completed_at` records when a reminder was checked off for history/insights.
4. Index on user_id + due_date for efficient per-day queries.
*/

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  category text NOT NULL DEFAULT 'General',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  due_time time,
  done boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  is_recurring boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reminders" ON reminders;
CREATE POLICY "select_own_reminders" ON reminders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reminders" ON reminders;
CREATE POLICY "insert_own_reminders" ON reminders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reminders" ON reminders;
CREATE POLICY "update_own_reminders" ON reminders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reminders" ON reminders;
CREATE POLICY "delete_own_reminders" ON reminders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON reminders(user_id, due_date);
