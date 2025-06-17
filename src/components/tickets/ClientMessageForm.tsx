
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Upload, X, File } from 'lucide-react';
import { toast } from 'sonner';

interface ClientMessageFormProps {
  ticketId: string;
  onSuccess: () => void;
  className?: string;
}

export function ClientMessageForm({ ticketId, onSuccess, className }: ClientMessageFormProps) {
  const [mensagem, setMensagem] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conteudo: string; arquivo_url?: string }) => {
      const { error } = await supabase
        .from('chamados_mensagens')
        .insert({
          chamado_id: ticketId,
          conteudo: data.conteudo,
          arquivo_url: data.arquivo_url,
          autor_id: user?.id,
          autor_nome: user?.email || 'Cliente',
          autor_tipo: 'cliente'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mensagem enviada com sucesso!');
      setMensagem('');
      setArquivo(null);
      setError('');
      onSuccess();
    },
    onError: (error) => {
      console.error('Erro ao enviar mensagem:', error);
      setError('Erro ao enviar mensagem. Tente novamente.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mensagem.trim()) {
      setError('Digite uma mensagem.');
      return;
    }

    let arquivo_url = undefined;

    if (arquivo) {
      try {
        const fileExt = arquivo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('tickets')
          .upload(fileName, arquivo);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          setError('Erro ao fazer upload do arquivo. A mensagem será enviada sem o anexo.');
        } else {
          const { data } = supabase.storage
            .from('tickets')
            .getPublicUrl(fileName);
          arquivo_url = data.publicUrl;
        }
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
        setError('Erro ao fazer upload do arquivo. A mensagem será enviada sem o anexo.');
      }
    }

    sendMessageMutation.mutate({
      conteudo: mensagem.trim(),
      arquivo_url,
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
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mensagem">Sua mensagem</Label>
          <Textarea
            id="mensagem"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite sua mensagem para a equipe de suporte..."
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
            id="file-input"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            Anexar
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          disabled={sendMessageMutation.isPending || !mensagem.trim()}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {sendMessageMutation.isPending ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </form>
    </div>
  );
}
