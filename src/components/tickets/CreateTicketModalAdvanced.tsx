
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
import { Upload, X, File } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTicketModalAdvancedProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTicketModalAdvanced({ open, onClose }: CreateTicketModalAdvancedProps) {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [error, setError] = useState('');
  
  const { isAdmin, user } = useAuth();
  const { clienteData } = useUserAccess();
  const queryClient = useQueryClient();

  console.log('CreateTicketModalAdvanced - isAdmin:', isAdmin, 'clienteData:', clienteData);

  // Para admins, buscar lista de clientes
  const { data: clientes } = useQuery({
    queryKey: ['clientes-for-ticket-advanced'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      console.log('Buscando clientes para admin (advanced)...');
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }
      console.log('Clientes encontrados (advanced):', data);
      return data;
    },
    enabled: isAdmin,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: { 
      titulo: string; 
      mensagem: string; 
      categoria?: string;
      prioridade?: string;
      arquivo_url?: string; 
      cliente_id: string 
    }) => {
      console.log('Criando chamado avançado com dados:', data);
      
      const insertData = {
        cliente_id: data.cliente_id,
        titulo: data.titulo,
        mensagem: data.mensagem,
        categoria: data.categoria || 'outros',
        prioridade: data.prioridade || 'media',
        arquivo_url: data.arquivo_url || null,
        aberto_por: isAdmin ? 'admin' : 'cliente',
        // Não definir status - o banco usará o padrão 'novo'
      };

      console.log('Dados para inserção (advanced):', insertData);

      const { data: result, error } = await supabase
        .from('chamados')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir chamado avançado:', error);
        throw error;
      }

      console.log('Chamado avançado criado com sucesso:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Sucesso na criação do chamado avançado');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Chamado criado com sucesso!');
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Erro na mutation avançada:', error);
      setError(`Erro ao criar chamado: ${error.message}`);
      toast.error('Erro ao criar chamado');
    },
  });

  const resetForm = () => {
    setTitulo('');
    setMensagem('');
    setCategoria('');
    setPrioridade('');
    setClienteId('');
    setArquivo(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('Iniciando criação de chamado avançado...');

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

    console.log('Cliente ID final (advanced):', finalClienteId);

    let arquivo_url = undefined;

    // Upload do arquivo se fornecido
    if (arquivo) {
      try {
        console.log('Fazendo upload do arquivo (advanced):', arquivo.name);
        const fileExt = arquivo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('tickets')
          .upload(fileName, arquivo);

        if (uploadError) {
          console.error('Erro no upload (advanced):', uploadError);
        } else {
          const { data } = supabase.storage
            .from('tickets')
            .getPublicUrl(fileName);
          arquivo_url = data.publicUrl;
          console.log('Arquivo enviado com sucesso (advanced):', arquivo_url);
        }
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo (advanced):', error);
        setError('Erro ao fazer upload do arquivo. O chamado será criado sem o anexo.');
      }
    }

    createTicketMutation.mutate({
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      categoria: categoria || undefined,
      prioridade: prioridade || undefined,
      arquivo_url,
      cliente_id: finalClienteId,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo deve ter no máximo 5MB.');
        return;
      }
      setArquivo(file);
      setError('');
    }
  };

  const removeFile = () => {
    setArquivo(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="campanhas">📊 Campanhas</SelectItem>
                    <SelectItem value="hospedagem">🌐 Hospedagem</SelectItem>
                    <SelectItem value="emails">📧 E-mails</SelectItem>
                    <SelectItem value="crm">👥 CRM</SelectItem>
                    <SelectItem value="outros">📋 Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={prioridade} onValueChange={setPrioridade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">🟢 Baixa</SelectItem>
                    <SelectItem value="media">🟡 Média</SelectItem>
                    <SelectItem value="alta">🟠 Alta</SelectItem>
                    <SelectItem value="urgente">🔴 Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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

            {arquivo && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{arquivo.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(arquivo.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-input-advanced"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-input-advanced')?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                Anexar Arquivo
              </Button>
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
