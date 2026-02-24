
-- Fleet vehicles table for bulk management
CREATE TABLE public.fleet_vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'Vehicle',
  vehicle_year TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  license_plate TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fleet vehicles"
ON public.fleet_vehicles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fleet vehicles"
ON public.fleet_vehicles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fleet vehicles"
ON public.fleet_vehicles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fleet vehicles"
ON public.fleet_vehicles FOR DELETE
USING (auth.uid() = user_id);

-- Fleet bookings table for batch orders
CREATE TABLE public.fleet_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'detailing',
  vehicle_count INTEGER NOT NULL DEFAULT 1,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  appointment_date TEXT,
  appointment_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fleet_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fleet bookings"
ON public.fleet_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fleet bookings"
ON public.fleet_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fleet bookings"
ON public.fleet_bookings FOR UPDATE
USING (auth.uid() = user_id);

-- Junction table linking fleet bookings to specific vehicles
CREATE TABLE public.fleet_booking_vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fleet_booking_id UUID NOT NULL REFERENCES public.fleet_bookings(id) ON DELETE CASCADE,
  fleet_vehicle_id UUID NOT NULL REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fleet_booking_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fleet booking vehicles"
ON public.fleet_booking_vehicles FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.fleet_bookings fb
  WHERE fb.id = fleet_booking_id AND fb.user_id = auth.uid()
));

CREATE POLICY "Users can insert own fleet booking vehicles"
ON public.fleet_booking_vehicles FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.fleet_bookings fb
  WHERE fb.id = fleet_booking_id AND fb.user_id = auth.uid()
));
