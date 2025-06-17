
-- Criar enum para tipos de permissões
CREATE TYPE permission_type AS ENUM (
  'access_dashboard',
  'access_whatsapp',
  'create_campaigns',
  'edit_campaigns',
  'view_templates',
  'send_messages',
  'view_metrics',
  'access_tasks',
  'create_tasks',
  'assign_tasks',
  'finalize_tasks',
  'edit_execution_time',
  'access_calls',
  'create_calls',
  'finalize_calls',
  'link_calls_to_tasks',
  'access_creatives',
  'create_edit_creatives',
  'approve_creatives',
  'view_change_history',
  'access_paid_media',
  'create_campaigns_media',
  'view_metrics_media',
  'access_reports',
  'create_automatic_reports',
  'manage_user_settings',
  'manage_collaborators',
  'manage_whatsapp_templates',
  'manage_api_settings',
  'manage_appearance_and_visual_identity',
  'manage_external_integrations',
  'manage_variables_and_pre_configurations',
  'view_billing_settings',
  'view_system_logs'
);

-- Adicionar campos necessários à tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_root_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';

-- Tabela de permissões dos usuários
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permission permission_type NOT NULL,
  granted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission)
);

-- Tabela de templates de permissões
CREATE TABLE IF NOT EXISTS permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  permissions permission_type[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de alterações de permissões
CREATE TABLE IF NOT EXISTS permission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID REFERENCES profiles(id),
  changed_by UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'granted', 'revoked', 'user_created', 'user_updated'
  permission permission_type,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para verificar se um usuário tem uma permissão específica
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, required_permission permission_type)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_permissions.user_id = has_permission.user_id 
    AND permission = required_permission
  ) OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = has_permission.user_id 
    AND is_root_admin = TRUE
  );
$$;

-- Função para obter todas as permissões de um usuário
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS permission_type[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(array_agg(permission), '{}') 
  FROM user_permissions 
  WHERE user_permissions.user_id = get_user_permissions.user_id;
$$;

-- RLS para user_permissions
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view permissions with manage_collaborators permission"
  ON user_permissions FOR SELECT
  USING (
    has_permission(auth.uid(), 'manage_collaborators') OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_root_admin = TRUE)
  );

CREATE POLICY "Users can manage permissions with manage_collaborators permission"
  ON user_permissions FOR ALL
  USING (
    has_permission(auth.uid(), 'manage_collaborators') OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_root_admin = TRUE)
  );

-- RLS para permission_templates
ALTER TABLE permission_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates with manage_collaborators permission"
  ON permission_templates FOR SELECT
  USING (
    has_permission(auth.uid(), 'manage_collaborators') OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_root_admin = TRUE)
  );

CREATE POLICY "Users can manage templates with manage_collaborators permission"
  ON permission_templates FOR ALL
  USING (
    has_permission(auth.uid(), 'manage_collaborators') OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_root_admin = TRUE)
  );

-- RLS para permission_logs
ALTER TABLE permission_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs with view_system_logs permission"
  ON permission_logs FOR SELECT
  USING (
    has_permission(auth.uid(), 'view_system_logs') OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_root_admin = TRUE)
  );

-- Atualizar a política de profiles para ocultar root admin
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view profiles except root admin"
  ON profiles FOR SELECT
  USING (
    (id = auth.uid()) OR 
    (is_root_admin = FALSE AND (
      has_permission(auth.uid(), 'manage_collaborators') OR 
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_root_admin = TRUE)
    ))
  );

-- Trigger para criar logs de alterações
CREATE OR REPLACE FUNCTION log_permission_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO permission_logs (target_user_id, changed_by, action, permission, details)
    VALUES (NEW.user_id, auth.uid(), 'granted', NEW.permission, 
            jsonb_build_object('timestamp', NOW()));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO permission_logs (target_user_id, changed_by, action, permission, details)
    VALUES (OLD.user_id, auth.uid(), 'revoked', OLD.permission, 
            jsonb_build_object('timestamp', NOW()));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER permission_changes_log
  AFTER INSERT OR DELETE ON user_permissions
  FOR EACH ROW EXECUTE FUNCTION log_permission_changes();
