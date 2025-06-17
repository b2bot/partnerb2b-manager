
-- Tabela para armazenar configurações do WhatsApp Business API
CREATE TABLE whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  business_account_id TEXT,
  webhook_verify_token TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para templates de mensagem aprovados
CREATE TABLE whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt_BR',
  category TEXT NOT NULL CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  status TEXT NOT NULL CHECK (status IN ('APPROVED', 'PENDING', 'REJECTED')),
  header_type TEXT CHECK (header_type IN ('TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT')),
  header_text TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  components JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para contatos/clientes
CREATE TABLE whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  client_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para campanhas automatizadas
CREATE TABLE whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('relatorio', 'financeiro', 'promocional', 'suporte')),
  template_id UUID REFERENCES whatsapp_templates(id) ON DELETE CASCADE,
  meta_account_id TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('diario', 'semanal', 'mensal')),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = domingo
  send_time TIME NOT NULL,
  data_period_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  contacts UUID[] DEFAULT '{}',
  variables_mapping JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para histórico de envios
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES whatsapp_campaigns(id) ON DELETE SET NULL,
  template_id UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('template', 'text')),
  template_name TEXT,
  template_variables JSONB DEFAULT '{}'::jsonb,
  message_content TEXT,
  whatsapp_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_sent_at ON whatsapp_messages(sent_at);
CREATE INDEX idx_whatsapp_messages_campaign_id ON whatsapp_messages(campaign_id);
CREATE INDEX idx_whatsapp_contacts_phone ON whatsapp_contacts(phone_number);
CREATE INDEX idx_whatsapp_campaigns_active ON whatsapp_campaigns(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_whatsapp_config_updated_at
  BEFORE UPDATE ON whatsapp_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at
  BEFORE UPDATE ON whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_contacts_updated_at
  BEFORE UPDATE ON whatsapp_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_campaigns_updated_at
  BEFORE UPDATE ON whatsapp_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (apenas admins podem acessar)
CREATE POLICY "Admins can access whatsapp_config" ON whatsapp_config
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can access whatsapp_templates" ON whatsapp_templates
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can access whatsapp_contacts" ON whatsapp_contacts
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can access whatsapp_campaigns" ON whatsapp_campaigns
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can access whatsapp_messages" ON whatsapp_messages
  FOR ALL USING (is_admin());
