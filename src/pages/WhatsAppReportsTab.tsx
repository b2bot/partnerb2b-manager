import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Download, Upload, Search, Filter, BarChart3 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function WhatsAppReportsTab() {
  const [date, setDate] = useState<Date>();

  // Sample data for WhatsApp reports
  const reports = [
    {
      id: 1,
      campaign: 'Campanha Black Friday',
      totalMessages: 1250,
      delivered: 1198,
      read: 856,
      responded: 324,
      converted: 89,
      conversionRate: 7.1,
      cost: 2840.50,
      cpa: 31.91,
      date: '2024-01-15'
    },
    {
      id: 2,
      campaign: 'Promoção Natal',
      totalMessages: 950,
      delivered: 892,
      read: 645,
      responded: 198,
      converted: 54,
      conversionRate: 5.7,
      cost: 1950.00,
      cpa: 36.11,
      date: '2024-01-14'
    },
    {
      id: 3,
      campaign: 'Lançamento Produto',
      totalMessages: 780,
      delivered: 765,
      read: 542,
      responded: 156,
      converted: 43,
      conversionRate: 5.5,
      cost: 1680.75,
      cpa: 39.09,
      date: '2024-01-13'
    }
  ];

  // ... keep existing code (totalMetrics calculation)
  const totalMetrics = {
    totalMessages: reports.reduce((sum, r) => sum + r.totalMessages, 0),
    delivered: reports.reduce((sum, r) => sum + r.delivered, 0),
    read: reports.reduce((sum, r) => sum + r.read, 0),
    responded: reports.reduce((sum, r) => sum + r.responded, 0),
    converted: reports.reduce((sum, r) => sum + r.converted, 0),
    totalCost: reports.reduce((sum, r) => sum + r.cost, 0),
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Relatórios WhatsApp</h1>
          <p className="text-xs text-slate-600 mt-1">
            Analise o desempenho das suas campanhas de WhatsApp Business
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs px-2">
            <Upload className="h-3 w-3 mr-1" />
            Importar
          </Button>
          <Button size="sm" className="h-7 text-xs px-2">
            <Download className="h-3 w-3 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-7 text-xs px-2",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {date ? format(date, "PPP", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Campanha</Label>
              <Select>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Todas as campanhas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as campanhas</SelectItem>
                  <SelectItem value="blackfriday">Campanha Black Friday</SelectItem>
                  <SelectItem value="natal">Promoção Natal</SelectItem>
                  <SelectItem value="lancamento">Lançamento Produto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
                <Input 
                  placeholder="Buscar campanhas..." 
                  className="pl-7 h-7 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-slate-600">Mensagens Enviadas</div>
            <div className="text-lg font-bold">{totalMetrics.totalMessages.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-slate-600">Entregues</div>
            <div className="text-lg font-bold">{totalMetrics.delivered.toLocaleString()}</div>
            <div className="text-xs text-green-600">
              {((totalMetrics.delivered / totalMetrics.totalMessages) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-slate-600">Lidas</div>
            <div className="text-lg font-bold">{totalMetrics.read.toLocaleString()}</div>
            <div className="text-xs text-blue-600">
              {((totalMetrics.read / totalMetrics.delivered) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-slate-600">Respondidas</div>
            <div className="text-lg font-bold">{totalMetrics.responded.toLocaleString()}</div>
            <div className="text-xs text-orange-600">
              {((totalMetrics.responded / totalMetrics.read) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-slate-600">Conversões</div>
            <div className="text-lg font-bold">{totalMetrics.converted.toLocaleString()}</div>
            <div className="text-xs text-green-600">
              {((totalMetrics.converted / totalMetrics.responded) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-slate-600">Custo Total</div>
            <div className="text-lg font-bold">R$ {totalMetrics.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios por Campanha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-600">Campanha</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Enviadas</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Entregues</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Lidas</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Respondidas</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Conversões</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Taxa Conv.</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Custo</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">CPA</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Data</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-slate-50">
                    <td className="py-2 px-3 text-xs font-medium">{report.campaign}</td>
                    <td className="py-2 px-3 text-xs text-center">{report.totalMessages.toLocaleString()}</td>
                    <td className="py-2 px-3 text-xs text-center">{report.delivered.toLocaleString()}</td>
                    <td className="py-2 px-3 text-xs text-center">{report.read.toLocaleString()}</td>
                    <td className="py-2 px-3 text-xs text-center">{report.responded.toLocaleString()}</td>
                    <td className="py-2 px-3 text-xs text-center">{report.converted.toLocaleString()}</td>
                    <td className="py-2 px-3 text-xs text-center">
                      <Badge variant="outline" className="text-xs">
                        {report.conversionRate}%
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-xs text-center">
                      R$ {report.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-xs text-center">
                      R$ {report.cpa.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-xs text-center">{new Date(report.date).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
