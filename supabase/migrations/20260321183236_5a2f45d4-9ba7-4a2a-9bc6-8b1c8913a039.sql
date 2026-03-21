-- ============================================================
-- ROLE-BASED RLS: Refine policies so viewer=read-only, editor=no delete
-- ============================================================

-- CREATORS: split ALL into granular policies
DROP POLICY IF EXISTS "Agency members can insert creators" ON public.creators;
DROP POLICY IF EXISTS "Agency members can update creators" ON public.creators;
DROP POLICY IF EXISTS "Agency members can delete creators" ON public.creators;

-- Viewer can only SELECT (already covered by public select policy)
-- Editor/Admin/Owner can insert
CREATE POLICY "Editors+ can insert creators"
  ON public.creators FOR INSERT TO authenticated
  WITH CHECK (
    agency_id = current_user_agency_id()
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

-- Editor/Admin/Owner can update
CREATE POLICY "Editors+ can update creators"
  ON public.creators FOR UPDATE TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

-- Only Owner/Admin can delete
CREATE POLICY "Admins+ can delete creators"
  ON public.creators FOR DELETE TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() IN ('owner', 'admin')
  );

-- CAMPAIGNS: split into granular
DROP POLICY IF EXISTS "Agency members can manage campaigns" ON public.creator_campaigns;

CREATE POLICY "Editors+ can insert campaigns"
  ON public.creator_campaigns FOR INSERT TO authenticated
  WITH CHECK (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Editors+ can update campaigns"
  ON public.creator_campaigns FOR UPDATE TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Admins+ can delete campaigns"
  ON public.creator_campaigns FOR DELETE TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin')
  );

CREATE POLICY "Agency members can select campaigns"
  ON public.creator_campaigns FOR SELECT TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
  );

-- LINKS: split into granular
DROP POLICY IF EXISTS "Agency members can manage links" ON public.creator_links;

CREATE POLICY "Editors+ can insert links"
  ON public.creator_links FOR INSERT TO authenticated
  WITH CHECK (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Editors+ can update links"
  ON public.creator_links FOR UPDATE TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Admins+ can delete links"
  ON public.creator_links FOR DELETE TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin')
  );

CREATE POLICY "Agency members can select links"
  ON public.creator_links FOR SELECT TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
  );

-- PRODUCTS: split into granular
DROP POLICY IF EXISTS "Agency members can manage products" ON public.creator_products;

CREATE POLICY "Editors+ can insert products"
  ON public.creator_products FOR INSERT TO authenticated
  WITH CHECK (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Editors+ can update products"
  ON public.creator_products FOR UPDATE TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Admins+ can delete products"
  ON public.creator_products FOR DELETE TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin')
  );

CREATE POLICY "Agency members can select products"
  ON public.creator_products FOR SELECT TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
  );

-- SOCIAL LINKS: split into granular
DROP POLICY IF EXISTS "Agency members can manage social links" ON public.creator_social_links;

CREATE POLICY "Editors+ can insert social links"
  ON public.creator_social_links FOR INSERT TO authenticated
  WITH CHECK (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Editors+ can update social links"
  ON public.creator_social_links FOR UPDATE TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Admins+ can delete social links"
  ON public.creator_social_links FOR DELETE TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin')
  );

CREATE POLICY "Agency members can select social links"
  ON public.creator_social_links FOR SELECT TO authenticated
  USING (
    creator_id IN (SELECT id FROM public.creators WHERE agency_id = current_user_agency_id())
  );

-- AGENCY SETTINGS: only owner/admin can update
DROP POLICY IF EXISTS "Agency settings updatable v2" ON public.agency_settings;
CREATE POLICY "Admins+ can update agency settings"
  ON public.agency_settings FOR UPDATE TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() IN ('owner', 'admin')
  );

-- AGENCIES: only owner/admin can update
DROP POLICY IF EXISTS "Agencies updatable by members v2" ON public.agencies;
CREATE POLICY "Admins+ can update agency"
  ON public.agencies FOR UPDATE TO authenticated
  USING (
    id = current_user_agency_id()
    AND current_user_role() IN ('owner', 'admin')
  );
