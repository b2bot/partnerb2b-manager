
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface MessagesTableProps {
  onNewMessage: () => void;
  onOpenFilters: () => void;
}

export function MessagesTable({ onNewMessage, onOpenFilters }: MessagesTableProps) {
  const { messages, loading, getMessageStats } = useWhatsAppMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const stats = getMessageStats();

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.phone_number.includes(searchTerm) ||
                         (message.template_name && message.template_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !selectedStatus || message.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'read':
        return <Eye className="w-4 h-4 text-purple-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      sent: 'Enviado',
      delivered: 'Entregue',
      read: 'Lido',
      failed: 'Falhou'
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'default';
      case 'read':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando mensagens...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600">Entregues</div>
            <div className="text-2xl font-bold text-blue-600">{stats.delivered}</div>
            <div className="text-xs text-slate-500">{stats.deliveryRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600">Lidas</div>
            <div className="text-2xl font-bold text-purple-600">{stats.read}</div>
            <div className="text-xs text-slate-500">{stats.readRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600">Pendentes</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600">Falhas</div>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Histórico de Mensagens ({filteredMessages.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onOpenFilters}>
                <Settings className="w-4 h-4 mr-1" />
                Filtros
              </Button>
              <Button size="sm" onClick={onNewMessage}>
                <Send className="w-4 h-4 mr-1" />
                Nova Mensagem
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por telefone ou template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="min-w-[150px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="sent">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="read">Lido</option>
                <option value="failed">Falhou</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-600 mb-2">
                {messages.length === 0 ? 'Nenhuma mensagem enviada' : 'Nenhuma mensagem encontrada'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {messages.length === 0 
                  ? 'As mensagens enviadas aparecerão aqui'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
              {messages.length === 0 && (
                <Button onClick={onNewMessage} variant="outline">
                  <Send className="w-4 h-4 mr-1" />
                  Enviar Primeira Mensagem
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 text-sm font-medium text-slate-600">Telefone</th>
                    <th className="text-left py-3 px-3 text-sm font-medium text-slate-600">Template</th>
                    <th className="text-center py-3 px-3 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-center py-3 px-3 text-sm font-medium text-slate-600">Enviado em</th>
                    <th className="text-center py-3 px-3 text-sm font-medium text-slate-600">Entregue em</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((message) => (
                    <tr key={message.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-3 text-sm font-medium">
                        {message.phone_number}
                      </td>
                      <td className="py-3 px-3 text-sm">
                        {message.template_name || 'Mensagem livre'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(message.status)}
                          <Badge variant={getStatusVariant(message.status)} className="text-xs">
                            {getStatusLabel(message.status)}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-center text-gray-500">
                        {message.sent_at ? new Date(message.sent_at).toLocaleString('pt-BR') : '-'}
                      </td>
                      <td className="py-3 px-3 text-xs text-center text-gray-500">
                        {message.delivered_at ? new Date(message.delivered_at).toLocaleString('pt-BR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
