/*
# Create events table for the Event Management System

## Purpose
Stores events created by authenticated users. Each event has a title, description,
category, start/end times, location, and status. Events are scoped to the user who
created them via RLS.

## New Tables
- `events`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to the authenticated user — references auth.users)
  - `title` (text, not null)
  - `description` (text, nullable)
  - `category` (text, not null, defaults to 'General')
  - `location` (text, nullable)
  - `start_time` (timestamptz, not null)
  - `end_time` (timestamptz, not null)
  - `status` (text, not null, defaults to 'planned' — one of: planned, in-progress, completed, cancelled)
  - `priority` (text, not null, defaults to 'medium' — one of: low, medium, high)
  - `created_at` (timestamptz, defaults to now)
  - `updated_at` (timestamptz, defaults to now)

## Security
- RLS enabled on `events`.
- Four owner-scoped policies (SELECT, INSERT, UPDATE, DELETE) restricted to `authenticated`
  users who own the row (`auth.uid() = user_id`).
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy the WITH CHECK.

## Notes
1. The `user_id` column has `DEFAULT auth.uid()` so the frontend can insert events without
   explicitly passing the owner — the database fills it from the authenticated session.
2. An index on `user_id` speeds up per-user event listing.
3. An index on `start_time` helps with chronological ordering and upcoming-event queries.
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'General',
  location text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_events" ON events;
CREATE POLICY "select_own_events" ON events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_events" ON events;
CREATE POLICY "insert_own_events" ON events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_events" ON events;
CREATE POLICY "update_own_events" ON events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_events" ON events;
CREATE POLICY "delete_own_events" ON events FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
