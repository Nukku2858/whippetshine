
-- Drop the overly permissive insert policy
DROP POLICY "Service role can insert bookings" ON public.bookings;

-- Restrict inserts: only authenticated users can insert their own bookings
-- (webhook uses service role which bypasses RLS entirely)
CREATE POLICY "Users can insert own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
