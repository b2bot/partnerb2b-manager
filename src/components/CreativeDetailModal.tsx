
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Creative {
  id: string;
  titulo: string;
  campanha?: string;
  nome_criativo?: string;
  titulo_anuncio?: string;
  descricao_anuncio?: string;
  status: 'pendente' | 'aprovado' | 'reprovado' | 'ajuste_solicitado';
  arquivo_url: string;
  tipo_arquivo: string;
  comentario_cliente?: string;
  resposta?: string;
  created_at: string;
  updated_at: string;
  clientes: {
    nome: string;
  };
}

interface CreativeDetailModalProps {
  creative: Creative;
  open: boolean;
  onClose: () => void;
}

export function CreativeDetailModal({ creative, open, onClose }: CreativeDetailModalProps) {
  const { isAdmin } = useAuth();
  const [comentario, setComentario] = useState(creative.comentario_cliente || '');
  const [status, setStatus] = useState<'pendente' | 'aprovado' | 'reprovado' | 'ajuste_solicitado'>(creative.status);
  const [resposta, setResposta] = useState(creative.resposta || '');
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  const updateCreativeMutation = useMutation({
    mutationFn: async (data: { comentario_cliente?: string; status?: string; resposta?: string }) => {
      const updateData: any = {};
      
      if (data.comentario_cliente !== undefined) {
        updateData.comentario_cliente = data.comentario_cliente;
      }
      
      if (data.status !== undefined) {
        updateData.status = data.status;
      }
      
      if (data.resposta !== undefined) {
        updateData.resposta = data.resposta;
      }

      const { error } = await supabase
        .from('criativos')
        .update(updateData)
        .eq('id', creative.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatives'] });
      toast.success('Criativo atualizado com sucesso!');
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao atualizar criativo:', error);
      setError('Erro ao atualizar criativo. Tente novamente.');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'reprovado':
        return 'bg-red-100 text-red-800';
      case 'ajuste_solicitado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Aguardando Aprovação';
      case 'aprovado':
        return 'Aprovado';
      case 'reprovado':
        return 'Reprovado';
      case 'ajuste_solicitado':
        return 'Aguardando Ajustes';
      default:
        return status;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdmin) {
      updateCreativeMutation.mutate({
        resposta: resposta.trim() || undefined,
      });
    } else {
      updateCreativeMutation.mutate({
        comentario_cliente: comentario.trim() || undefined,
        status: status,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">
                {creative.nome_criativo || creative.titulo}
              </DialogTitle>
              {creative.campanha && (
                <p className="text-blue-600 font-medium mt-1">{creative.campanha}</p>
              )}
              {isAdmin && (
                <p className="text-slate-500 text-sm mt-1">
                  Cliente: {creative.clientes?.nome}
                </p>
              )}
            </div>
            <Badge className={getStatusColor(creative.status)}>
              {getStatusLabel(creative.status)}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visualização do arquivo */}
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {creative.tipo_arquivo.startsWith('image/') ? (
                <img
                  src={creative.arquivo_url}
                  alt={creative.titulo}
                  className="w-full h-full object-contain"
                />
              ) : creative.tipo_arquivo.startsWith('video/') ? (
                <video
                  src={creative.arquivo_url}
                  className="w-full h-full object-contain"
                  controls
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => window.open(creative.arquivo_url, '_blank')}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar arquivo original
            </Button>
          </div>

          {/* Informações e ações */}
          <div className="space-y-4">
            {/* Informações do criativo */}
            <div className="space-y-3">
              {creative.titulo_anuncio && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Título do anúncio:</Label>
                  <p className="text-gray-800 mt-1">{creative.titulo_anuncio}</p>
                </div>
              )}
              
              {creative.descricao_anuncio && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Descrição do anúncio:</Label>
                  <p className="text-gray-800 mt-1 whitespace-pre-wrap">{creative.descricao_anuncio}</p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>Criado em: {new Date(creative.created_at).toLocaleString('pt-BR')}</p>
                {creative.updated_at !== creative.created_at && (
                  <p>Atualizado em: {new Date(creative.updated_at).toLocaleString('pt-BR')}</p>
                )}
              </div>
            </div>

            {/* Comentário do cliente existente */}
            {creative.comentario_cliente && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Comentário do cliente:</Label>
                <div className="mt-1 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
                  <p className="text-gray-800 whitespace-pre-wrap">{creative.comentario_cliente}</p>
                </div>
              </div>
            )}

            {/* Resposta da equipe existente */}
            {creative.resposta && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Resposta da equipe:</Label>
                <div className="mt-1 p-3 bg-green-50 rounded-md border-l-4 border-green-400">
                  <p className="text-gray-800 whitespace-pre-wrap">{creative.resposta}</p>
                </div>
              </div>
            )}

            {/* Formulário de ação */}
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
              {isAdmin ? (
                /* Interface para admin */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resposta">Resposta para o cliente</Label>
                    <Textarea
                      id="resposta"
                      value={resposta}
                      onChange={(e) => setResposta(e.target.value)}
                      placeholder="Digite uma resposta para o cliente..."
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                /* Interface para cliente */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status da aprovação</Label>
                    <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Aguardando Aprovação</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="reprovado">Reprovado</SelectItem>
                        <SelectItem value="ajuste_solicitado">Aguardando Ajustes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comentario">Comentário (opcional)</Label>
                    <Textarea
                      id="comentario"
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Adicione comentários sobre o criativo..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Fechar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateCreativeMutation.isPending}
                  className="flex-1"
                >
                  {updateCreativeMutation.isPending ? 'Salvando...' : 
                   isAdmin ? 'Salvar Resposta' : 'Salvar Avaliação'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
