
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWhatsAppTemplates, WhatsAppTemplate } from '@/hooks/useWhatsAppTemplates';
import { Eye } from 'lucide-react';

interface TemplateSelectorProps {
  onTemplateSelect: (template: WhatsAppTemplate | null, variables: Record<string, string>) => void;
  selectedTemplate?: string;
  initialVariables?: Record<string, string>;
}

export function TemplateSelector({ onTemplateSelect, selectedTemplate, initialVariables = {} }: TemplateSelectorProps) {
  const { templates, loading } = useWhatsAppTemplates();
  const [selectedTemplateObj, setSelectedTemplateObj] = useState<WhatsAppTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>(initialVariables);

  useEffect(() => {
    if (selectedTemplate && templates.length > 0) {
      const template = templates.find(t => t.name === selectedTemplate);
      if (template) {
        setSelectedTemplateObj(template);
        // Inicializar variáveis vazias se não fornecidas
        const initVars = { ...initialVariables };
        template.variables.forEach(variable => {
          if (!initVars[variable]) {
            initVars[variable] = '';
          }
        });
        setVariables(initVars);
      }
    }
  }, [selectedTemplate, templates, initialVariables]);

  const handleTemplateChange = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    setSelectedTemplateObj(template || null);
    
    if (template) {
      // Resetar variáveis para o novo template
      const newVariables: Record<string, string> = {};
      template.variables.forEach(variable => {
        newVariables[variable] = '';
      });
      setVariables(newVariables);
      onTemplateSelect(template, newVariables);
    } else {
      onTemplateSelect(null, {});
    }
  };

  const handleVariableChange = (variableName: string, value: string) => {
    const newVariables = { ...variables, [variableName]: value };
    setVariables(newVariables);
    onTemplateSelect(selectedTemplateObj, newVariables);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando templates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Template Aprovado</Label>
        <Select 
          value={selectedTemplateObj?.name || ''} 
          onValueChange={handleTemplateChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um template aprovado" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.name}>
                <div className="flex flex-col">
                  <span>{template.name}</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {template.category.toLowerCase()} • {template.language}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplateObj && selectedTemplateObj.variables.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Campos Dinâmicos</Label>
          <div className="grid grid-cols-1 gap-3">
            {selectedTemplateObj.variables.map((variable) => (
              <div key={variable} className="space-y-1">
                <Label htmlFor={variable} className="text-xs">
                  {variable.charAt(0).toUpperCase() + variable.slice(1)}
                </Label>
                <Input
                  id={variable}
                  placeholder={`Digite o valor para {{${variable}}}`}
                  value={variables[variable] || ''}
                  onChange={(e) => handleVariableChange(variable, e.target.value)}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTemplateObj && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview da Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={selectedTemplateObj ? 
                (() => {
                  const { getTemplatePreview } = useWhatsAppTemplates();
                  return getTemplatePreview(selectedTemplateObj, variables);
                })() : ''
              }
              readOnly
              rows={4}
              className="text-sm bg-gray-50"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
