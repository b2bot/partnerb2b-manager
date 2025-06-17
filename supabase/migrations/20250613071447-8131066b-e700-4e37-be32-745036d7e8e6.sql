
-- Criar enum para tipos de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'cliente');

-- Criar enum para tipos de conta
CREATE TYPE public.account_type AS ENUM ('meta', 'google');

-- Criar enum para status de chamados
CREATE TYPE public.ticket_status AS ENUM ('aberto', 'em_andamento', 'resolvido');

-- Criar enum para status de criativos
CREATE TYPE public.creative_status AS ENUM ('pendente', 'aprovado', 'reprovado', 'ajuste_solicitado');

-- Criar enum para tipo de acesso
CREATE TYPE public.access_type AS ENUM ('api', 'sheet');

-- Tabela de perfis de usuário (vinculada ao auth.users do Supabase)
CREATE TABLE public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'cliente',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Tabela de clientes (para dados específicos do cliente)
CREATE TABLE public.clientes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    tipo_acesso access_type NOT NULL DEFAULT 'api',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Tabela de contas vinculadas aos clientes
CREATE TABLE public.contas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    tipo account_type NOT NULL,
    identificador TEXT NOT NULL, -- ID da conta Meta/Google
    nome TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(cliente_id, tipo, identificador)
);

-- Tabela de chamados
CREATE TABLE public.chamados (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'aberto',
    resposta TEXT,
    arquivo_url TEXT,
    respondido_por UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de criativos
CREATE TABLE public.criativos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    arquivo_url TEXT NOT NULL,
    tipo_arquivo TEXT NOT NULL, -- image/video
    status creative_status NOT NULL DEFAULT 'pendente',
    resposta TEXT,
    comentario_cliente TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criativos ENABLE ROW LEVEL SECURITY;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Função para obter o cliente_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_cliente_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT c.id FROM public.clientes c
  WHERE c.user_id = auth.uid();
$$;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins podem inserir perfis"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem atualizar qualquer perfil"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Políticas RLS para clientes
CREATE POLICY "Usuários podem ver seu próprio cliente"
  ON public.clientes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins podem ver todos os clientes"
  ON public.clientes FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins podem gerenciar clientes"
  ON public.clientes FOR ALL
  USING (public.is_admin());

-- Políticas RLS para contas
CREATE POLICY "Usuários podem ver suas próprias contas"
  ON public.contas FOR SELECT
  USING (cliente_id = public.get_user_cliente_id());

CREATE POLICY "Admins podem ver todas as contas"
  ON public.contas FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins podem gerenciar contas"
  ON public.contas FOR ALL
  USING (public.is_admin());

-- Políticas RLS para chamados
CREATE POLICY "Usuários podem ver seus próprios chamados"
  ON public.chamados FOR SELECT
  USING (cliente_id = public.get_user_cliente_id());

CREATE POLICY "Usuários podem criar chamados"
  ON public.chamados FOR INSERT
  WITH CHECK (cliente_id = public.get_user_cliente_id());

CREATE POLICY "Usuários podem atualizar seus próprios chamados"
  ON public.chamados FOR UPDATE
  USING (cliente_id = public.get_user_cliente_id());

CREATE POLICY "Admins podem ver todos os chamados"
  ON public.chamados FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins podem gerenciar chamados"
  ON public.chamados FOR ALL
  USING (public.is_admin());

-- Políticas RLS para criativos
CREATE POLICY "Usuários podem ver seus próprios criativos"
  ON public.criativos FOR SELECT
  USING (cliente_id = public.get_user_cliente_id());

CREATE POLICY "Usuários podem atualizar seus próprios criativos"
  ON public.criativos FOR UPDATE
  USING (cliente_id = public.get_user_cliente_id());

CREATE POLICY "Admins podem ver todos os criativos"
  ON public.criativos FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins podem gerenciar criativos"
  ON public.criativos FOR ALL
  USING (public.is_admin());

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'nome', new.email),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'cliente')
  );
  RETURN new;
END;
$$;

-- Trigger para executar a função quando um usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_chamados_updated_at BEFORE UPDATE ON public.chamados FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_criativos_updated_at BEFORE UPDATE ON public.criativos FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
