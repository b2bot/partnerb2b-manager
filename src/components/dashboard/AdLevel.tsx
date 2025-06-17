
import React from 'react';
import { Card, CardContent } from '@/components/dashboard_ui/card';
import { Badge } from '@/components/dashboard_ui/badge';
import { Button } from '@/components/dashboard_ui/button';
import { ChevronLeft, Eye, Users, MousePointer, DollarSign } from 'lucide-react';
import { AdGroup } from '@/hooks/dashboard_hooks/useHierarchicalData';

interface AdLevelProps {
  ads: AdGroup[];
  adSetName: string;
  campaignName: string;
  onBackClick: () => void;
}

const AdLevel = ({ ads, adSetName, campaignName, onBackClick }: AdLevelProps) => {
  const formatNumber = (num?: number) =>
    typeof num === 'number' && !isNaN(num)
      ? new Intl.NumberFormat('pt-BR').format(num)
      : '0';

  const formatCurrency = (num?: number) =>
    typeof num === 'number' && !isNaN(num)
      ? new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(num) 
      : 'R$ 0,00';

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBackClick}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{adSetName}</h2>
          <p className="text-sm text-gray-500">{campaignName}</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {ads.length} anúncios
        </Badge>
      </div>

      {ads.map((ad) => (
        <Card key={ad.id} className="hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{ad.name}</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Impressões</p>
                      <p className="font-semibold">{formatNumber(ad.impressions)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MousePointer className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Cliques</p>
                      <p className="font-semibold">{formatNumber(ad.clicks)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500">Gasto</p>
                      <p className="font-semibold">{formatCurrency(ad.spent)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Conversões</p>
                      <p className="font-semibold">{formatNumber(ad.conversions)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdLevel;
