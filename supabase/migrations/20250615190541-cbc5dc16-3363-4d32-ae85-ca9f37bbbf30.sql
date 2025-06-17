
-- Habilita RLS e cria políticas para as tabelas do WhatsApp e outras tabelas essenciais.
-- Isso garante que usuários autenticados possam acessar e modificar os dados conforme as regras.

-- Tabela: whatsapp_config
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.whatsapp_config;
CREATE POLICY "Allow all access for authenticated users"
ON public.whatsapp_config FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Tabela: whatsapp_templates
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.whatsapp_templates;
CREATE POLICY "Allow all access for authenticated users"
ON public.whatsapp_templates FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Tabela: whatsapp_contacts
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.whatsapp_contacts;
CREATE POLICY "Allow all access for authenticated users"
ON public.whatsapp_contacts FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Tabela: whatsapp_messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.whatsapp_messages;
CREATE POLICY "Allow all access for authenticated users"
ON public.whatsapp_messages FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Tabela: whatsapp_campaigns
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.whatsapp_campaigns;
CREATE POLICY "Allow all access for authenticated users"
ON public.whatsapp_campaigns FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Tabela: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Tabela: clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clients can manage their own data" ON public.clientes;
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clientes;
CREATE POLICY "Clients can manage their own data"
ON public.clientes FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all clients"
ON public.clientes FOR ALL USING (public.is_admin())
WITH CHECK (public.is_admin());
