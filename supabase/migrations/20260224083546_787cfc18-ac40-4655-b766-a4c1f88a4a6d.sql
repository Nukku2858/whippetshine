
-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'detailing',
  amount_paid INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  appointment_date TEXT,
  appointment_time TEXT,
  vehicle_or_address TEXT,
  notes TEXT,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Service role inserts via webhook
CREATE POLICY "Service role can insert bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

-- Index for fast user lookups
CREATE INDEX idx_bookings_user_id ON public.bookings (user_id);
