
-- Saved vehicles/addresses
CREATE TABLE public.saved_vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'My Vehicle',
  vehicle_year TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vehicles" ON public.saved_vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vehicles" ON public.saved_vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles" ON public.saved_vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles" ON public.saved_vehicles FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.saved_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'My Address',
  address TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own addresses" ON public.saved_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.saved_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.saved_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.saved_addresses FOR DELETE USING (auth.uid() = user_id);

-- Favorite services
CREATE TABLE public.favorite_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'detailing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_name)
);
ALTER TABLE public.favorite_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favorites" ON public.favorite_services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorite_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorite_services FOR DELETE USING (auth.uid() = user_id);

-- Referral program: add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN referred_by TEXT;

CREATE TABLE public.referral_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON public.referral_redemptions FOR SELECT USING (auth.uid() = referrer_user_id);

-- Notification preferences
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  appointment_reminders BOOLEAN NOT NULL DEFAULT true,
  promotions BOOLEAN NOT NULL DEFAULT true,
  points_updates BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own prefs" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prefs" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prefs" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Auto-generate referral code for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
  NEW.referral_code := upper(substring(md5(random()::text) from 1 for 8));
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code BEFORE INSERT ON public.profiles
FOR EACH ROW WHEN (NEW.referral_code IS NULL)
EXECUTE FUNCTION public.generate_referral_code();

-- Auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_prefs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_notification_prefs AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_prefs();

-- Backfill referral codes for existing profiles
UPDATE public.profiles SET referral_code = upper(substring(md5(random()::text) from 1 for 8)) WHERE referral_code IS NULL;
