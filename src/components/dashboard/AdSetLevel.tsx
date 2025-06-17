
import React from 'react';
import { Card, CardContent } from '@/components/dashboard_ui/card';
import { Badge } from '@/components/dashboard_ui/badge';
import { Button } from '@/components/dashboard_ui/button';
import { ChevronRight, ChevronLeft, Eye, Users, MousePointer, DollarSign } from 'lucide-react';
import { AdSetGroup } from '@/hooks/dashboard_hooks/useHierarchicalData';

interface AdSetLevelProps {
  adSets: AdSetGroup[];
  campaignName: string;
  onAdSetClick: (adSet: AdSetGroup) => void;
  onBackClick: () => void;
}

const AdSetLevel = ({ adSets, campaignName, onAdSetClick, onBackClick }: AdSetLevelProps) => {
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
        <h2 className="text-xl font-semibold text-gray-900">{campaignName}</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {adSets.length} grupos de anúncio
        </Badge>
      </div>

      {adSets.map((adSet) => (
        <Card key={adSet.adSetName} className="hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{adSet.adSetName}</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {adSet.ads.length} anúncios
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Impressões</p>
                      <p className="font-semibold">{formatNumber(adSet.totalImpressions)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MousePointer className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Cliques</p>
                      <p className="font-semibold">{formatNumber(adSet.totalClicks)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500">Gasto</p>
                      <p className="font-semibold">{formatCurrency(adSet.totalSpent)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Conversões</p>
                      <p className="font-semibold">{formatNumber(adSet.totalConversions)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAdSetClick(adSet)}
                className="ml-4 hover:bg-gray-100"
              >
                Ver anúncios
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdSetLevel;
