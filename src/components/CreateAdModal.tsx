
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { uploadImage, createAdCreative, createAd } from '@/lib/metaApi';
import { useMetaData } from '@/hooks/useMetaData';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adSetId?: string;
}

export function CreateAdModal({ isOpen, onClose, onSuccess, adSetId }: CreateAdModalProps) {
  const { credentials, selectedAdAccount } = useMetaData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    adset_id: adSetId || '',
    status: 'PAUSED',
    message: '',
    headline: '',
    description: '',
    link: '',
    page_id: '',
    call_to_action: 'LEARN_MORE'
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials?.access_token || !selectedAdAccount || !imageFile) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios e selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Upload da imagem
      setUploadingImage(true);
      const imageHash = await uploadImage(credentials.access_token, selectedAdAccount, imageFile);
      setUploadingImage(false);

      // 2. Criar o criativo
      const creativeData = {
        name: `Criativo - ${formData.name}`,
        object_story_spec: {
          page_id: formData.page_id,
          link_data: {
            link: formData.link,
            image_hash: imageHash,
            message: formData.message,
            name: formData.headline,
            description: formData.description,
            call_to_action: {
              type: formData.call_to_action
            }
          }
        }
      };

      const creative = await createAdCreative(credentials.access_token, selectedAdAccount, creativeData);

      // 3. Criar o anúncio
      const adData = {
        name: formData.name,
        adset_id: formData.adset_id,
        creative: { creative_id: creative.id },
        status: formData.status
      };

      await createAd(credentials.access_token, selectedAdAccount, adData);
      
      toast({
        title: 'Sucesso',
        description: 'Anúncio criado com sucesso.',
      });
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        adset_id: '',
        status: 'PAUSED',
        message: '',
        headline: '',
        description: '',
        link: '',
        page_id: '',
        call_to_action: 'LEARN_MORE'
      });
      setImageFile(null);
      setImagePreview('');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar anúncio.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Anúncio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Anúncio</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adset_id">ID do Conjunto de Anúncios</Label>
              <Input
                id="adset_id"
                value={formData.adset_id}
                onChange={(e) => setFormData({ ...formData, adset_id: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page_id">ID da Página</Label>
              <Input
                id="page_id"
                value={formData.page_id}
                onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
                required
                placeholder="Ex: 123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link de Destino</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                required
                placeholder="https://seusite.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Texto Principal do Anúncio</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={3}
              placeholder="Escreva o texto principal que aparecerá no anúncio..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Título</Label>
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="Título chamativo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição adicional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Chamada para Ação</Label>
            <Select value={formData.call_to_action} onValueChange={(value) => setFormData({ ...formData, call_to_action: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEARN_MORE">Saiba Mais</SelectItem>
                <SelectItem value="SHOP_NOW">Compre Agora</SelectItem>
                <SelectItem value="SIGN_UP">Inscreva-se</SelectItem>
                <SelectItem value="DOWNLOAD">Baixar</SelectItem>
                <SelectItem value="CONTACT_US">Fale Conosco</SelectItem>
                <SelectItem value="BOOK_TRAVEL">Reservar</SelectItem>
                <SelectItem value="WATCH_MORE">Assistir Mais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Upload da Imagem</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} alt="Preview" className="max-w-full h-48 object-cover rounded" />
                  <Button type="button" variant="outline" onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}>
                    Remover Imagem
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Clique para fazer upload da imagem
                      </span>
                      <Input
                        id="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG até 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="PAUSED">Pausado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              {uploadingImage ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Fazendo upload...
                </>
              ) : loading ? (
                'Criando...'
              ) : (
                'Criar Anúncio'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
