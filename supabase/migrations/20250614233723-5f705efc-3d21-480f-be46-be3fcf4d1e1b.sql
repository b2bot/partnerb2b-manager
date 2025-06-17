
-- Primeiro, remover o default da coluna
ALTER TABLE chamados ALTER COLUMN status DROP DEFAULT;

-- Atualizar todos os chamados com status antigos para os novos status
UPDATE chamados 
SET status = 'novo'::ticket_status 
WHERE status::text = 'aberto';

UPDATE chamados 
SET status = 'aguardando_equipe'::ticket_status 
WHERE status::text = 'respondido';

-- Criar o novo enum com os status corretos
DROP TYPE IF EXISTS ticket_status_new CASCADE;
CREATE TYPE ticket_status_new AS ENUM ('novo', 'aguardando_equipe', 'aguardando_cliente', 'em_analise', 'em_andamento', 'resolvido');

-- Atualizar a coluna para usar o novo enum
ALTER TABLE chamados ALTER COLUMN status TYPE ticket_status_new USING 
  CASE 
    WHEN status::text = 'novo' THEN 'novo'::ticket_status_new
    WHEN status::text = 'aguardando_equipe' THEN 'aguardando_equipe'::ticket_status_new
    WHEN status::text = 'aguardando_cliente' THEN 'aguardando_cliente'::ticket_status_new
    WHEN status::text = 'em_analise' THEN 'em_analise'::ticket_status_new
    WHEN status::text = 'em_andamento' THEN 'em_andamento'::ticket_status_new
    WHEN status::text = 'resolvido' THEN 'resolvido'::ticket_status_new
    ELSE 'novo'::ticket_status_new
  END;

-- Remover o enum antigo e renomear o novo
DROP TYPE ticket_status;
ALTER TYPE ticket_status_new RENAME TO ticket_status;

-- Definir o novo valor padrão
ALTER TABLE chamados ALTER COLUMN status SET DEFAULT 'novo'::ticket_status;
