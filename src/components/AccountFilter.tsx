
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMetaData } from '@/hooks/useMetaData';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Shield, AlertCircle } from 'lucide-react';

export function AccountFilter() {
  const { adAccounts, selectedAdAccount, setSelectedAdAccount, selectedAdAccountName, loading, errors } = useMetaData();
  const { isAdmin } = useAuth();

  // Se há erro nas credenciais
  if (errors.credentials) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar credenciais da Meta API. Verifique as configurações.
        </AlertDescription>
      </Alert>
    );
  }

  // Se há erro ao carregar contas
  if (errors.adAccounts) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar contas de anúncios: {errors.adAccounts.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (loading.credentials || loading.adAccounts) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <Label className="text-sm font-medium text-slate-500">
            {loading.credentials ? 'Carregando credenciais...' : 'Carregando contas...'}
          </Label>
        </div>
      </div>
    );
  }

  if (!adAccounts || adAccounts.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhuma conta de anúncios encontrada. Verifique as configurações da API Meta e se o Access Token tem as permissões corretas.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-slate-600" />
        {isAdmin && <Shield className="w-3 h-3 text-amber-500" />}
        <Label className="text-sm font-medium text-slate-700">
          Conta de Anúncios:
        </Label>
      </div>
      <Select value={selectedAdAccount} onValueChange={setSelectedAdAccount}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Selecione uma conta">
            {selectedAdAccountName && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedAdAccountName}</span>
                <span className="text-xs text-slate-500">({selectedAdAccount.replace('act_', '')})</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {adAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex flex-col">
                <span className="font-medium">{account.name}</span>
                <span className="text-xs text-slate-500">{account.id.replace('act_', '')}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isAdmin && (
        <span className="text-xs text-amber-600 font-medium">Admin - Todas as contas</span>
      )}
    </div>
  );
}
