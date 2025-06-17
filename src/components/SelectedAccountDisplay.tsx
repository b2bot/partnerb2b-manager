
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Settings } from 'lucide-react';
import { useMetaData } from '@/hooks/useMetaData';
import { Button } from '@/components/ui/button';

export function SelectedAccountDisplay() {
  const { selectedAdAccount, selectedAdAccountName, adAccounts } = useMetaData();

  if (!selectedAdAccount) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Nenhuma conta selecionada
              </span>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Configurar em Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const account = adAccounts.find(acc => acc.id === selectedAdAccount);
  const accountName = account?.name || selectedAdAccountName || selectedAdAccount;

  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Conta Ativa:
            </span>
            <Badge variant="outline" className="bg-white dark:bg-slate-800">
              {accountName}
            </Badge>
          </div>
          <span className="text-xs text-green-600 dark:text-green-400">
            Configurado em Configurações → Gestão de Dados
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
