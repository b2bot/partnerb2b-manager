
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWhatsAppContacts } from '@/hooks/useWhatsAppContacts';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Phone,
  Tag
} from 'lucide-react';

interface ContactsTableProps {
  onNewContact: () => void;
  onEditContact: (contact: any) => void;
}

export function ContactsTable({ onNewContact, onEditContact }: ContactsTableProps) {
  const { contacts, loading, deleteContact, getAllTags } = useWhatsAppContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const allTags = getAllTags();

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone_number.includes(searchTerm);
    const matchesTag = !selectedTag || contact.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleDelete = async (contactId: string) => {
    if (confirm('Tem certeza que deseja remover este contato?')) {
      await deleteContact(contactId);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando contatos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contatos ({filteredContacts.length})
          </CardTitle>
          <Button onClick={onNewContact} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Contato
          </Button>
        </div>
        
        <div className="flex gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {allTags.length > 0 && (
            <div className="min-w-[200px]">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todas as tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-600 mb-2">
              {contacts.length === 0 ? 'Nenhum contato cadastrado' : 'Nenhum contato encontrado'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {contacts.length === 0 
                ? 'Adicione contatos para enviar mensagens'
                : 'Tente ajustar os filtros de busca'
              }
            </p>
            {contacts.length === 0 && (
              <Button onClick={onNewContact} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Primeiro Contato
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 text-sm font-medium text-slate-600">Nome</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-slate-600">Telefone</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-slate-600">Tags</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-slate-600">Grupo</th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div>
                        <p className="text-sm font-medium">{contact.name}</p>
                        {contact.observacoes && (
                          <p className="text-xs text-gray-500">{contact.observacoes}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3" />
                        {contact.phone_number}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {contact.grupo || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditContact(contact)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contact.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
