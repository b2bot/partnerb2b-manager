
-- Verificar e corrigir a estrutura da tabela chamados

-- 1. Verificar se a coluna status existe, se não, criar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chamados' AND column_name = 'status') THEN
        -- Criar o enum primeiro se não existir
        DROP TYPE IF EXISTS ticket_status CASCADE;
        CREATE TYPE ticket_status AS ENUM (
          'novo',
          'aguardando_equipe', 
          'aguardando_cliente',
          'em_analise',
          'em_andamento',
          'resolvido'
        );
        
        -- Adicionar a coluna status
        ALTER TABLE chamados ADD COLUMN status ticket_status NOT NULL DEFAULT 'novo'::ticket_status;
    ELSE
        -- Se a coluna existe, apenas recriar o enum
        DROP TYPE IF EXISTS ticket_status CASCADE;
        CREATE TYPE ticket_status AS ENUM (
          'novo',
          'aguardando_equipe', 
          'aguardando_cliente',
          'em_analise',
          'em_andamento',
          'resolvido'
        );
        
        -- Atualizar a coluna existente
        ALTER TABLE chamados 
        ALTER COLUMN status TYPE ticket_status USING 'novo'::ticket_status;
        
        ALTER TABLE chamados 
        ALTER COLUMN status SET DEFAULT 'novo'::ticket_status;
    END IF;
END $$;

-- 2. Limpar dados incorretos
UPDATE chamados SET status = 'novo'::ticket_status WHERE status IS NULL;
DELETE FROM chamados WHERE cliente_id IS NULL;

-- 3. Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "Admins can view all tickets" ON chamados;
DROP POLICY IF EXISTS "Clients can view their own tickets" ON chamados;
DROP POLICY IF EXISTS "Users can create tickets" ON chamados;
DROP POLICY IF EXISTS "Users can update tickets" ON chamados;
DROP POLICY IF EXISTS "ticket_select_policy" ON chamados;
DROP POLICY IF EXISTS "ticket_insert_policy" ON chamados;
DROP POLICY IF EXISTS "ticket_update_policy" ON chamados;
DROP POLICY IF EXISTS "Visualizar anexos próprios" ON chamados_anexos;
DROP POLICY IF EXISTS "Inserir anexos próprios" ON chamados_anexos;
DROP POLICY IF EXISTS "anexos_select_policy" ON chamados_anexos;
DROP POLICY IF EXISTS "anexos_insert_policy" ON chamados_anexos;
DROP POLICY IF EXISTS "Visualizar timeline própria" ON chamados_timeline;
DROP POLICY IF EXISTS "Inserir timeline própria" ON chamados_timeline;
DROP POLICY IF EXISTS "timeline_select_policy" ON chamados_timeline;
DROP POLICY IF EXISTS "timeline_insert_policy" ON chamados_timeline;

-- 4. Habilitar RLS nas tabelas
ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamados_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamados_timeline ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS simples e funcionais para chamados
CREATE POLICY "ticket_select_policy" ON chamados
  FOR SELECT USING (
    -- Admins podem ver todos
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' 
    OR 
    -- Clientes veem apenas seus chamados
    cliente_id = (SELECT id FROM clientes WHERE user_id = auth.uid())
  );

CREATE POLICY "ticket_insert_policy" ON chamados
  FOR INSERT WITH CHECK (
    -- Admins podem inserir para qualquer cliente
    ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND cliente_id IS NOT NULL)
    OR 
    -- Clientes podem inserir apenas para si mesmos
    (cliente_id = (SELECT id FROM clientes WHERE user_id = auth.uid()))
  );

CREATE POLICY "ticket_update_policy" ON chamados
  FOR UPDATE USING (
    -- Admins podem atualizar todos
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR 
    -- Clientes podem atualizar apenas seus chamados
    cliente_id = (SELECT id FROM clientes WHERE user_id = auth.uid())
  );

-- 6. Políticas para chamados_anexos
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

-- 7. Políticas para chamados_timeline
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
DROP POLICY IF EXISTS "ticket_files_policy" ON storage.objects;
CREATE POLICY "ticket_files_policy" ON storage.objects
  FOR ALL USING (bucket_id = 'tickets');

