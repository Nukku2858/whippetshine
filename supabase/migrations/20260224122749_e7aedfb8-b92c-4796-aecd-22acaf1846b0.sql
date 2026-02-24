
-- Weather alerts table for rain delay notifications
CREATE TABLE public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'rain_delay',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weather alerts"
ON public.weather_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own weather alerts"
ON public.weather_alerts FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can insert (edge function)
CREATE POLICY "Service role can insert alerts"
ON public.weather_alerts FOR INSERT
WITH CHECK (true);
