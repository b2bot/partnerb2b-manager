
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTicketModal({ open, onClose }: CreateTicketModalProps) {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [error, setError] = useState('');
  
  const { isAdmin, user } = useAuth();
  const { clienteData } = useUserAccess();
  const queryClient = useQueryClient();

  console.log('CreateTicketModal - isAdmin:', isAdmin, 'clienteData:', clienteData);

  // Para admins, buscar lista de clientes
  const { data: clientes } = useQuery({
    queryKey: ['clientes-for-ticket'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      console.log('Buscando clientes para admin...');
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }
      console.log('Clientes encontrados:', data);
      return data;
    },
    enabled: isAdmin,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: { titulo: string; mensagem: string; arquivo_url?: string; cliente_id: string }) => {
      console.log('Criando chamado com dados:', data);
      
      const insertData = {
        cliente_id: data.cliente_id,
        titulo: data.titulo,
        mensagem: data.mensagem,
        arquivo_url: data.arquivo_url || null,
        aberto_por: isAdmin ? 'admin' : 'cliente',
        // Não definir status - o banco usará o padrão 'novo'
      };

      console.log('Dados para inserção:', insertData);

      const { data: result, error } = await supabase
        .from('chamados')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir chamado:', error);
        throw error;
      }

      console.log('Chamado criado com sucesso:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Sucesso na criação do chamado');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Chamado criado com sucesso!');
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Erro na mutation:', error);
      setError(`Erro ao criar chamado: ${error.message}`);
      toast.error('Erro ao criar chamado');
    },
  });

  const resetForm = () => {
    setTitulo('');
    setMensagem('');
    setClienteId('');
    setArquivo(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('Iniciando criação de chamado...');

    if (!titulo.trim() || !mensagem.trim()) {
      setError('Título e mensagem são obrigatórios.');
      return;
    }

    // Definir cliente_id baseado no tipo de usuário
    let finalClienteId = '';
    if (isAdmin) {
      if (!clienteId) {
        setError('Selecione um cliente.');
        return;
      }
      finalClienteId = clienteId;
    } else {
      if (!clienteData?.id) {
        setError('Cliente não encontrado. Verifique seu perfil.');
        return;
      }
      finalClienteId = clienteData.id;
    }

    console.log('Cliente ID final:', finalClienteId);

    let arquivo_url = undefined;

    // Upload do arquivo se fornecido
    if (arquivo) {
      try {
        console.log('Fazendo upload do arquivo:', arquivo.name);
        const fileExt = arquivo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('tickets')
          .upload(fileName, arquivo);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
        } else {
          const { data } = supabase.storage
            .from('tickets')
            .getPublicUrl(fileName);
          arquivo_url = data.publicUrl;
          console.log('Arquivo enviado com sucesso:', arquivo_url);
        }
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
        setError('Erro ao fazer upload do arquivo. O chamado será criado sem o anexo.');
      }
    }

    createTicketMutation.mutate({
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      arquivo_url,
      cliente_id: finalClienteId,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limite de 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo deve ter no máximo 5MB.');
        return;
      }
      setArquivo(file);
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Novo Chamado</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1">
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes?.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="titulo">Título do chamado</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Problema com relatórios de campanha"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Descrição detalhada</Label>
              <Textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Descreva o problema ou solicitação em detalhes..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivo">Anexar arquivo (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="arquivo"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('arquivo')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {arquivo ? arquivo.name : 'Selecionar arquivo'}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Formatos aceitos: imagens, PDF, DOC, TXT (máx. 5MB)
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>

        <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4 mt-4">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createTicketMutation.isPending}
              className="flex-1"
            >
              {createTicketMutation.isPending ? 'Criando...' : 'Criar Chamado'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
