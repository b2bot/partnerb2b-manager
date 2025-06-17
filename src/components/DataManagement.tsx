
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollapsibleAccountFilter } from '@/components/CollapsibleAccountFilter';
import { MetricsCustomization } from '@/components/MetricsCustomization';
import { useMetaData } from '@/hooks/useMetaData';
import { Building2, BarChart3 } from 'lucide-react';

export function DataManagement() {
  const { selectedAdAccount, setSelectedAdAccount } = useMetaData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Dados</h2>
        <p className="text-slate-600 mt-2">
          Configure a conta de anúncios e personalize as métricas exibidas no sistema
        </p>
      </div>

      {/* Seleção de Conta de Anúncios */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Conta de Anúncios Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Selecione a conta de anúncios que será usada em todas as páginas operacionais (Campanhas, Conjuntos e Anúncios).
            </p>
            <CollapsibleAccountFilter 
              selectedAccount={selectedAdAccount}
              onAccountChange={setSelectedAdAccount}
            />
          </div>
        </CardContent>
      </Card>

      {/* Personalização de Métricas */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Personalização de Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Configure quais métricas serão exibidas em cada página do sistema.
            </p>
            <MetricsCustomization onClose={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
