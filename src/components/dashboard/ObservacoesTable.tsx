import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/dashboard_ui/card';
import { SheetRow } from '@/hooks/dashboard_hooks/useSheetData';
import { format, parseISO } from 'date-fns';

interface ObservacoesTableProps {
  data: SheetRow[];
}

const ObservacoesTable = ({ data }: ObservacoesTableProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Observações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 text-xs w-[120px]">Data</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs w-[160px]">Responsável</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-xs">Observações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-xs text-gray-900 dark:text-gray-100">
                    {row.day ? format(parseISO(row.day), 'dd.MM.yyyy') : row.submissionDate || 'N/A'}
                  </td>
                  <td className="py-3 px-2 text-xs text-gray-900 dark:text-gray-100">
                    {row.responsavel || 'N/A'}
                  </td>
                  <td className="py-3 px-2 text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {row.observacoes || 'N/A'}
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

export default ObservacoesTable;
