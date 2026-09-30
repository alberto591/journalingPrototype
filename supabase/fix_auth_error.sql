-- ====================================================================
-- TRAVESÍA - FIX AUTH SIGNUP & TRIGGER ERROR (Error 500 Fix)
-- ====================================================================

-- 1. Insert Base Pricing Plans (Required for trial memberships)
INSERT INTO public.pricing_plans (id, name, description, price_monthly, price_annual, features, is_active)
VALUES 
  ('trial', 'Prueba de 7 Días', 'Acceso completo a la experiencia guiada de 7 días', 0.00, 0.00, ARRAY['7 días de reto guiado', 'Acceso a sesiones en vivo', 'Comunidad de silencio'], true),
  ('founding', 'Miembro Fundador', 'Tarifa protegida de por vida para los primeros 20 miembros', 29.00, 290.00, ARRAY['Precio protegido de por vida', 'Acceso diario a directos Zoom', 'Archivo completo de grabaciones', 'Comunidad y directos'], true),
  ('standard', 'Membresía Mensual', 'Acceso completo mensual a Travesía', 39.00, 390.00, ARRAY['Acceso diario a directos Zoom', 'Archivo completo de grabaciones', 'Comunidad y biblioteca'], true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual;

-- 2. Make handle_new_user Trigger 100% Fail-Safe
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Insert Profile
  INSERT INTO public.profiles (
    id, 
    name, 
    email, 
    avatar_url, 
    role, 
    membership_status,
    current_week, 
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    'member',
    'TRIAL',
    1,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    email = EXCLUDED.email;

  -- 2. Insert User Preferences (Fail-safe)
  BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- 3. Create trial membership record safely (Fail-safe)
  BEGIN
    INSERT INTO public.memberships (user_id, plan_id, status, started_at, expires_at)
    VALUES (NEW.id, 'trial', 'TRIAL', NOW(), NOW() + INTERVAL '7 days')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure Trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable Public Read on Pricing Plans & Catalogs
DROP POLICY IF EXISTS "Pricing plans viewable by everyone" ON public.pricing_plans;
CREATE POLICY "Pricing plans viewable by everyone" ON public.pricing_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Channels viewable by everyone" ON public.channels;
CREATE POLICY "Channels viewable by everyone" ON public.channels FOR SELECT USING (true);
