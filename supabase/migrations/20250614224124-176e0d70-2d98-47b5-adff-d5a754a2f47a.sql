
-- Atualizar o enum de status dos chamados
ALTER TYPE ticket_status RENAME TO ticket_status_old;

CREATE TYPE ticket_status AS ENUM ('novo', 'aguardando_equipe', 'aguardando_cliente', 'em_analise', 'em_andamento', 'resolvido');

-- Atualizar a coluna status na tabela chamados
ALTER TABLE chamados ALTER COLUMN status DROP DEFAULT;
ALTER TABLE chamados ALTER COLUMN status TYPE ticket_status USING 
  CASE 
    WHEN status::text = 'aberto' THEN 'novo'::ticket_status
    WHEN status::text = 'em_andamento' THEN 'em_andamento'::ticket_status
    WHEN status::text = 'resolvido' THEN 'resolvido'::ticket_status
    ELSE 'novo'::ticket_status
  END;
ALTER TABLE chamados ALTER COLUMN status SET DEFAULT 'novo'::ticket_status;

-- Remover o tipo antigo
DROP TYPE ticket_status_old;

-- Criar tabela para mensagens do timeline (separada das mensagens iniciais)
CREATE TABLE IF NOT EXISTS public.chamados_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chamado_id UUID NOT NULL,
  conteudo TEXT NOT NULL,
  arquivo_url TEXT,
  autor_id UUID,
  autor_nome TEXT NOT NULL,
  autor_tipo TEXT NOT NULL DEFAULT 'cliente' CHECK (autor_tipo IN ('cliente', 'admin', 'sistema')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Atualizar a função de trigger para os novos status
CREATE OR REPLACE FUNCTION public.update_ticket_status_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se é uma mensagem de cliente, alterar status para 'aguardando_equipe'
  IF NEW.autor_tipo = 'cliente' THEN
    UPDATE chamados 
    SET status = 'aguardando_equipe'::ticket_status, updated_at = now()
    WHERE id = NEW.chamado_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar status quando cliente responde
CREATE TRIGGER trigger_update_status_on_client_message
  AFTER INSERT ON chamados_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_status_on_message();

-- Atualizar a função create_ticket_timeline_entry para incluir mensagens
CREATE OR REPLACE FUNCTION public.create_ticket_timeline_entry()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Entrada para criação do chamado
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'chamados' THEN
    INSERT INTO chamados_timeline (
      chamado_id, 
      tipo, 
      conteudo, 
      autor_id, 
      autor_nome, 
      autor_tipo,
      metadata
    ) VALUES (
      NEW.id,
      'criacao',
      NEW.mensagem,
      auth.uid(),
      COALESCE((SELECT nome FROM profiles WHERE id = auth.uid()), 'Sistema'),
      NEW.aberto_por,
      jsonb_build_object('titulo', NEW.titulo, 'categoria', NEW.categoria, 'prioridade', NEW.prioridade)
    );
  END IF;

  -- Entrada para nova mensagem
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'chamados_mensagens' THEN
    INSERT INTO chamados_timeline (
      chamado_id,
      tipo,
      conteudo,
      autor_id,
      autor_nome,
      autor_tipo,
      metadata
    ) VALUES (
      NEW.chamado_id,
      'mensagem',
      NEW.conteudo,
      NEW.autor_id,
      NEW.autor_nome,
      NEW.autor_tipo,
      NEW.metadata
    );
  END IF;

  -- Entrada para mudança de status
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'chamados' AND OLD.status != NEW.status THEN
    INSERT INTO chamados_timeline (
      chamado_id,
      tipo,
      conteudo,
      autor_id,
      autor_nome,
      autor_tipo,
      metadata
    ) VALUES (
      NEW.id,
      'status_change',
      'Status alterado de "' || OLD.status || '" para "' || NEW.status || '"',
      auth.uid(),
      COALESCE((SELECT nome FROM profiles WHERE id = auth.uid()), 'Sistema'),
      CASE WHEN is_admin() THEN 'admin' ELSE 'cliente' END,
      jsonb_build_object('status_anterior', OLD.status, 'status_novo', NEW.status)
    );
  END IF;

  -- Entrada para nova resposta (campo resposta)
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'chamados' AND (OLD.resposta IS NULL OR OLD.resposta = '') AND NEW.resposta IS NOT NULL AND NEW.resposta != '' THEN
    INSERT INTO chamados_timeline (
      chamado_id,
      tipo,
      conteudo,
      autor_id,
      autor_nome,
      autor_tipo
    ) VALUES (
      NEW.id,
      'resposta',
      NEW.resposta,
      auth.uid(),
      COALESCE((SELECT nome FROM profiles WHERE id = auth.uid()), 'Sistema'),
      CASE WHEN is_admin() THEN 'admin' ELSE 'cliente' END
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Criar trigger para mensagens
CREATE TRIGGER trigger_timeline_entry_mensagens
  AFTER INSERT ON chamados_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION create_ticket_timeline_entry();

-- Atualizar chamados existentes com status 'aberto' para 'novo'
UPDATE chamados SET status = 'novo'::ticket_status WHERE status::text = 'aberto';
