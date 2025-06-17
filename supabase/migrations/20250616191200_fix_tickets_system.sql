
-- Limpar completamente o sistema de chamados e recriar do zero

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Admins can view all tickets" ON chamados;
DROP POLICY IF EXISTS "Clients can view their own tickets" ON chamados;
DROP POLICY IF EXISTS "Users can create tickets" ON chamados;
DROP POLICY IF EXISTS "Users can update tickets" ON chamados;
DROP POLICY IF EXISTS "Visualizar anexos próprios" ON chamados_anexos;
DROP POLICY IF EXISTS "Inserir anexos próprios" ON chamados_anexos;
DROP POLICY IF EXISTS "Visualizar timeline própria" ON chamados_timeline;
DROP POLICY IF EXISTS "Inserir timeline própria" ON chamados_timeline;

-- 2. Recriar o enum de status corretamente
DROP TYPE IF EXISTS ticket_status CASCADE;
CREATE TYPE ticket_status AS ENUM (
  'novo',
  'aguardando_equipe', 
  'aguardando_cliente',
  'em_analise',
  'em_andamento',
  'resolvido'
);

-- 3. Corrigir a tabela chamados
ALTER TABLE chamados 
ALTER COLUMN status TYPE ticket_status USING 'novo'::ticket_status;

ALTER TABLE chamados 
ALTER COLUMN status SET DEFAULT 'novo'::ticket_status;

-- 4. Limpar dados incorretos
UPDATE chamados SET status = 'novo'::ticket_status WHERE status IS NULL;
DELETE FROM chamados WHERE cliente_id IS NULL;

-- 5. Recriar políticas RLS mais simples e funcionais
-- Política para seleção
CREATE POLICY "ticket_select_policy" ON chamados
  FOR SELECT USING (
    -- Admins podem ver todos
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' 
    OR 
    -- Clientes veem apenas seus chamados
    cliente_id = (SELECT id FROM clientes WHERE user_id = auth.uid())
  );

-- Política para inserção
CREATE POLICY "ticket_insert_policy" ON chamados
  FOR INSERT WITH CHECK (
    -- Admins podem inserir para qualquer cliente
    ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND cliente_id IS NOT NULL)
    OR 
    -- Clientes podem inserir apenas para si mesmos
    (cliente_id = (SELECT id FROM clientes WHERE user_id = auth.uid()))
  );

-- Política para atualização
CREATE POLICY "ticket_update_policy" ON chamados
  FOR UPDATE USING (
    -- Admins podem atualizar todos
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR 
    -- Clientes podem atualizar apenas seus chamados
    cliente_id = (SELECT id FROM clientes WHERE user_id = auth.uid())
  );

-- 6. Habilitar RLS
ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;

-- 7. Políticas para tabelas relacionadas
-- Anexos
CREATE POLICY "anexos_select_policy" ON chamados_anexos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chamados c 
      WHERE c.id = chamado_id 
      AND (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        OR 
        c.cliente_id = (SELECT id FROM clientes WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "anexos_insert_policy" ON chamados_anexos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chamados c 
      WHERE c.id = chamado_id 
      AND (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        OR 
        c.cliente_id = (SELECT id FROM clientes WHERE user_id = auth.uid())
      )
    )
  );

-- Timeline
CREATE POLICY "timeline_select_policy" ON chamados_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chamados c 
      WHERE c.id = chamado_id 
      AND (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        OR 
        c.cliente_id = (SELECT id FROM clientes WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "timeline_insert_policy" ON chamados_timeline
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chamados c 
      WHERE c.id = chamado_id 
      AND (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        OR 
        c.cliente_id = (SELECT id FROM clientes WHERE user_id = auth.uid())
      )
    )
  );

-- 8. Criar bucket para anexos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tickets', 'tickets', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Política para storage
CREATE POLICY "ticket_files_policy" ON storage.objects
  FOR ALL USING (bucket_id = 'tickets');
