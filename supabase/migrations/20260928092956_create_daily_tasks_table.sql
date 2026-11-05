/*
# Create daily_tasks table for personal daily to-do tasks

## Purpose
Adds a `daily_tasks` table so users can track daily to-do tasks (e.g. "Finish report",
"Buy groceries", "Call dentist"). This is distinct from event-linked `tasks` (which
belong to a specific event) and from `reminders` (which are time-based alerts).

## New Tables
- `daily_tasks`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid() — references auth.users)
  - `title` (text, not null) — the task text
  - `notes` (text, nullable) — optional extra details
  - `category` (text, not null, default 'General') — Personal, Work, Health, Shopping, Home, Learning, Finance, Other
  - `priority` (text, not null, default 'medium') — low, medium, high
  - `due_date` (date, nullable) — when the task should be done (nullable for undated)
  - `done` (boolean, not null, default false) — whether it's completed
  - `completed_at` (timestamptz, nullable) — when it was marked done
  - `created_at` (timestamptz, defaults to now())

## Security
- RLS enabled on `daily_tasks`.
- Four owner-scoped policies (SELECT, INSERT, UPDATE, DELETE) restricted to `authenticated`.
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy WITH CHECK.

## Notes
1. `due_date` is nullable so users can create tasks without a specific date.
2. `completed_at` records when a task was checked off.
3. Index on user_id + due_date for efficient per-day queries.
4. Named `daily_tasks` to avoid conflict with the existing `tasks` table (event-linked).
*/

CREATE TABLE IF NOT EXISTS daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  category text NOT NULL DEFAULT 'General',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  done boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_daily_tasks" ON daily_tasks;
CREATE POLICY "select_own_daily_tasks" ON daily_tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_daily_tasks" ON daily_tasks;
CREATE POLICY "insert_own_daily_tasks" ON daily_tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_daily_tasks" ON daily_tasks;
CREATE POLICY "update_own_daily_tasks" ON daily_tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_daily_tasks" ON daily_tasks;
CREATE POLICY "delete_own_daily_tasks" ON daily_tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_due ON daily_tasks(user_id, due_date);
