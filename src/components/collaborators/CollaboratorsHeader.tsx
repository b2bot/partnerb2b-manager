
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CollaboratorsHeaderProps {
  onCreateNew: () => void;
}

export function CollaboratorsHeader({ onCreateNew }: CollaboratorsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gerenciar Colaboradores</h2>
        <p className="text-slate-600 dark:text-slate-400">Gerencie acessos e permissões dos colaboradores</p>
      </div>
      <Button onClick={onCreateNew} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Novo Colaborador
      </Button>
    </div>
  );
}
