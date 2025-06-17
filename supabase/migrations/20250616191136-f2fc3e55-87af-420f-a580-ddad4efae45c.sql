
-- Primeiro, vamos verificar e corrigir o enum ticket_status
DROP TYPE IF EXISTS ticket_status CASCADE;

CREATE TYPE ticket_status AS ENUM (
  'novo',
  'aguardando_equipe', 
  'aguardando_cliente',
  'em_analise',
  'em_andamento',
  'resolvido'
);

-- Recriar a coluna status na tabela chamados com o novo enum
ALTER TABLE chamados 
DROP COLUMN IF EXISTS status CASCADE;

ALTER TABLE chamados 
ADD COLUMN status ticket_status NOT NULL DEFAULT 'novo';

-- Atualizar qualquer referência antiga de status
UPDATE chamados SET status = 'novo' WHERE status IS NULL;

-- Garantir que as políticas RLS estejam funcionando
ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todos os chamados
DROP POLICY IF EXISTS "Admins can view all tickets" ON chamados;
CREATE POLICY "Admins can view all tickets" ON chamados
  FOR SELECT USING (is_admin());

-- Política para clientes verem apenas seus chamados
DROP POLICY IF EXISTS "Clients can view their own tickets" ON chamados;
CREATE POLICY "Clients can view their own tickets" ON chamados
  FOR SELECT USING (cliente_id = get_user_cliente_id());

-- Política para inserir chamados
DROP POLICY IF EXISTS "Users can create tickets" ON chamados;
CREATE POLICY "Users can create tickets" ON chamados
  FOR INSERT WITH CHECK (
    (is_admin() AND cliente_id IS NOT NULL) OR 
    (cliente_id = get_user_cliente_id())
  );

-- Política para atualizar chamados
DROP POLICY IF EXISTS "Users can update tickets" ON chamados;
CREATE POLICY "Users can update tickets" ON chamados
  FOR UPDATE USING (
    is_admin() OR cliente_id = get_user_cliente_id()
  );
