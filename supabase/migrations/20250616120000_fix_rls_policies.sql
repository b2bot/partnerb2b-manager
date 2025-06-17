
-- Remover TODAS as políticas das tabelas para evitar conflitos
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Root admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Root admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles except root admin" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Root admins can view all permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Root admins can manage all permissions" ON public.user_permissions;

DROP POLICY IF EXISTS "Root admins can view all templates" ON public.permission_templates;
DROP POLICY IF EXISTS "Root admins can manage all templates" ON public.permission_templates;

DROP POLICY IF EXISTS "Root admins can view all logs" ON public.permission_logs;

-- Criar função segura para verificar se é root admin (só se não existir)
CREATE OR REPLACE FUNCTION public.is_root_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_root_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Recriar políticas para profiles
CREATE POLICY "view_own_profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "root_admin_view_all_profiles" ON public.profiles FOR SELECT USING (public.is_root_admin());
CREATE POLICY "root_admin_update_all_profiles" ON public.profiles FOR UPDATE USING (public.is_root_admin()) WITH CHECK (public.is_root_admin());

-- Recriar políticas para user_permissions
CREATE POLICY "view_own_permissions" ON public.user_permissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "root_admin_view_all_permissions" ON public.user_permissions FOR SELECT USING (public.is_root_admin());
CREATE POLICY "root_admin_manage_all_permissions" ON public.user_permissions FOR ALL USING (public.is_root_admin());

-- Recriar políticas para permission_templates
CREATE POLICY "root_admin_view_templates" ON public.permission_templates FOR SELECT USING (public.is_root_admin());
CREATE POLICY "root_admin_manage_templates" ON public.permission_templates FOR ALL USING (public.is_root_admin());

-- Recriar políticas para permission_logs
CREATE POLICY "root_admin_view_logs" ON public.permission_logs FOR SELECT USING (public.is_root_admin());
