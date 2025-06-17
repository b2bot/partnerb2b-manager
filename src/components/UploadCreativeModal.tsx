
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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

interface UploadCreativeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadCreativeModal({ open, onClose }: UploadCreativeModalProps) {
  const [campanha, setCampanha] = useState('');
  const [nomeCriativo, setNomeCriativo] = useState('');
  const [tituloAnuncio, setTituloAnuncio] = useState('');
  const [descricaoAnuncio, setDescricaoAnuncio] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  const { data: clientes } = useQuery({
    queryKey: ['clientes-for-creative'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
  });

  const uploadCreativeMutation = useMutation({
    mutationFn: async (data: { 
      campanha: string;
      nomeCriativo: string;
      tituloAnuncio: string;
      descricaoAnuncio: string;
      clienteId: string; 
      arquivo: File 
    }) => {
      // Upload do arquivo
      const fileExt = data.arquivo.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('criativos')
        .upload(fileName, data.arquivo);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('criativos')
        .getPublicUrl(fileName);

      // Criar registro do criativo
      const { error: insertError } = await supabase
        .from('criativos')
        .insert({
          cliente_id: data.clienteId,
          titulo: `${data.campanha} - ${data.nomeCriativo}`,
          campanha: data.campanha,
          nome_criativo: data.nomeCriativo,
          titulo_anuncio: data.tituloAnuncio,
          descricao_anuncio: data.descricaoAnuncio,
          arquivo_url: urlData.publicUrl,
          tipo_arquivo: data.arquivo.type,
          status: 'pendente',
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatives'] });
      toast.success('Criativo enviado com sucesso!');
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao enviar criativo:', error);
      setError('Erro ao enviar criativo. Tente novamente.');
    },
  });

  const resetForm = () => {
    setCampanha('');
    setNomeCriativo('');
    setTituloAnuncio('');
    setDescricaoAnuncio('');
    setClienteId('');
    setArquivo(null);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!campanha.trim() || !nomeCriativo.trim() || !clienteId || !arquivo) {
      setError('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }

    // Verificar tipo do arquivo
    if (!arquivo.type.startsWith('image/') && !arquivo.type.startsWith('video/')) {
      setError('Apenas imagens e vídeos são aceitos.');
      return;
    }

    // Verificar tamanho do arquivo (max 50MB)
    if (arquivo.size > 50 * 1024 * 1024) {
      setError('Arquivo deve ter no máximo 50MB.');
      return;
    }

    uploadCreativeMutation.mutate({
      campanha: campanha.trim(),
      nomeCriativo: nomeCriativo.trim(),
      tituloAnuncio: tituloAnuncio.trim(),
      descricaoAnuncio: descricaoAnuncio.trim(),
      clienteId,
      arquivo,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Criativo para Cliente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="campanha">Campanha *</Label>
            <Input
              id="campanha"
              value={campanha}
              onChange={(e) => setCampanha(e.target.value)}
              placeholder="Nome da campanha"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeCriativo">Nome do Criativo *</Label>
            <Input
              id="nomeCriativo"
              value={nomeCriativo}
              onChange={(e) => setNomeCriativo(e.target.value)}
              placeholder="Nome identificador do criativo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tituloAnuncio">Título do Anúncio</Label>
            <Input
              id="tituloAnuncio"
              value={tituloAnuncio}
              onChange={(e) => setTituloAnuncio(e.target.value)}
              placeholder="Título que aparecerá no anúncio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricaoAnuncio">Descrição do Anúncio</Label>
            <Textarea
              id="descricaoAnuncio"
              value={descricaoAnuncio}
              onChange={(e) => setDescricaoAnuncio(e.target.value)}
              placeholder="Descrição que aparecerá no anúncio"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arquivo">Arquivo *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="arquivo"
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*"
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
              Formatos aceitos: imagens e vídeos (máx. 50MB)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={uploadCreativeMutation.isPending}
              className="flex-1"
            >
              {uploadCreativeMutation.isPending ? 'Enviando...' : 'Enviar Criativo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
