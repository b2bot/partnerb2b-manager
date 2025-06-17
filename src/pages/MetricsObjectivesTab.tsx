
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Target,
  Plus,
  Info,
  Save,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

interface MetricRange {
  good: [number, number];
  medium: [number, number];
  bad: [number, number];
}

interface MetricTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  metrics: {
    cpc: MetricRange;
    ctr: MetricRange;
    ctrLink: MetricRange;
    cpm: MetricRange;
    roas: MetricRange;
    cpa: MetricRange;
    conversionRate: MetricRange;
    connectRate: MetricRange;
    cpr: MetricRange;
  };
}

export function MetricsObjectivesTab() {
  const [templates, setTemplates] = useState<MetricTemplate[]>([
    {
      id: '1',
      name: 'Template Padrão',
      isDefault: true,
      metrics: {
        cpc: { good: [0, 6.80], medium: [6.80, 18.80], bad: [18.80, 30] },
        ctr: { good: [5, 10], medium: [2, 5], bad: [0, 2] },
        ctrLink: { good: [10, 15], medium: [5, 10], bad: [0, 5] },
        cpm: { good: [0, 25], medium: [25, 50], bad: [50, 100] },
        roas: { good: [20, 40], medium: [10, 20], bad: [0, 10] },
        cpa: { good: [0, 250], medium: [250, 500], bad: [500, 1000] },
        conversionRate: { good: [5, 10], medium: [2, 5], bad: [0, 2] },
        connectRate: { good: [66, 100], medium: [33, 66], bad: [0, 33] },
        cpr: { good: [0, 250], medium: [250, 500], bad: [500, 1000] }
      }
    }
  ]);
  
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const { toast } = useToast();

  const MetricSlider = ({ 
    label, 
    metricKey, 
    unit = '', 
    format = (val: number) => val.toString() 
  }: { 
    label: string; 
    metricKey: keyof MetricTemplate['metrics']; 
    unit?: string;
    format?: (val: number) => string;
  }) => {
    const metric = selectedTemplate.metrics[metricKey];
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowInstructions(true)}
            className="h-6 w-6 p-0"
          >
            <Info className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="relative">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-green-600">Bom</span>
            <span className="text-yellow-600">Médio</span>
            <span className="text-red-600">Ruim</span>
          </div>
          
          <div className="relative h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full mb-3">
            <div 
              className="absolute top-0 w-1 h-2 bg-gray-800 rounded"
              style={{ left: `${(metric.good[1] / 100) * 100}%` }}
            />
            <div 
              className="absolute top-0 w-1 h-2 bg-gray-800 rounded"
              style={{ left: `${(metric.medium[1] / 100) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-slate-600">
            <div className="text-center">
              <div className="text-green-600 font-medium">
                {format(metric.good[0])}{unit} - {format(metric.good[1])}{unit}
              </div>
            </div>
            <div className="text-center">
              <div className="text-yellow-600 font-medium">
                {format(metric.medium[0])}{unit} - {format(metric.medium[1])}{unit}
              </div>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-medium">
                {format(metric.bad[0])}{unit} - {format(metric.bad[1])}{unit}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InstructionsDialog = () => (
    <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Instruções</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Target className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-slate-800 mb-1">Como funcionam os Templates de Objetivos</h3>
              <p className="text-xs text-slate-600">
                Defina os intervalos ideais de desempenho para cada métrica com base nos seus objetivos. 
                A tabela de campanhas usará essas configurações para aplicar cores automáticas e facilitar a análise visual.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Settings className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-slate-800 mb-1">Criando e gerenciando Templates</h3>
              <ol className="text-xs text-slate-600 space-y-1">
                <li>1. Clique em "Novo Template" e dê um nome.</li>
                <li>2. Ajuste os objetivos para cada métrica.</li>
                <li>3. Clique no ícone de salvar ao lado do nome.</li>
              </ol>
              <p className="text-xs text-slate-600 mt-2">
                Você pode criar quantos templates quiser e definir qual será o template utilizado como "Padrão" 
                clicando nos três pontos ao lado do nome do template e selecionando "Definir como padrão".
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Sempre que quiser, você pode alternar entre os templates diretamente pela tabela de campanhas, 
                adaptando a visualização conforme o objetivo de cada conta.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const createNewTemplate = () => {
    if (!newTemplateName.trim()) return;
    
    const newTemplate: MetricTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      isDefault: false,
      metrics: { ...selectedTemplate.metrics }
    };
    
    setTemplates([...templates, newTemplate]);
    setSelectedTemplate(newTemplate);
    setNewTemplateName('');
    setShowNewTemplate(false);
    
    toast({
      title: "Template criado",
      description: `Template "${newTemplateName}" criado com sucesso.`,
    });
  };

  const setAsDefault = (templateId: string) => {
    setTemplates(templates.map(t => ({
      ...t,
      isDefault: t.id === templateId
    })));
    
    toast({
      title: "Template padrão alterado",
      description: "Template definido como padrão com sucesso.",
    });
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Objetivos</h2>
          <p className="text-xs text-slate-600">
            Configure os intervalos de desempenho ideais para cada métrica das suas campanhas, alinhando-os aos seus objetivos. 
            A partir dessas configurações, a tabela de campanhas exibirá automaticamente as cores correspondentes para cada métrica, 
            facilitando a análise visual.
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowInstructions(true)}
          className="h-7 text-xs px-2"
        >
          <Info className="w-3 h-3 mr-1" />
          Instruções
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              Seus Templates
              <Button 
                onClick={() => setShowNewTemplate(true)}
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Novo Template
              </Button>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-500 mb-3">
                Você ainda não tem templates. Crie um para salvar suas configurações de métricas.
              </p>
              <Button onClick={() => setShowNewTemplate(true)} size="sm" className="h-7 text-xs px-2">
                <Plus className="w-3 h-3 mr-1" />
                Criar Primeiro Template
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedTemplate.id === template.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedTemplate(template)}
                      className="h-6 text-xs px-2"
                    >
                      {template.name}
                    </Button>
                    {template.isDefault && (
                      <Badge variant="secondary" className="text-xs">Padrão</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Save className="w-3 h-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setAsDefault(template.id)} className="text-xs">
                          Definir como padrão
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Duplicar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 text-xs">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <MetricSlider 
                label="CPC (Todos)" 
                metricKey="cpc" 
                unit=""
                format={(val) => `R$ ${val.toFixed(2)}`}
              />
              <MetricSlider 
                label="CTR (Todos)" 
                metricKey="ctr" 
                unit="%"
              />
              <MetricSlider 
                label="CTR (Cliques no link)" 
                metricKey="ctrLink" 
                unit="%"
              />
              <MetricSlider 
                label="ROAS" 
                metricKey="roas" 
                unit="x"
                format={(val) => `${val}x`}
              />
              <MetricSlider 
                label="CPM" 
                metricKey="cpm" 
                unit=""
                format={(val) => `R$ ${val.toFixed(2)}`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <MetricSlider 
                label="CPC (No link)" 
                metricKey="cpc" 
                unit=""
                format={(val) => `R$ ${val.toFixed(2)}`}
              />
              <MetricSlider 
                label="CPA" 
                metricKey="cpa" 
                unit=""
                format={(val) => `R$ ${val.toFixed(2)}`}
              />
              <MetricSlider 
                label="Taxa de Conversão" 
                metricKey="conversionRate" 
                unit="%"
              />
              <MetricSlider 
                label="Connect Rate" 
                metricKey="connectRate" 
                unit="%"
              />
              <MetricSlider 
                label="Custo por Resultado (CPR)" 
                metricKey="cpr" 
                unit=""
                format={(val) => `R$ ${val.toFixed(2)}`}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Template Dialog */}
      <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Novo Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Crie um novo template com suas configurações atuais de métricas.
            </p>
            <div className="space-y-2">
              <Label htmlFor="templateName" className="text-xs">Nome do Template</Label>
              <Input
                id="templateName"
                placeholder="Template Objetivo teste"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewTemplate(false)} size="sm" className="h-7 text-xs px-2">
                Cancelar
              </Button>
              <Button onClick={createNewTemplate} size="sm" className="h-7 text-xs px-2">
                Salvar Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InstructionsDialog />
    </div>
  );
}
