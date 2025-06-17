
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
import { MessageCircle, CheckCircle, Download, Eye, Play, UserCheck, User } from 'lucide-react';
import { toast } from 'sonner';

type TicketStatus = 'novo' | 'aguardando_equipe' | 'aguardando_cliente' | 'em_analise' | 'em_andamento' | 'resolvido';

interface Ticket {
  id: string;
  titulo: string;
  mensagem: string;
  status: TicketStatus;
  resposta?: string;
  arquivo_url?: string;
  created_at: string;
  updated_at: string;
}

interface TicketDetailModalProps {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
}

export function TicketDetailModal({ ticket, open, onClose }: TicketDetailModalProps) {
  const { isAdmin, user } = useAuth();
  const [resposta, setResposta] = useState(ticket.resposta || '');
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  const updateTicketMutation = useMutation({
    mutationFn: async (data: { resposta?: string; status?: string }) => {
      const updateData: any = {};
      
      if (data.resposta !== undefined) {
        updateData.resposta = data.resposta;
        updateData.respondido_por = user?.id;
      }
      
      if (data.status !== undefined) {
        updateData.status = data.status;
      }

      const { error } = await supabase
        .from('chamados')
        .update(updateData)
        .eq('id', ticket.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Chamado atualizado com sucesso!');
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao atualizar chamado:', error);
      setError('Erro ao atualizar chamado. Tente novamente.');
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'novo':
        return <MessageCircle className="h-4 w-4" />;
      case 'aguardando_equipe':
        return <UserCheck className="h-4 w-4" />;
      case 'aguardando_cliente':
        return <User className="h-4 w-4" />;
      case 'em_analise':
        return <Eye className="h-4 w-4" />;
      case 'em_andamento':
        return <Play className="h-4 w-4" />;
      case 'resolvido':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo':
        return 'bg-purple-100 text-purple-800';
      case 'aguardando_equipe':
        return 'bg-red-100 text-red-800';
      case 'aguardando_cliente':
        return 'bg-orange-100 text-orange-800';
      case 'em_analise':
        return 'bg-blue-100 text-blue-800';
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolvido':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'novo':
        return 'Novo';
      case 'aguardando_equipe':
        return 'Aguardando Equipe';
      case 'aguardando_cliente':
        return 'Aguardando Cliente';
      case 'em_analise':
        return 'Em Análise';
      case 'em_andamento':
        return 'Em Andamento';
      case 'resolvido':
        return 'Resolvido';
      default:
        return status;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdmin) {
      updateTicketMutation.mutate({
        resposta: resposta.trim() || undefined,
        status: status,
      });
    }
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as TicketStatus);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl">{ticket.titulo}</DialogTitle>
            <Badge className={getStatusColor(ticket.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(ticket.status)}
                {getStatusLabel(ticket.status)}
              </div>
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do chamado */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Mensagem original:</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-gray-800 whitespace-pre-wrap">{ticket.mensagem}</p>
              </div>
            </div>

            {ticket.arquivo_url && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Arquivo anexado:</Label>
                <div className="mt-1">
                  <Button
                    variant="outline"
                    onClick={() => window.open(ticket.arquivo_url, '_blank')}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar arquivo
                  </Button>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>Criado em: {new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
              {ticket.updated_at !== ticket.created_at && (
                <p>Atualizado em: {new Date(ticket.updated_at).toLocaleString('pt-BR')}</p>
              )}
            </div>
          </div>

          {/* Resposta existente */}
          {ticket.resposta && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Resposta da equipe:</Label>
              <div className="mt-1 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
                <p className="text-gray-800 whitespace-pre-wrap">{ticket.resposta}</p>
              </div>
            </div>
          )}

          {/* Formulário para admin */}
          {isAdmin && (
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status do chamado</Label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="aguardando_equipe">Aguardando Equipe</SelectItem>
                    <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resposta">Resposta (opcional)</Label>
                <Textarea
                  id="resposta"
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  placeholder="Digite sua resposta para o cliente..."
                  rows={4}
                />
              </div>

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
                  disabled={updateTicketMutation.isPending}
                  className="flex-1"
                >
                  {updateTicketMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          )}

          {/* Botão de fechar para cliente */}
          {!isAdmin && (
            <div className="border-t pt-4">
              <Button onClick={onClose} className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
