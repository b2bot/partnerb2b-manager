
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2 } from 'lucide-react';

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

interface CollaboratorRowProps {
  collaborator: Collaborator;
  onEdit: (collaborator: Collaborator) => void;
  onDeactivate: (collaboratorId: string) => void;
  isDeactivating: boolean;
}

export function CollaboratorRow({ 
  collaborator, 
  onEdit, 
  onDeactivate, 
  isDeactivating 
}: CollaboratorRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={collaborator.foto_url} />
            <AvatarFallback>
              {collaborator.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{collaborator.nome}</span>
        </div>
      </TableCell>
      <TableCell>{collaborator.email}</TableCell>
      <TableCell>
        <Badge 
          variant={collaborator.status === 'ativo' ? 'default' : 'secondary'}
          className={collaborator.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        >
          {collaborator.status === 'ativo' ? 'Ativo' : 'Inativo'}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {collaborator.role === 'admin' ? 'Administrador' : 'Colaborador'}
        </Badge>
      </TableCell>
      <TableCell>
        {new Date(collaborator.created_at).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(collaborator)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {collaborator.status === 'ativo' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeactivate(collaborator.id)}
              disabled={isDeactivating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
