
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { CollaboratorRow } from './CollaboratorRow';

interface Collaborator {
  id: string;
  nome: string;
  email: string;
  foto_url?: string;
  status: string;
  role: string;
  created_at: string;
  is_root_admin: boolean;
}

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  onEdit: (collaborator: Collaborator) => void;
  onDeactivate: (collaboratorId: string) => void;
  isDeactivating: boolean;
}

export function CollaboratorsList({ 
  collaborators, 
  onEdit, 
  onDeactivate, 
  isDeactivating 
}: CollaboratorsListProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Colaborador</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collaborators.map((collaborator) => (
            <CollaboratorRow
              key={collaborator.id}
              collaborator={collaborator}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
              isDeactivating={isDeactivating}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
