
-- Melhorar tabela de clientes com campos obrigatórios
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS empresa TEXT,
ADD COLUMN IF NOT EXISTS observacoes_internas TEXT,
ADD COLUMN IF NOT EXISTS responsavel_conta UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS contas_meta TEXT[]; -- Array de IDs das contas Meta vinculadas

-- Criar tabela para histórico/timeline dos chamados
CREATE TABLE IF NOT EXISTS public.chamados_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chamado_id UUID NOT NULL REFERENCES public.chamados(id) ON DELETE CASCADE,
  acao TEXT NOT NULL, -- 'criado', 'respondido', 'status_alterado', 'arquivo_anexado'
  usuario_id UUID REFERENCES public.profiles(id),
  usuario_nome TEXT NOT NULL,
  detalhes TEXT,
  data_acao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de histórico
ALTER TABLE public.chamados_historico ENABLE ROW LEVEL SECURITY;

-- Políticas para histórico de chamados
CREATE POLICY "Users can view chamados_historico based on access" ON public.chamados_historico
  FOR SELECT USING (
    CASE 
      WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN true
      ELSE chamado_id IN (
        SELECT id FROM public.chamados 
        WHERE cliente_id = (SELECT get_user_cliente_id())
      )
    END
  );

CREATE POLICY "Only authenticated users can insert historico" ON public.chamados_historico
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para criar histórico automaticamente quando chamado é criado
CREATE OR REPLACE FUNCTION public.create_chamado_historico()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir histórico quando chamado é criado
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.chamados_historico (chamado_id, acao, usuario_id, usuario_nome, detalhes)
    VALUES (
      NEW.id, 
      'criado', 
      auth.uid(),
      COALESCE((SELECT nome FROM public.profiles WHERE id = auth.uid()), 'Sistema'),
      'Chamado criado: ' || NEW.titulo
    );
    RETURN NEW;
  END IF;
  
  -- Inserir histórico quando status muda
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.chamados_historico (chamado_id, acao, usuario_id, usuario_nome, detalhes)
    VALUES (
      NEW.id, 
      'status_alterado', 
      auth.uid(),
      COALESCE((SELECT nome FROM public.profiles WHERE id = auth.uid()), 'Sistema'),
      'Status alterado de "' || OLD.status || '" para "' || NEW.status || '"'
    );
  END IF;
  
  -- Inserir histórico quando resposta é adicionada
  IF TG_OP = 'UPDATE' AND (OLD.resposta IS NULL OR OLD.resposta = '') AND NEW.resposta IS NOT NULL AND NEW.resposta != '' THEN
    INSERT INTO public.chamados_historico (chamado_id, acao, usuario_id, usuario_nome, detalhes)
    VALUES (
      NEW.id, 
      'respondido', 
      auth.uid(),
      COALESCE((SELECT nome FROM public.profiles WHERE id = auth.uid()), 'Sistema'),
      'Nova resposta adicionada'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS chamado_historico_trigger ON public.chamados;
CREATE TRIGGER chamado_historico_trigger
  AFTER INSERT OR UPDATE ON public.chamados
  FOR EACH ROW EXECUTE FUNCTION public.create_chamado_historico();

-- Melhorar estrutura de logs de atividade
CREATE TABLE IF NOT EXISTS public.system_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.profiles(id),
  usuario_nome TEXT NOT NULL,
  acao TEXT NOT NULL, -- 'login', 'api_call', 'filter_change', 'export', etc
  modulo TEXT NOT NULL, -- 'campanhas', 'adsets', 'chamados', 'clientes', etc
  detalhes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para logs do sistema
ALTER TABLE public.system_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os logs, usuários comuns apenas os próprios
CREATE POLICY "Admins can view all logs, users only their own" ON public.system_activity_logs
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' 
    OR usuario_id = auth.uid()
  );

CREATE POLICY "All authenticated users can insert logs" ON public.system_activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Função para registrar atividade no sistema
CREATE OR REPLACE FUNCTION public.log_system_activity(
  p_acao TEXT,
  p_modulo TEXT,
  p_detalhes JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.system_activity_logs (
    usuario_id, 
    usuario_nome, 
    acao, 
    modulo, 
    detalhes, 
    ip_address, 
    user_agent
  ) VALUES (
    auth.uid(),
    COALESCE((SELECT nome FROM public.profiles WHERE id = auth.uid()), 'Sistema'),
    p_acao,
    p_modulo,
    p_detalhes,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
