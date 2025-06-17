
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, AlertCircle, CheckCircle, User, Clock } from 'lucide-react';

interface TimelineEntry {
  id: string;
  tipo: string;
  conteudo: string;
  autor_nome: string;
  autor_tipo: 'cliente' | 'admin' | 'sistema';
  created_at: string;
  metadata?: any;
}

interface TicketTimelineProps {
  timeline: TimelineEntry[];
}

export function TicketTimeline({ timeline }: TicketTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntryIcon = (tipo: string, autorTipo: string) => {
    switch (tipo) {
      case 'criacao':
        return <AlertCircle className="h-4 w-4" />;
      case 'mensagem':
        return <MessageCircle className="h-4 w-4" />;
      case 'resposta':
        return <MessageCircle className="h-4 w-4" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEntryColor = (tipo: string, autorTipo: string) => {
    switch (autorTipo) {
      case 'admin':
        return 'bg-blue-500';
      case 'cliente':
        return 'bg-green-500';
      case 'sistema':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getEntryLabel = (tipo: string) => {
    switch (tipo) {
      case 'criacao':
        return 'Criado';
      case 'mensagem':
        return 'Mensagem';
      case 'resposta':
        return 'Resposta';
      case 'status_change':
        return 'Status alterado';
      default:
        return tipo;
    }
  };

  return (
    <div className="space-y-4">
      {timeline.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <Avatar className={`h-8 w-8 ${getEntryColor(entry.tipo, entry.autor_tipo)} text-white`}>
              <AvatarFallback className={`${getEntryColor(entry.tipo, entry.autor_tipo)} text-white text-xs`}>
                {entry.autor_tipo === 'sistema' ? (
                  getEntryIcon(entry.tipo, entry.autor_tipo)
                ) : (
                  getInitials(entry.autor_nome)
                )}
              </AvatarFallback>
            </Avatar>
            {index < timeline.length - 1 && (
              <div className="w-px h-8 bg-gray-200 mt-2" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{entry.autor_nome}</span>
              <Badge variant="outline" className="text-xs">
                {getEntryLabel(entry.tipo)}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatDate(entry.created_at)}
              </span>
            </div>

            <div className={`p-3 rounded-lg ${
              entry.autor_tipo === 'admin' 
                ? 'bg-blue-50 border-l-4 border-blue-400' 
                : entry.autor_tipo === 'cliente'
                ? 'bg-green-50 border-l-4 border-green-400'
                : 'bg-gray-50 border-l-4 border-gray-400'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{entry.conteudo}</p>
              
              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  {entry.metadata.titulo && (
                    <p><strong>Título:</strong> {entry.metadata.titulo}</p>
                  )}
                  {entry.metadata.categoria && (
                    <p><strong>Categoria:</strong> {entry.metadata.categoria}</p>
                  )}
                  {entry.metadata.prioridade && (
                    <p><strong>Prioridade:</strong> {entry.metadata.prioridade}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
