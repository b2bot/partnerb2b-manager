
import { Input } from '@/components/ui/input';

interface CollaboratorsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function CollaboratorsSearch({ searchTerm, onSearchChange }: CollaboratorsSearchProps) {
  return (
    <div className="flex items-center space-x-4">
      <Input
        placeholder="Buscar colaboradores..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
