-- Security repairs for projects that already ran the original migration.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT ((auth.jwt() ->> 'email_verified')::boolean IS TRUE AND auth.jwt() ->> 'email' = 'lmsite.creator@gmail.com')
    OR EXISTS (SELECT 1 FROM public.agencies WHERE id = auth.uid() AND is_admin = true);
$$;

CREATE OR REPLACE FUNCTION public.is_approved_agency(target_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.agencies WHERE id = target_id AND status = 'approved');
$$;

DROP POLICY IF EXISTS "agencies_select_public" ON public.agencies;
DROP POLICY IF EXISTS "agencies_select_private" ON public.agencies;
CREATE POLICY "agencies_select_private" ON public.agencies
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "agencies_update_own" ON public.agencies;
DROP POLICY IF EXISTS "requests_admin_manage" ON public.requests;
CREATE POLICY "requests_admin_manage" ON public.requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "listings_select_public" ON public.listings;
CREATE POLICY "listings_select_public" ON public.listings
  FOR SELECT USING (
    (status IN ('disponible', 'reserve', 'loue') AND public.is_approved_agency(agency_id))
    OR auth.uid() = agency_id OR public.is_admin()
  );
