
-- Adicionar colunas que faltam na tabela whatsapp_contacts para suporte a tags e agrupamento
ALTER TABLE whatsapp_contacts 
ADD COLUMN IF NOT EXISTS meta_account_id TEXT,
ADD COLUMN IF NOT EXISTS grupo TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Criar tabela para logs de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES whatsapp_messages(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'sent',
  whatsapp_message_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_details JSONB,
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para execução de campanhas automatizadas
CREATE TABLE IF NOT EXISTS whatsapp_campaign_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE,
  execution_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  execution_details JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_tags ON whatsapp_contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_client_id ON whatsapp_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaign_executions_campaign ON whatsapp_campaign_executions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaign_executions_date ON whatsapp_campaign_executions(execution_date);

-- Habilitar RLS nas novas tabelas
ALTER TABLE whatsapp_message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_campaign_executions ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas (assumindo que será usado por admins)
CREATE POLICY "Allow all access to whatsapp_message_logs" ON whatsapp_message_logs FOR ALL USING (true);
CREATE POLICY "Allow all access to whatsapp_campaign_executions" ON whatsapp_campaign_executions FOR ALL USING (true);

-- Atualizar a tabela whatsapp_campaigns para incluir timezone
ALTER TABLE whatsapp_campaigns 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS next_execution TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_execution TIMESTAMP WITH TIME ZONE;
