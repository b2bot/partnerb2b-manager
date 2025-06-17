
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings2, Eye, EyeOff } from 'lucide-react';

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  essential?: boolean;
}

interface TableColumnConfigProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  type: 'campaigns' | 'adsets' | 'ads';
}

export function TableColumnConfig({ columns, onColumnsChange, type }: TableColumnConfigProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleColumn = (key: string) => {
    const updatedColumns = columns.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    onColumnsChange(updatedColumns);
  };

  const resetToDefault = () => {
    const defaultColumns = columns.map(col => ({ ...col, visible: true }));
    onColumnsChange(defaultColumns);
  };

  const hideAllOptional = () => {
    const minimalColumns = columns.map(col => ({ 
      ...col, 
      visible: col.essential || col.key === 'name' || col.key === 'status' 
    }));
    onColumnsChange(minimalColumns);
  };

  const visibleCount = columns.filter(col => col.visible).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Colunas ({visibleCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Configurar Colunas
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Ações rápidas */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="flex-1"
            >
              Mostrar Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={hideAllOptional}
              className="flex-1"
            >
              Apenas Essenciais
            </Button>
          </div>

          {/* Lista de colunas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Selecione as colunas visíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-60 overflow-y-auto">
              {columns.map((column) => (
                <div key={column.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={column.key}
                      checked={column.visible}
                      onCheckedChange={() => toggleColumn(column.key)}
                      disabled={column.essential}
                    />
                    <label
                      htmlFor={column.key}
                      className={`text-sm ${column.essential ? 'font-medium text-slate-700' : 'text-slate-600'} cursor-pointer`}
                    >
                      {column.label}
                      {column.essential && (
                        <span className="ml-1 text-xs text-blue-600">(obrigatória)</span>
                      )}
                    </label>
                  </div>
                  <div className="text-slate-400">
                    {column.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Informações */}
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Dica:</p>
            <p>Em dispositivos móveis, apenas as colunas essenciais são mostradas automaticamente.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
