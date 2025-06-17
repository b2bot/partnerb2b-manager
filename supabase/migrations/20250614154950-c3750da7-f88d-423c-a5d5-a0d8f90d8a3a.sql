
-- Adicionar novas colunas à tabela chamados
ALTER TABLE chamados 
ADD COLUMN IF NOT EXISTS categoria text DEFAULT 'outros',
ADD COLUMN IF NOT EXISTS prioridade text DEFAULT 'media',
ADD COLUMN IF NOT EXISTS nota_interna text,
ADD COLUMN IF NOT EXISTS tempo_resposta_horas integer;

-- Criar tabela para anexos de chamados
CREATE TABLE IF NOT EXISTS chamados_anexos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chamado_id uuid REFERENCES chamados(id) ON DELETE CASCADE,
  nome_arquivo text NOT NULL,
  url_arquivo text NOT NULL,
  tipo_arquivo text NOT NULL,
  tamanho_arquivo bigint,
  created_at timestamp with time zone DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id)
);

-- Criar tabela para timeline de conversas
CREATE TABLE IF NOT EXISTS chamados_timeline (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chamado_id uuid REFERENCES chamados(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'mensagem', -- mensagem, status_change, note
  conteudo text,
  autor_id uuid REFERENCES auth.users(id),
  autor_nome text NOT NULL,
  autor_tipo text NOT NULL DEFAULT 'cliente', -- cliente, admin, sistema
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE chamados_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamados_timeline ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para anexos
CREATE POLICY "Visualizar anexos próprios" ON chamados_anexos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chamados c 
      WHERE c.id = chamado_id 
      AND (c.cliente_id = (SELECT get_user_cliente_id()) OR is_admin())
    )
  );

CREATE POLICY "Inserir anexos próprios" ON chamados_anexos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chamados c 
      WHERE c.id = chamado_id 
      AND (c.cliente_id = (SELECT get_user_cliente_id()) OR is_admin())
    )
  );

-- Políticas RLS para timeline
CREATE POLICY "Visualizar timeline própria" ON chamados_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chamados c 
      WHERE c.id = chamado_id 
      AND (c.cliente_id = (SELECT get_user_cliente_id()) OR is_admin())
    )
  );

CREATE POLICY "Inserir timeline própria" ON chamados_timeline
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chamados c 
      WHERE c.id = chamado_id 
      AND (c.cliente_id = (SELECT get_user_cliente_id()) OR is_admin())
    )
  );

-- Trigger para criar entrada na timeline quando chamado é criado
CREATE OR REPLACE FUNCTION create_ticket_timeline_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Entrada para criação do chamado
  IF TG_OP = 'INSERT' THEN
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

  -- Entrada para mudança de status
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
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

  -- Entrada para nova resposta
  IF TG_OP = 'UPDATE' AND (OLD.resposta IS NULL OR OLD.resposta = '') AND NEW.resposta IS NOT NULL AND NEW.resposta != '' THEN
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
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS ticket_timeline_trigger ON chamados;
CREATE TRIGGER ticket_timeline_trigger
  AFTER INSERT OR UPDATE ON chamados
  FOR EACH ROW
  EXECUTE FUNCTION create_ticket_timeline_entry();

-- Criar storage bucket para anexos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;
