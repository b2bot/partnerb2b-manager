
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  observacoes_internas?: string;
  tipo_acesso: 'api' | 'sheet';
  ativo: boolean;
  profiles: {
    email: string;
    role: string;
  };
  contas: {
    id: string;
    tipo: 'meta' | 'google';
    identificador: string;
    nome: string;
  }[];
}

interface EditClientModalProps {
  client: Cliente;
  open: boolean;
  onClose: () => void;
}

export function EditClientModal({ client, open, onClose }: EditClientModalProps) {
  const [nome, setNome] = useState(client.nome);
  const [email, setEmail] = useState(client.email || '');
  const [telefone, setTelefone] = useState(client.telefone || '');
  const [empresa, setEmpresa] = useState(client.empresa || '');
  const [observacoesInternas, setObservacoesInternas] = useState(client.observacoes_internas || '');
  const [tipoAcesso, setTipoAcesso] = useState<'api' | 'sheet' | 'placeholder'>(client.tipo_acesso || 'placeholder');
  const [contasMeta, setContasMeta] = useState<Array<{ id?: string; identificador: string; nome: string }>>([]);
  const [contasGoogle, setContasGoogle] = useState<Array<{ id?: string; identificador: string; nome: string }>>([]);
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  useEffect(() => {
    setNome(client.nome);
    setEmail(client.email || '');
    setTelefone(client.telefone || '');
    setEmpresa(client.empresa || '');
    setObservacoesInternas(client.observacoes_internas || '');
    setTipoAcesso(client.tipo_acesso);
    
    const metaAccounts = client.contas.filter(c => c.tipo === 'meta').map(c => ({
      id: c.id,
      identificador: c.identificador,
      nome: c.nome,
    }));
    
    const googleAccounts = client.contas.filter(c => c.tipo === 'google').map(c => ({
      id: c.id,
      identificador: c.identificador,
      nome: c.nome,
    }));
    
    setContasMeta(metaAccounts);
    setContasGoogle(googleAccounts);
  }, [client]);

  const updateClientMutation = useMutation({
    mutationFn: async (data: {
      nome: string;
      email: string;
      telefone: string;
      empresa: string;
      observacoesInternas: string;
      tipoAcesso: 'api' | 'sheet';
      contas: Array<{ id?: string; tipo: 'meta' | 'google'; identificador: string; nome: string }>;
    }) => {
      // Atualizar dados do cliente
      const { error: clienteError } = await supabase
        .from('clientes')
        .update({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          empresa: data.empresa,
          observacoes_internas: data.observacoesInternas,
          tipo_acesso: data.tipoAcesso,
        })
        .eq('id', client.id);

      if (clienteError) throw clienteError;

      // Remover contas existentes
      const { error: deleteError } = await supabase
        .from('contas')
        .delete()
        .eq('cliente_id', client.id);

      if (deleteError) throw deleteError;

      // Adicionar novas contas
      if (data.contas.length > 0) {
        const contasToInsert = data.contas.map(conta => ({
          cliente_id: client.id,
          tipo: conta.tipo,
          identificador: conta.identificador,
          nome: conta.nome,
        }));

        const { error: contasError } = await supabase
          .from('contas')
          .insert(contasToInsert);

        if (contasError) throw contasError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients-management'] });
      toast.success('Cliente atualizado com sucesso!');
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao atualizar cliente:', error);
      setError('Erro ao atualizar cliente. Tente novamente.');
    },
  });

  const addMetaAccount = () => {
    setContasMeta([...contasMeta, { identificador: '', nome: '' }]);
  };

  const removeMetaAccount = (index: number) => {
    setContasMeta(contasMeta.filter((_, i) => i !== index));
  };

  const updateMetaAccount = (index: number, field: 'identificador' | 'nome', value: string) => {
    const updated = contasMeta.map((conta, i) => 
      i === index ? { ...conta, [field]: value } : conta
    );
    setContasMeta(updated);
  };

  const addGoogleAccount = () => {
    setContasGoogle([...contasGoogle, { identificador: '', nome: '' }]);
  };

  const removeGoogleAccount = (index: number) => {
    setContasGoogle(contasGoogle.filter((_, i) => i !== index));
  };

  const updateGoogleAccount = (index: number, field: 'identificador' | 'nome', value: string) => {
    const updated = contasGoogle.map((conta, i) => 
      i === index ? { ...conta, [field]: value } : conta
    );
    setContasGoogle(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome.trim()) {
      setError('Nome é obrigatório.');
      return;
    }

    if (tipoAcesso === 'placeholder') {
      setError('Tipo de acesso é obrigatório.');
      return;
    }

    const allContas = [
      ...contasMeta.filter(c => c.identificador && c.nome).map(c => ({ ...c, tipo: 'meta' as const })),
      ...contasGoogle.filter(c => c.identificador && c.nome).map(c => ({ ...c, tipo: 'google' as const })),
    ];

    updateClientMutation.mutate({
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      empresa: empresa.trim(),
      observacoesInternas: observacoesInternas.trim(),
      tipoAcesso: tipoAcesso as 'api' | 'sheet',
      contas: allContas,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (não editável)</Label>
              <Input
                id="email"
                value={client.profiles.email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone de contato</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Nome da empresa</Label>
              <Input
                id="empresa"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Nome da empresa do cliente"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações internas</Label>
            <Input
              id="observacoes"
              value={observacoesInternas}
              onChange={(e) => setObservacoesInternas(e.target.value)}
              placeholder="Observações internas sobre o cliente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoAcesso">Tipo de acesso aos dados</Label>
            <Select value={tipoAcesso} onValueChange={(value: 'api' | 'sheet' | 'placeholder') => setTipoAcesso(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de acesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>Selecione o tipo de acesso</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="sheet">Google Sheets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contas Meta */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Contas Meta</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMetaAccount}>
                Adicionar Conta Meta
              </Button>
            </div>
            {contasMeta.map((conta, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="ID da conta Meta"
                  value={conta.identificador}
                  onChange={(e) => updateMetaAccount(index, 'identificador', e.target.value)}
                />
                <Input
                  placeholder="Nome da conta"
                  value={conta.nome}
                  onChange={(e) => updateMetaAccount(index, 'nome', e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => removeMetaAccount(index)}>
                  Remover
                </Button>
              </div>
            ))}
          </div>

          {/* Contas Google */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Contas Google</Label>
              <Button type="button" variant="outline" size="sm" onClick={addGoogleAccount}>
                Adicionar Conta Google
              </Button>
            </div>
            {contasGoogle.map((conta, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="ID da conta Google"
                  value={conta.identificador}
                  onChange={(e) => updateGoogleAccount(index, 'identificador', e.target.value)}
                />
                <Input
                  placeholder="Nome da conta"
                  value={conta.nome}
                  onChange={(e) => updateGoogleAccount(index, 'nome', e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => removeGoogleAccount(index)}>
                  Remover
                </Button>
              </div>
            ))}
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
              disabled={updateClientMutation.isPending}
              className="flex-1"
            >
              {updateClientMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
