
import { Shield } from 'lucide-react';

export function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Acesso Negado</h3>
        <p className="text-slate-500 dark:text-slate-400">Você não tem permissão para gerenciar colaboradores.</p>
      </div>
    </div>
  );
}
