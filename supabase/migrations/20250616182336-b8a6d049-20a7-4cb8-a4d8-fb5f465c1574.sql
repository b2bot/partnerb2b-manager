
-- Primeiro, vamos limpar COMPLETAMENTE todas as políticas problemáticas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Root admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Root admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "root_admin_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "root_admin_update_all_profiles" ON public.profiles;

-- Limpar políticas de permissões
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Root admins can view all permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Root admins can manage all permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "view_own_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "root_admin_view_all_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "root_admin_manage_all_permissions" ON public.user_permissions;

-- Limpar políticas de templates
DROP POLICY IF EXISTS "Root admins can view all templates" ON public.permission_templates;
DROP POLICY IF EXISTS "Root admins can manage all templates" ON public.permission_templates;
DROP POLICY IF EXISTS "root_admin_view_templates" ON public.permission_templates;
DROP POLICY IF EXISTS "root_admin_manage_templates" ON public.permission_templates;

-- Limpar políticas de logs
DROP POLICY IF EXISTS "Root admins can view all logs" ON public.permission_logs;
DROP POLICY IF EXISTS "root_admin_view_logs" ON public.permission_logs;

-- Remover função antiga se existir
DROP FUNCTION IF EXISTS public.is_root_admin();

-- Primeiro, vamos garantir que seu usuário seja root admin
UPDATE public.profiles 
SET is_root_admin = true, role = 'admin'
WHERE id = '8c858fa0-380a-4940-bee7-2b302753e6f2' OR email = 'vagner@leadclinic.com.br';

-- Inserir perfil se não existir
INSERT INTO public.profiles (id, nome, email, role, is_root_admin, ativo)
VALUES ('8c858fa0-380a-4940-bee7-2b302753e6f2', 'Vagner', 'vagner@leadclinic.com.br', 'admin', true, true)
ON CONFLICT (id) DO UPDATE SET
  is_root_admin = true,
  role = 'admin',
  ativo = true;

-- Criar função MUITO simples para verificar root admin
CREATE OR REPLACE FUNCTION public.check_is_root_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_root_admin FROM public.profiles WHERE id = user_id LIMIT 1),
    false
  );
$$;

-- Políticas SIMPLES para profiles - SEM RECURSÃO
CREATE POLICY "allow_own_profile_select" ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "allow_own_profile_update" ON public.profiles 
FOR UPDATE 
USING (id = auth.uid()) 
WITH CHECK (id = auth.uid());

CREATE POLICY "allow_root_admin_select_all" ON public.profiles 
FOR SELECT 
USING (public.check_is_root_admin(auth.uid()));

CREATE POLICY "allow_root_admin_update_all" ON public.profiles 
FOR UPDATE 
USING (public.check_is_root_admin(auth.uid())) 
WITH CHECK (public.check_is_root_admin(auth.uid()));

-- Políticas para user_permissions
CREATE POLICY "allow_own_permissions_select" ON public.user_permissions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "allow_root_admin_permissions_select" ON public.user_permissions 
FOR SELECT 
USING (public.check_is_root_admin(auth.uid()));

CREATE POLICY "allow_root_admin_permissions_all" ON public.user_permissions 
FOR ALL 
USING (public.check_is_root_admin(auth.uid()));

-- Políticas para permission_templates
CREATE POLICY "allow_root_admin_templates_select" ON public.permission_templates 
FOR SELECT 
USING (public.check_is_root_admin(auth.uid()));

CREATE POLICY "allow_root_admin_templates_all" ON public.permission_templates 
FOR ALL 
USING (public.check_is_root_admin(auth.uid()));

-- Políticas para permission_logs
CREATE POLICY "allow_root_admin_logs_select" ON public.permission_logs 
FOR SELECT 
USING (public.check_is_root_admin(auth.uid()));

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_logs ENABLE ROW LEVEL SECURITY;
