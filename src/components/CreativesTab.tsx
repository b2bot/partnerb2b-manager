
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Image as ImageIcon, Eye } from 'lucide-react';
import { UploadCreativeModal } from '@/components/UploadCreativeModal';
import { CreativeDetailModal } from '@/components/CreativeDetailModal';

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

export function CreativesTab() {
  const { isAdmin } = useAuth();
  const { clienteData } = useUserAccess();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);

  const { data: creatives, isLoading } = useQuery({
    queryKey: ['creatives'],
    queryFn: async () => {
      let query = supabase
        .from('criativos')
        .select(`
          *,
          clientes:cliente_id (nome)
        `)
        .order('created_at', { ascending: false });

      // Para clientes, filtrar apenas seus criativos
      if (!isAdmin && clienteData?.id) {
        query = query.eq('cliente_id', clienteData.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Creative[];
    },
    enabled: isAdmin || !!clienteData?.id,
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {isAdmin ? 'Gerenciar Criativos' : 'Meus Criativos'}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {isAdmin 
              ? 'Envie criativos para aprovação dos clientes'
              : 'Revise e aprove os criativos enviados pela equipe'
            }
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setUploadModalOpen(true)} size="sm" className="h-7 text-xs px-2">
            <Plus className="h-3 w-3 mr-1" />
            Enviar Criativo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creatives?.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6 text-center">
                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {isAdmin ? 'Nenhum criativo encontrado' : 'Você ainda não tem criativos'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isAdmin 
                    ? 'Comece enviando criativos para seus clientes aprovarem.'
                    : 'Quando a equipe enviar criativos, eles aparecerão aqui para sua aprovação.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          creatives?.map((creative) => (
            <Card key={creative.id} className="overflow-hidden">
              <div className="aspect-video relative bg-gray-100">
                {creative.tipo_arquivo.startsWith('image/') ? (
                  <img
                    src={creative.arquivo_url}
                    alt={creative.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={creative.arquivo_url}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={`${getStatusColor(creative.status)} text-xs`}>
                    {getStatusLabel(creative.status)}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="space-y-1">
                  {creative.campanha && (
                    <p className="text-xs font-medium text-blue-600">
                      {creative.campanha}
                    </p>
                  )}
                  <CardTitle className="text-sm">
                    {creative.nome_criativo || creative.titulo}
                  </CardTitle>
                  {isAdmin && (
                    <p className="text-xs text-slate-500">
                      Cliente: {creative.clientes?.nome}
                    </p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {creative.titulo_anuncio && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      <strong>Título:</strong> {creative.titulo_anuncio}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>
                      {new Date(creative.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCreative(creative)}
                      className="h-6 text-xs px-2"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {uploadModalOpen && (
        <UploadCreativeModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
        />
      )}

      {selectedCreative && (
        <CreativeDetailModal
          creative={selectedCreative}
          open={!!selectedCreative}
          onClose={() => setSelectedCreative(null)}
        />
      )}
    </div>
  );
}
