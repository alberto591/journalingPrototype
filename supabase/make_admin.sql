-- ====================================================================
-- TRAVESÍA — ASIGNAR ROL DE ADMINISTRADOR (SUPABASE SQL EDITOR)
-- ====================================================================
-- Instrucciones:
-- 1. Regístrate primero en la aplicación (http://localhost:5173/login o /register) con tu email.
-- 2. Abre el SQL Editor en tu Dashboard de Supabase.
-- 3. Sustituye 'tu_email@ejemplo.com' por tu email de registro.
-- 4. Pulsa "Run".
-- ====================================================================

DO $$
DECLARE
  -- >>> SUSTITUYE ESTE EMAIL POR EL TUYO <<<
  target_email TEXT := 'tu_email@ejemplo.com';
  target_user_id UUID;
BEGIN
  -- 1. Localizar usuario registrado
  SELECT id INTO target_user_id 
  FROM public.profiles 
  WHERE LOWER(email) = LOWER(target_email);

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email "%" no encontrado en public.profiles. Regístrate primero en la aplicación o créalo en Auth -> Users.', target_email;
  END IF;

  -- 2. Asignar rol de admin y membresía activa en profiles
  UPDATE public.profiles 
  SET 
    role = 'admin',
    membership_status = 'ACTIVE'
  WHERE id = target_user_id;

  -- 3. Asignar privilegios en la tabla admin_roles
  INSERT INTO public.admin_roles (user_id, role_title, permissions)
  VALUES (target_user_id, 'Superadmin', ARRAY['all'])
  ON CONFLICT (user_id) DO UPDATE 
  SET role_title = 'Superadmin', permissions = ARRAY['all'];

  RAISE NOTICE '¡Éxito! El usuario % (ID: %) ahora tiene privilegios completos de Administrador.', target_email, target_user_id;
END $$;
