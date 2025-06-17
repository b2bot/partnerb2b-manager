
-- Primeiro, vamos corrigir as políticas RLS que estão causando os erros 406
-- Criar políticas para a tabela profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Criar políticas para a tabela clientes
CREATE POLICY "Admins can view all clients" ON public.clientes
FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can view their own client data" ON public.clientes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage clients" ON public.clientes
FOR ALL USING (public.is_admin());

-- Criar políticas para chamados
CREATE POLICY "Admins can view all tickets" ON public.chamados
FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can view tickets from their client" ON public.chamados
FOR SELECT USING (
  cliente_id IN (
    SELECT id FROM public.clientes WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all tickets" ON public.chamados
FOR ALL USING (public.is_admin());

CREATE POLICY "Users can create tickets for their client" ON public.chamados
FOR INSERT WITH CHECK (
  cliente_id IN (
    SELECT id FROM public.clientes WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their client tickets" ON public.chamados
FOR UPDATE USING (
  cliente_id IN (
    SELECT id FROM public.clientes WHERE user_id = auth.uid()
  )
);

-- Criar políticas para criativos
CREATE POLICY "Admins can manage all creatives" ON public.criativos
FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view creatives for their client" ON public.criativos
FOR SELECT USING (
  cliente_id IN (
    SELECT id FROM public.clientes WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update creatives for their client" ON public.criativos
FOR UPDATE USING (
  cliente_id IN (
    SELECT id FROM public.clientes WHERE user_id = auth.uid()
  )
);

-- Atualizar a estrutura da tabela criativos para incluir os novos campos
ALTER TABLE public.criativos 
ADD COLUMN IF NOT EXISTS campanha TEXT,
ADD COLUMN IF NOT EXISTS nome_criativo TEXT,
ADD COLUMN IF NOT EXISTS titulo_anuncio TEXT,
ADD COLUMN IF NOT EXISTS descricao_anuncio TEXT;

-- Atualizar a estrutura da tabela chamados para melhor controle de status
ALTER TABLE public.chamados 
ADD COLUMN IF NOT EXISTS aberto_por TEXT DEFAULT 'cliente',
ADD COLUMN IF NOT EXISTS status_detalhado TEXT;

-- Criar função para atualizar status detalhado dos chamados
CREATE OR REPLACE FUNCTION update_ticket_detailed_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Definir status detalhado baseado no status e outras condições
  IF NEW.status = 'aberto' AND NEW.aberto_por = 'admin' THEN
    NEW.status_detalhado = 'Aberto pela Equipe';
  ELSIF NEW.status = 'aberto' AND NEW.aberto_por = 'cliente' THEN
    NEW.status_detalhado = 'Aberto pelo Cliente';
  ELSIF NEW.status = 'em_andamento' AND NEW.resposta IS NOT NULL AND NEW.respondido_por IS NOT NULL THEN
    -- Verificar se quem respondeu foi admin
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.respondido_por AND role = 'admin') THEN
      NEW.status_detalhado = 'Aguardando Resposta do Cliente';
    ELSE
      NEW.status_detalhado = 'Aguardando resposta da equipe';
    END IF;
  ELSIF NEW.status = 'resolvido' THEN
    NEW.status_detalhado = 'Concluído';
  ELSE
    NEW.status_detalhado = NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar status detalhado
DROP TRIGGER IF EXISTS update_ticket_status_trigger ON public.chamados;
CREATE TRIGGER update_ticket_status_trigger
  BEFORE INSERT OR UPDATE ON public.chamados
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_detailed_status();
