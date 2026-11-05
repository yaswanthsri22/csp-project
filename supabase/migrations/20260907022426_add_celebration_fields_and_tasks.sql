/*
# Add celebration-specific columns and tasks table (retry)

## Purpose
Extends the events table with fields needed for Indian marriage and home celebration
planning: budget tracking, guest count, and venue address. Also adds a tasks table for
sub-task checklists within each event (e.g. "Book caterer", "Order flowers").

## Modified Tables
- `events`
  - `budget` (numeric, nullable) — estimated budget in INR for the event
  - `guest_count` (integer, nullable) — number of expected guests
  - `venue_address` (text, nullable) — full venue address

## New Tables
- `tasks`
  - `id` (uuid, primary key)
  - `event_id` (uuid, not null, references events ON DELETE CASCADE)
  - `user_id` (uuid, not null, defaults to auth.uid() — references auth.users)
  - `title` (text, not null)
  - `done` (boolean, not null, default false)
  - `created_at` (timestamptz, defaults to now)

## Security
- RLS enabled on `tasks`.
- Four owner-scoped policies (SELECT, INSERT, UPDATE, DELETE) restricted to `authenticated`
  users who own the parent event.
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy WITH CHECK.

## Notes
1. All new columns are nullable so existing event rows are unaffected.
2. Task policies check ownership through the parent events table via EXISTS subquery.
3. An index on tasks.event_id speeds up per-event task listing.
4. Uses DROP POLICY IF EXISTS before CREATE POLICY for idempotency (CREATE POLICY does not support IF EXISTS).
*/

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS budget numeric(12,2),
  ADD COLUMN IF NOT EXISTS guest_count integer,
  ADD COLUMN IF NOT EXISTS venue_address text;

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = tasks.event_id AND events.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = tasks.event_id AND events.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = tasks.event_id AND events.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = tasks.event_id AND events.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = tasks.event_id AND events.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON tasks(event_id);
