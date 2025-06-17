
-- Criar bucket para tickets
INSERT INTO storage.buckets (id, name, public) VALUES ('tickets', 'tickets', true);

-- Criar políticas para o bucket de tickets
CREATE POLICY "Usuários autenticados podem fazer upload de arquivos"
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'tickets' AND auth.role() = 'authenticated');

CREATE POLICY "Arquivos de tickets são públicos para leitura"
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'tickets');

-- Criar bucket para criativos
INSERT INTO storage.buckets (id, name, public) VALUES ('criativos', 'criativos', true);

-- Criar políticas para o bucket de criativos
CREATE POLICY "Admins podem fazer upload de criativos"
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'criativos' AND public.is_admin());

CREATE POLICY "Criativos são públicos para leitura"
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'criativos');

CREATE POLICY "Admins podem deletar criativos"
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'criativos' AND public.is_admin());
