
-- Drop the overly permissive policy and replace with service-role-only insert
DROP POLICY "Service role can insert alerts" ON public.weather_alerts;

-- Only authenticated users or service role can insert (edge function uses service role which bypasses RLS)
-- So we don't need an INSERT policy at all for end users
