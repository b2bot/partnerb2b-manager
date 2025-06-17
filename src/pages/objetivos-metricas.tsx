
import { MetricsCustomization } from '@/components/MetricsCustomization';

export default function ObjetivosMetricasPage() {
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800">Objetivos de Métricas</h1>
        <p className="text-xs text-slate-600 mt-1">
          Configure quais métricas da Meta Ads API serão exibidas em cada página do sistema. 
          Escolha entre todas as métricas disponíveis para personalizar completamente sua experiência de análise.
        </p>
      </div>
      
      <MetricsCustomization onClose={() => {}} />
    </div>
  );
}
