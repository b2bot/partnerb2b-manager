
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface TicketFiltersProps {
  onFiltersChange: (filters: any) => void;
  isAdmin: boolean;
  clientes?: { id: string; nome: string; }[];
}

export function TicketFilters({ onFiltersChange, isAdmin, clientes = [] }: TicketFiltersProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [cliente, setCliente] = useState('');

  const activeFilters = [
    { key: 'search', value: search, label: `Busca: "${search}"` },
    { key: 'status', value: status, label: `Status: ${status}` },
    { key: 'categoria', value: categoria, label: `Categoria: ${categoria}` },
    { key: 'prioridade', value: prioridade, label: `Prioridade: ${prioridade}` },
    { key: 'cliente', value: cliente, label: `Cliente: ${clientes.find(c => c.id === cliente)?.nome || cliente}` }
  ].filter(filter => filter.value);

  const applyFilters = () => {
    onFiltersChange({
      search: search.trim(),
      status: status || undefined,
      categoria: categoria || undefined,
      prioridade: prioridade || undefined,
      cliente_id: cliente || undefined
    });
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setCategoria('');
    setPrioridade('');
    setCliente('');
    onFiltersChange({});
  };

  const removeFilter = (key: string) => {
    switch (key) {
      case 'search': setSearch(''); break;
      case 'status': setStatus(''); break;
      case 'categoria': setCategoria(''); break;
      case 'prioridade': setPrioridade(''); break;
      case 'cliente': setCliente(''); break;
    }
    setTimeout(applyFilters, 0);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por título ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="aguardando_equipe">Aguardando Equipe</SelectItem>
              <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="resolvido">Resolvido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="campanhas">Campanhas</SelectItem>
              <SelectItem value="hospedagem">Hospedagem</SelectItem>
              <SelectItem value="emails">E-mails</SelectItem>
              <SelectItem value="crm">CRM</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>

          <Select value={prioridade} onValueChange={setPrioridade}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select value={cliente} onValueChange={setCliente}>
              <SelectTrigger>
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Button onClick={applyFilters} size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Aplicar Filtros
          </Button>
          
          {activeFilters.length > 0 && (
            <Button onClick={clearFilters} variant="outline" size="sm">
              Limpar Tudo
            </Button>
          )}

          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="gap-1">
              {filter.label}
              <button onClick={() => removeFilter(filter.key)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
