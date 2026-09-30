-- ====================================================================
-- TRAVESÍA — ASIGNAR ROL DE ADMINISTRADOR Y CONFIGURAR RLS
-- ====================================================================

-- 1. Asegurar que las políticas de RLS permitan a los usuarios leer perfiles y roles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin roles viewable by authenticated" ON public.admin_roles;
CREATE POLICY "Admin roles viewable by authenticated"
  ON public.admin_roles FOR SELECT
  USING (true);

-- 2. Localizar y promover al usuario
DO $$
DECLARE
  target_email TEXT := 'albertocalvorivas@gmail.com';
  target_user_id UUID;
BEGIN
  -- Buscar primero en auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE LOWER(email) = LOWER(target_email);

  -- Si no está en auth.users, buscar en public.profiles
  IF target_user_id IS NULL THEN
    SELECT id INTO target_user_id 
    FROM public.profiles 
    WHERE LOWER(email) = LOWER(target_email);
  END IF;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email "%" no encontrado en Supabase. Regístrate primero en la aplicación.', target_email;
  END IF;

  -- Asegurar perfil en public.profiles con rol admin
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
    target_user_id,
    'Alberto Calvo',
    target_email,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'admin',
    'ACTIVE',
    1,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    membership_status = 'ACTIVE',
    email = EXCLUDED.email;

  -- Asignar rol en admin_roles
  INSERT INTO public.admin_roles (user_id, role_title, permissions)
  VALUES (target_user_id, 'Superadmin', ARRAY['all'])
  ON CONFLICT (user_id) DO UPDATE 
  SET role_title = 'Superadmin', permissions = ARRAY['all'];

  RAISE NOTICE '¡Éxito! % (ID: %) ahora es Superadmin.', target_email, target_user_id;
END $$;

-- 3. Verificación inmediata (debe mostrar role = 'admin' en la tabla de resultados)
SELECT id, email, name, role, membership_status 
FROM public.profiles 
WHERE LOWER(email) = 'albertocalvorivas@gmail.com';
