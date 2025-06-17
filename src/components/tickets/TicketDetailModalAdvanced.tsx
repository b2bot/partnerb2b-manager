
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketStepper } from './TicketStepper';
import { TicketTimeline } from './TicketTimeline';
import { ClientMessageForm } from './ClientMessageForm';
import { Download, FileText, Clock, User, AlertCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  titulo: string;
  mensagem: string;
  status: 'novo' | 'aguardando_equipe' | 'aguardando_cliente' | 'em_analise' | 'em_andamento' | 'resolvido';
  categoria?: string;
  prioridade?: string;
  resposta?: string;
  nota_interna?: string;
  arquivo_url?: string;
  created_at: string;
  updated_at: string;
  clientes?: { nome: string };
}

interface TimelineEntry {
  id: string;
  tipo: string;
  conteudo: string;
  autor_nome: string;
  autor_tipo: 'cliente' | 'admin' | 'sistema';
  created_at: string;
  metadata?: any;
}

interface TicketDetailModalAdvancedProps {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
}

export function TicketDetailModalAdvanced({ ticket, open, onClose }: TicketDetailModalAdvancedProps) {
  const { isAdmin, user } = useAuth();
  const [resposta, setResposta] = useState(ticket.resposta || '');
  const [notaInterna, setNotaInterna] = useState(ticket.nota_interna || '');
  const [status, setStatus] = useState<'novo' | 'aguardando_equipe' | 'aguardando_cliente' | 'em_analise' | 'em_andamento' | 'resolvido'>(ticket.status);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  // Buscar timeline do chamado (incluindo mensagens)
  const { data: timelineData } = useQuery({
    queryKey: ['ticket-timeline', ticket.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chamados_timeline')
        .select('*')
        .eq('chamado_id', ticket.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Mapear dados para o tipo correto
  const timeline: TimelineEntry[] = timelineData?.map(item => ({
    id: item.id,
    tipo: item.tipo,
    conteudo: item.conteudo || '',
    autor_nome: item.autor_nome,
    autor_tipo: item.autor_tipo as 'cliente' | 'admin' | 'sistema',
    created_at: item.created_at,
    metadata: item.metadata
  })) || [];

  const updateTicketMutation = useMutation({
    mutationFn: async (data: { resposta?: string; status?: string; nota_interna?: string }) => {
      const updateData: any = {};
      if (data.resposta !== undefined) {
        updateData.resposta = data.resposta;
        updateData.respondido_por = user?.id;
      }
      if (data.status !== undefined) {
        updateData.status = data.status;
      }
      if (data.nota_interna !== undefined) {
        updateData.nota_interna = data.nota_interna;
      }
      const { error } = await supabase
        .from('chamados')
        .update(updateData)
        .eq('id', ticket.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-timeline', ticket.id] });
      toast.success('Chamado atualizado com sucesso!');
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao atualizar chamado:', error);
      setError('Erro ao atualizar chamado. Tente novamente.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isAdmin) {
      updateTicketMutation.mutate({
        resposta: resposta.trim() || undefined,
        status: status,
        nota_interna: notaInterna.trim() || undefined,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoriaIcon = (categoria?: string) => {
    switch (categoria) {
      case 'campanhas': return '📊';
      case 'hospedagem': return '🌐';
      case 'emails': return '📧';
      case 'crm': return '👥';
      default: return '📋';
    }
  };

  const getStatusOptions = () => [
      { value: 'novo', label: 'Novo' },
      { value: 'aguardando_equipe', label: 'Aguardando Equipe' },
      { value: 'aguardando_cliente', label: 'Aguardando Cliente' },
      { value: 'em_analise', label: 'Em Análise' },
      { value: 'em_andamento', label: 'Em Andamento' },
      { value: 'resolvido', label: 'Resolvido' }
    ];

  // Lógica de abas conforme perfil
  const defaultTab = isAdmin ? 'timeline' : 'timeline';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              {ticket.categoria && <span>{getCategoriaIcon(ticket.categoria)}</span>}
              {ticket.titulo}
            </DialogTitle>
            <TicketStatusBadge 
              status={ticket.status} 
              prioridade={ticket.prioridade as any}
              size="lg"
            />
          </div>
          <div className="mt-4">
            <TicketStepper status={ticket.status} categoria={ticket.categoria} />
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue={defaultTab} className="h-full flex flex-col">
            <TabsList className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-3"} mx-6 mb-4 flex-shrink-0`}>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              {!isAdmin && <TabsTrigger value="clientreply">Enviar mensagem</TabsTrigger>}
              {isAdmin && <TabsTrigger value="admin">Administração</TabsTrigger>}
            </TabsList>

            <TabsContent value="timeline" className="flex-1 overflow-hidden px-6">
              <div className="h-full flex flex-col">
                <h3 className="font-medium mb-3 flex items-center gap-2 flex-shrink-0">
                  <Clock className="h-4 w-4" />
                  Histórico de Conversas
                </h3>
                <div className="flex-1 min-h-0">
                  {timeline && timeline.length > 0 ? (
                    <ScrollArea className="h-full pr-4">
                      <TicketTimeline timeline={timeline} />
                    </ScrollArea>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center py-8 text-gray-500">
                      <div>
                        <MessageCircle className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                        <p>Nenhuma conversa registrada ainda</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="flex-1 overflow-hidden px-6">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6 pb-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Descrição original:</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{ticket.mensagem}</p>
                    </div>
                  </div>
                  {ticket.arquivo_url && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Arquivo anexado:</Label>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          onClick={() => window.open(ticket.arquivo_url, '_blank')}
                          className="w-full justify-start"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar arquivo anexado
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Categoria:</Label>
                      <p className="mt-1 font-medium">{ticket.categoria || 'Não definida'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Prioridade:</Label>
                      <p className="mt-1 font-medium">{ticket.prioridade || 'Não definida'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Criado em:</Label>
                      <p className="mt-1">{formatDate(ticket.created_at)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Última atualização:</Label>
                      <p className="mt-1">{formatDate(ticket.updated_at)}</p>
                    </div>
                  </div>
                  {ticket.resposta && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Última resposta da equipe:</Label>
                      <div className="mt-2 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p className="text-gray-800 whitespace-pre-wrap">{ticket.resposta}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* NOVA ABA SOMENTE PARA CLIENTE */}
            {!isAdmin && (
              <TabsContent value="clientreply" className="flex-1 overflow-hidden px-6 pb-6">
                <div className="h-full flex flex-col">
                  <h3 className="font-medium mb-3 flex items-center gap-2 flex-shrink-0">
                    <MessageCircle className="h-4 w-4" />
                    Enviar mensagem
                  </h3>
                  <div className="flex-1 min-h-0">
                    <ClientMessageForm
                      ticketId={ticket.id}
                      onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['ticket-timeline', ticket.id] });
                        queryClient.invalidateQueries({ queryKey: ['tickets'] });
                      }}
                      className="h-full"
                    />
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Aba administração (apenas admin) */}
            {isAdmin && (
              <TabsContent value="admin" className="flex-1 overflow-hidden px-6">
                <ScrollArea className="h-full pr-4">
                  <form onSubmit={handleSubmit} className="space-y-6 pb-6">
                    <div>
                      <Label htmlFor="status" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Status do chamado
                      </Label>
                      <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getStatusOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="resposta">Resposta ao cliente</Label>
                      <Textarea
                        id="resposta"
                        value={resposta}
                        onChange={(e) => setResposta(e.target.value)}
                        placeholder="Digite sua resposta para o cliente..."
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nota-interna" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nota interna (visível apenas para a equipe)
                      </Label>
                      <Textarea
                        id="nota-interna"
                        value={notaInterna}
                        onChange={(e) => setNotaInterna(e.target.value)}
                        placeholder="Anotações internas sobre este chamado..."
                        rows={3}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Esta nota não será visível para o cliente
                      </p>
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </form>
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50">
          {isAdmin ? (
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Fechar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={updateTicketMutation.isPending}
                className="flex-1"
              >
                {updateTicketMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          ) : (
            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
