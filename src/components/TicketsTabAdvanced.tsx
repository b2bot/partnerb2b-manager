
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Headphones, TrendingUp, Clock, CheckCircle, User, Eye, UserCheck, Play } from 'lucide-react';
import { TicketFilters } from './tickets/TicketFilters';
import { TicketCard } from './tickets/TicketCard';
import { CreateTicketModalAdvanced } from './tickets/CreateTicketModalAdvanced';
import { TicketDetailModalAdvanced } from './tickets/TicketDetailModalAdvanced';

// Definir tipos de status corretos
type TicketStatus = 'novo' | 'aguardando_equipe' | 'aguardando_cliente' | 'em_analise' | 'em_andamento' | 'resolvido';

interface Ticket {
  id: string;
  titulo: string;
  mensagem: string;
  status: TicketStatus;
  categoria?: string;
  prioridade?: string;
  status_detalhado?: string;
  resposta?: string;
  nota_interna?: string;
  arquivo_url?: string;
  aberto_por?: string;
  created_at: string;
  updated_at: string;
  clientes: {
    nome: string;
  };
}

export function TicketsTabAdvanced() {
  const { isAdmin } = useAuth();
  const { clienteData } = useUserAccess();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filters, setFilters] = useState<any>({});

  console.log('TicketsTabAdvanced - isAdmin:', isAdmin, 'clienteData:', clienteData);

  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      console.log('Buscando tickets com filtros:', filters);
      
      let query = supabase
        .from('chamados')
        .select(`
          *,
          clientes:cliente_id (nome)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`titulo.ilike.%${filters.search}%,mensagem.ilike.%${filters.search}%`);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.categoria) {
        query = query.eq('categoria', filters.categoria);
      }
      
      if (filters.prioridade) {
        query = query.eq('prioridade', filters.prioridade);
      }
      
      if (filters.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id);
      }

      // Para clientes, filtrar apenas seus chamados (isso é feito pela RLS agora)
      console.log('Executando query...');
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar tickets:', error);
        throw error;
      }
      
      console.log('Tickets encontrados:', data);
      return data as Ticket[];
    },
    enabled: isAdmin || !!clienteData?.id,
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes-list'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      console.log('Buscando lista de clientes...');
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }
      console.log('Lista de clientes:', data);
      return data;
    },
    enabled: isAdmin,
  });

  // Estatísticas para dashboard resumo
  const stats = tickets ? {
    total: tickets.length,
    novo: tickets.filter(t => t.status === 'novo').length,
    aguardandoEquipe: tickets.filter(t => t.status === 'aguardando_equipe').length,
    aguardandoCliente: tickets.filter(t => t.status === 'aguardando_cliente').length,
    emAnalise: tickets.filter(t => t.status === 'em_analise').length,
    emAndamento: tickets.filter(t => t.status === 'em_andamento').length,
    resolvidos: tickets.filter(t => t.status === 'resolvido').length,
  } : { total: 0, novo: 0, aguardandoEquipe: 0, aguardandoCliente: 0, emAnalise: 0, emAndamento: 0, resolvidos: 0 };

  if (error) {
    console.error('Erro na TicketsTabAdvanced:', error);
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar chamados</h2>
          <p className="text-gray-600">{error.message}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    console.log('Carregando tickets...');
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log('Renderizando TicketsTabAdvanced com', tickets?.length, 'tickets');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Headphones className="h-7 w-7 text-blue-600" />
            {isAdmin ? 'Central de Suporte' : 'Meus Chamados'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin 
              ? 'Gerencie todos os chamados de suporte dos clientes'
              : 'Abra chamados e acompanhe o status do seu atendimento'
            }
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Chamado
        </Button>
      </div>

      {/* Dashboard de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Headphones className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Novos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.novo}</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aguard. Equipe</p>
                <p className="text-2xl font-bold text-red-600">{stats.aguardandoEquipe}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Análise</p>
                <p className="text-2xl font-bold text-blue-600">{stats.emAnalise}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.emAndamento}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvidos}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <TicketFilters 
        onFiltersChange={setFilters}
        isAdmin={isAdmin}
        clientes={clientes}
      />

      {/* Lista de Chamados */}
      <div className="space-y-4">
        {tickets?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Headphones className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {Object.keys(filters).length > 0 
                  ? 'Nenhum chamado encontrado' 
                  : isAdmin ? 'Nenhum chamado registrado' : 'Você ainda não tem chamados'
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {Object.keys(filters).length > 0 
                  ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
                  : isAdmin 
                    ? 'Quando os clientes abrirem chamados, eles aparecerão aqui.'
                    : 'Clique em "Novo Chamado" para abrir seu primeiro chamado de suporte.'
                }
              </p>
              {Object.keys(filters).length === 0 && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Chamado
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets?.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isAdmin={isAdmin}
                onClick={() => setSelectedTicket(ticket)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      {createModalOpen && (
        <CreateTicketModalAdvanced
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      )}

      {selectedTicket && (
        <TicketDetailModalAdvanced
          ticket={selectedTicket}
          open={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
