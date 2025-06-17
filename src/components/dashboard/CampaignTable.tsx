import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/dashboard_ui/card';
import { Badge } from '@/components/dashboard_ui/badge';
import { Button } from '@/components/dashboard_ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/dashboard_ui/tooltip';
import { MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/dashboard_ui/dialog';
import { SheetRow } from '@/hooks/dashboard_hooks/useSheetData';
import { format, parseISO } from 'date-fns';

import { TabSection, usePlatformNavigation } from '@/hooks/dashboard_hooks/usePlatformNavigation';

interface CampaignTableProps {
  data: SheetRow[];
  section?: TabSection;
}


const CampaignTable = ({ data, section = 'campanhas' }: CampaignTableProps) => {
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const { platform } = usePlatformNavigation();


  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatNumber = (num?: number) =>
    typeof num === 'number' && !isNaN(num)
      ? new Intl.NumberFormat('pt-BR').format(num)
      : '0';

  const formatCurrency = (num?: number) =>
    typeof num === 'number' && !isNaN(num)
      ? new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
        }).format(num)
      : 'R$ 0,00';

  const formatFrequency = (num?: number) =>
    typeof num === 'number' && !isNaN(num)
      ? new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num)
      : '0,00';

  const isGoogle = platform === 'google';
  const isRelatorios = platform === 'relatorios';

  const headerTitle = isRelatorios
    ? 'Dados enviados diariamente'
    : section === 'grupos'
      ? 'Dados Detalhados dos Grupos de Anúncio'
      : section === 'anuncios'
        ? 'Dados Detalhados dos Anúncios'
        : 'Dados Detalhados das Campanhas';

  const firstColHeader = isRelatorios
    ? 'Data de Envio'
    : section === 'grupos'
      ? 'Grupo de Anúncio'
      : section === 'anuncios'
        ? 'Anúncio'
        : 'Campanha';

  return (
    <TooltipProvider>
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {headerTitle}
            </CardTitle>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700 transition-all duration-200 hover:scale-105">
              {data.length} registros
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {isRelatorios && section === 'campanhas' ? (
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Data Envio</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[160px]">Conta</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[120px]">Responsável</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Data</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">Contatos</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">Agendado</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Atendimento</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Orçamentos</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">Vendas</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Faturado</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs">Observações</th>
                  </tr>
                ) : section === 'grupos' ? (
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 text-xs w-[200px]">Grupo de Anúncio</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Investimento</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Alcance</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Impressões</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">CPM</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">Cliques</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[60px]">CTR</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">CPC</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Conversões</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[110px]">Custo/Conversão</th>
                  </tr>
                ) : section === 'anuncios' ? (
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 text-xs w-[180px]">Anúncio</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[60px]">Criativo</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Impressões</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">Frequência</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">Cliques</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[60px]">CTR</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Conversões</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Custo/Conversão</th>
                  </tr>
                ) : (
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 text-xs w-[200px]">{firstColHeader}</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Data</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Impressões</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">Cliques</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[60px]">CTR</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Gasto</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">CPM</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Conversões</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[60px]">Ações</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {data.slice(0, 20).map((row, index) => {
                  if (isRelatorios && section === 'campanhas') {
                    return (
                      <tr
                        key={index}
                        className="border-b border-gray-100 dark:border-gray-700"
                      >
                      <td className="py-3 px-2 text-xs text-gray-900 dark:text-gray-100">
                        {row.submissionDate || 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-900 dark:text-gray-100">
                        {row.accountName || 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-900 dark:text-gray-100">
                        {row.responsavel || 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-900 dark:text-gray-100">
                        {row.day ? format(parseISO(row.day), 'dd.MM.yyyy') : 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-right text-xs text-gray-900 dark:text-gray-100">
                        {formatNumber(row.contatos)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs text-gray-900 dark:text-gray-100">
                        {formatNumber(row.agendado)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs text-gray-900 dark:text-gray-100">
                        {formatNumber(row.atendimento)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs text-gray-900 dark:text-gray-100">
                        {formatNumber(row.orcamentos)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs text-gray-900 dark:text-gray-100">
                        {formatNumber(row.vendas)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs text-gray-900 dark:text-gray-100">
                        {formatCurrency(row.faturado)}
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {row.observacoes || 'N/A'}
                      </td>
                    </tr>
                    );
                  }
                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200 group/row"
                    >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="min-w-0 flex-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-xs cursor-help truncate">
                                {truncateText(
                                  (section === 'grupos'
                                    ? row.adSetName
                                    : section === 'anuncios'
                                      ? row.adName
                                      : row.campaignName) || 'N/A',
                                  25
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 p-2 rounded-lg shadow-lg">
                              <p className="font-medium">
                                {section === 'grupos'
                                  ? row.adSetName || 'N/A'
                                  : section === 'anuncios'
                                    ? row.adName || 'N/A'
                                    : row.campaignName || 'N/A'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          {(section !== 'campanhas') && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-gray-500 dark:text-gray-400 cursor-help truncate">
                                  {truncateText(
                                    (section === 'anuncios'
                                      ? row.adSetName
                                      : row.campaignName) || 'N/A',
                                    25
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 p-2 rounded-lg shadow-lg">
                                <p>
                                  {section === 'anuncios'
                                    ? row.adSetName || 'N/A'
                                    : row.campaignName || 'N/A'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {section === 'anuncios' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-gray-500 dark:text-gray-400 cursor-help truncate">
                                  {truncateText(row.campaignName || 'N/A', 25)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 p-2 rounded-lg shadow-lg">
                                <p>{row.campaignName || 'N/A'}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {row.clicks > 100 ? (
                          <TrendingUp className="w-3 h-3 text-green-500 transition-transform duration-200 group-hover/row:scale-110" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500 transition-transform duration-200 group-hover/row:scale-110" />
                        )}
                      </div>
                    </td>
                    {section === 'anuncios' && (
                      <td className="py-3 px-2">
                        {row.thumbnailUrl ? (
                          <img
                            src={row.thumbnailUrl}
                            alt="thumb"
                            className="w-10 h-10 rounded cursor-pointer"
                            onClick={() => setPreviewImage(row.thumbnailUrl)}
                          />
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </td>
                    )}

                    {section === 'campanhas' && (
                      <td className="py-3 px-2">
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                          {row.day ? format(parseISO(row.day), 'dd.MM.yyyy') : 'N/A'}
                        </div>
                      </td>
                    )}

                    {section === 'grupos' && (
                      <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-gray-100 text-xs">
                        {formatCurrency(row.amountSpent)}
                      </td>
                    )}
                    {section === 'grupos' && (
                      <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-gray-100 text-xs">
                        {formatNumber(row.reach)}
                      </td>
                    )}

                    <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-gray-100 text-xs">
                      {formatNumber(row.impressions)}
                    </td>

                    {section === 'anuncios' && (
                      <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-gray-100 text-xs">
                        {formatFrequency(row.frequency)}
                      </td>
                    )}

                    {section === 'grupos' && (
                      <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-gray-100 text-xs">
                        {typeof row.cpm === 'number' && !isNaN(row.cpm) ? `R$ ${row.cpm.toFixed(2)}` : 'R$ 0,00'}
                      </td>
                    )}

                    <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-gray-100 text-xs">
                      {formatNumber(row.clicks)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-gray-100 text-xs">
                      {calculateCTR(row.clicks, row.impressions)}%
                    </td>

                    {section === 'grupos' && (
                      <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-gray-100 text-xs">
                        {typeof row.cpc === 'number' && !isNaN(row.cpc) ? `R$ ${row.cpc.toFixed(2)}` : 'R$ 0,00'}
                      </td>
                    )}

                    {section === 'campanhas' && (
                      <>
                        <td className="py-3 px-2 text-right">
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                            {formatCurrency(row.amountSpent)}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-gray-100 text-xs">
                          {typeof row.cpm === 'number' && !isNaN(row.cpm) ? `R$ ${row.cpm.toFixed(2)}` : 'R$ 0,00'}
                        </td>
                      </>
                    )}

                    <td className="py-3 px-2 text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                        {formatNumber(row.actionMessagingConversationsStarted)}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-gray-100 text-xs">
                      {formatCurrency(
                        row.actionMessagingConversationsStarted > 0
                          ? row.amountSpent / row.actionMessagingConversationsStarted
                          : 0
                      )}
                    </td>
                    {section === 'campanhas' && (
                      <td className="py-3 px-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 h-6 w-6 p-0 transition-all duration-200 hover:scale-110"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </td>
                    )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {data.length > 20 && (
              <div className="mt-4 text-center">
                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:scale-105">
                  Mostrando 20 de {data.length} registros
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="p-0">
          {previewImage && (
            <img src={previewImage} alt="Criativo" className="w-full h-auto" />
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default CampaignTable;
