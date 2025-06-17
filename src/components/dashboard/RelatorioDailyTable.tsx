import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/dashboard_ui/card';
import { SheetRow } from '@/hooks/dashboard_hooks/useSheetData';
import { format, parseISO } from 'date-fns';

interface RelatorioDailyTableProps {
  data: SheetRow[];
}

const RelatorioDailyTable = ({ data }: RelatorioDailyTableProps) => {
  const grouped = React.useMemo(() => {
    const map: Record<string, SheetRow[]> = {};
    data.forEach(row => {
      if (!row.day) return;
      if (!map[row.day]) map[row.day] = [];
      map[row.day].push(row);
    });
    return map;
  }, [data]);

  const dailyData = React.useMemo(() => {
    return Object.entries(grouped)
      .map(([day, rows]) => {
        const sum = (field: keyof SheetRow) =>
          rows.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
        const contatos = sum('contatos');
        const agendado = sum('agendado');
        const atendimento = sum('atendimento');
        const orcamentos = sum('orcamentos');
        const vendas = sum('vendas');
        const faturado = sum('faturado');
        const taxaAgendamento = contatos > 0 ? (agendado * 100) / contatos : 0;
        const taxaConversao = atendimento > 0 ? (vendas * 100) / atendimento : 0;
        return {
          day,
          contatos,
          agendado,
          taxaAgendamento,
          atendimento,
          orcamentos,
          vendas,
          taxaConversao,
          faturado,
        };
      })
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }, [grouped]);

  const formatNumber = (num: number) =>
    num ? new Intl.NumberFormat('pt-BR').format(num) : '0';
  const formatCurrency = (num: number) =>
    num
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
      : 'R$ 0,00';
  const formatPercentage = (num: number) =>
    `${num.toFixed(2)}%`;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Detalhamento de Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Data</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">Contatos</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">Agendados</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[120px]">Taxa de Agendamento</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Atendimentos</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Orçamentos</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[80px]">Vendas</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[120px]">Taxa de Conversão</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[100px]">Faturado</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-2 text-xs text-gray-900 dark:text-gray-100">
                    {format(parseISO(row.day), 'dd.MM.yyyy')}
                  </td>
                  <td className="py-3 px-2 text-right text-xs text-gray-900 dark:text-gray-100">
                    {formatNumber(row.contatos)}
                  </td>
                  <td className="py-3 px-2 text-right text-xs text-gray-900 dark:text-gray-100">
                    {formatNumber(row.agendado)}
                  </td>
                  <td className="py-3 px-2 text-right text-xs text-gray-900 dark:text-gray-100">
                    {formatPercentage(row.taxaAgendamento)}
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
                    {formatPercentage(row.taxaConversao)}
                  </td>
                  <td className="py-3 px-2 text-right text-xs text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.faturado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioDailyTable;
