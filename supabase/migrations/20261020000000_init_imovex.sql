-- ============================================================================
-- MIGRATION INITIALE IMOVIEX — PLATEFORME LOCATION IMMOBILIÈRE DAKAR / SÉNÉGAL
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agency_status') THEN
    CREATE TYPE agency_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
    CREATE TYPE property_type AS ENUM ('appartement', 'maison', 'studio', 'chambre', 'villa');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
    CREATE TYPE listing_status AS ENUM ('disponible', 'reserve', 'loue', 'masque');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
    CREATE TYPE request_status AS ENUM ('nouvelle', 'transmise', 'visite_planifiee', 'conclue', 'sans_suite');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_status') THEN
    CREATE TYPE email_status AS ENUM ('en_attente', 'envoye', 'email_en_echec');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_reason') THEN
    CREATE TYPE report_reason AS ENUM ('deja_loue', 'prix_incorrect', 'fausses_photos', 'fraude_suspectee', 'autre');
  END IF;
END $$;

-- 3. TABLE: neighborhoods
CREATE TABLE IF NOT EXISTS public.neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL DEFAULT 'Dakar',
  department TEXT NOT NULL DEFAULT 'Dakar',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON public.neighborhoods(slug);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON public.neighborhoods(city);

-- 4. TABLE: agencies
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  contact_email TEXT NOT NULL,     -- Confidentiel : jamais divulgué au public
  phone TEXT NOT NULL,             -- Confidentiel : jamais divulgué au public
  address TEXT,
  ninea TEXT,                      -- Numéro NINEA Sénégal
  status agency_status NOT NULL DEFAULT 'pending',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  logo_url TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_agencies_status ON public.agencies(status);
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON public.agencies(slug);

-- 5. TABLE: listings
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  property_type property_type NOT NULL,
  city TEXT NOT NULL DEFAULT 'Dakar',
  monthly_rent INT NOT NULL CHECK (monthly_rent > 0),
  deposit_advance INT NOT NULL DEFAULT 0 CHECK (deposit_advance >= 0),
  charges_included BOOLEAN NOT NULL DEFAULT false,
  bedrooms INT NOT NULL DEFAULT 1 CHECK (bedrooms >= 0),
  bathrooms INT NOT NULL DEFAULT 1 CHECK (bathrooms >= 0),
  surface_area INT CHECK (surface_area > 0),
  is_furnished BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  status listing_status NOT NULL DEFAULT 'disponible',
  confirmation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  last_availability_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reminder_sent_at TIMESTAMPTZ,
  views_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_agency_id ON public.listings(agency_id);
CREATE INDEX IF NOT EXISTS idx_listings_neighborhood_id ON public.listings(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON public.listings(property_type);
CREATE INDEX IF NOT EXISTS idx_listings_monthly_rent ON public.listings(monthly_rent);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings(slug);

-- 6. TABLE: listing_photos
CREATE TABLE IF NOT EXISTS public.listing_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_id ON public.listing_photos(listing_id, position);

-- 7. TABLE: requests
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  desired_visit_date DATE,
  status request_status NOT NULL DEFAULT 'nouvelle',
  email_status email_status NOT NULL DEFAULT 'en_attente',
  email_error_message TEXT,
  email_sent_at TIMESTAMPTZ,
  resend_email_id TEXT,
  user_ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_agency_id ON public.requests(agency_id);
CREATE INDEX IF NOT EXISTS idx_requests_listing_id ON public.requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_requests_email_status ON public.requests(email_status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at DESC);

-- 8. TABLE: listing_events
CREATE TABLE IF NOT EXISTS public.listing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'view',
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_listing_events_listing_id ON public.listing_events(listing_id);

-- 9. TABLE: reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  details TEXT,
  contact_phone TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON public.reports(listing_id);

-- 10. RLS POLICIES & HELPER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $
  SELECT (
    (auth.jwt() ->> 'email_verified')::boolean IS TRUE AND auth.jwt() ->> 'email' = 'lmsite.creator@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.agencies
      WHERE id = auth.uid() AND is_admin = true
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_agency(target_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $
  SELECT EXISTS (SELECT 1 FROM public.agencies WHERE id = target_id AND status = 'approved');
$;

ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Neighborhoods
CREATE POLICY "neighborhoods_select_public" ON public.neighborhoods
  FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "neighborhoods_all_admin" ON public.neighborhoods
  FOR ALL USING (public.is_admin());

-- Agencies
CREATE POLICY "agencies_select_private" ON public.agencies
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "agencies_insert_own" ON public.agencies
  FOR INSERT WITH CHECK (auth.uid() = id AND status = 'pending' AND is_admin = false);
-- Agency profile changes are admin-only until field-level updates can be safely constrained.
CREATE POLICY "agencies_all_admin" ON public.agencies
  FOR ALL USING (public.is_admin());

-- Listings
CREATE POLICY "listings_select_public" ON public.listings
  FOR SELECT USING (
    (status IN ('disponible', 'reserve', 'loue') AND public.is_approved_agency(listings.agency_id))
    OR (auth.uid() = agency_id) OR public.is_admin()
  );
CREATE POLICY "listings_insert_agency" ON public.listings
  FOR INSERT WITH CHECK (
    auth.uid() = agency_id AND EXISTS (
      SELECT 1 FROM public.agencies a WHERE a.id = auth.uid() AND a.status = 'approved'
    )
  );
CREATE POLICY "listings_update_agency" ON public.listings
  FOR UPDATE USING (auth.uid() = agency_id) WITH CHECK (auth.uid() = agency_id);
CREATE POLICY "listings_delete_agency" ON public.listings
  FOR DELETE USING (auth.uid() = agency_id);
CREATE POLICY "listings_all_admin" ON public.listings
  FOR ALL USING (public.is_admin());

-- Photos
CREATE POLICY "photos_select_public" ON public.listing_photos
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_photos.listing_id));
CREATE POLICY "photos_manage_agency" ON public.listing_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_photos.listing_id AND l.agency_id = auth.uid())
  );
CREATE POLICY "photos_all_admin" ON public.listing_photos
  FOR ALL USING (public.is_admin());

-- Requests : Strictly for Admin.
CREATE POLICY "requests_select_admin" ON public.requests
  FOR SELECT USING (public.is_admin());
CREATE POLICY "requests_admin_manage" ON public.requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Events & Reports
CREATE POLICY "events_insert_all" ON public.listing_events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_select_admin" ON public.listing_events FOR SELECT USING (public.is_admin());
CREATE POLICY "reports_insert_public" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "reports_select_admin" ON public.reports FOR SELECT USING (public.is_admin());
