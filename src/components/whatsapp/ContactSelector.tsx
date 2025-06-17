
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWhatsAppContacts, WhatsAppContact } from '@/hooks/useWhatsAppContacts';
import { Users, Tag, X } from 'lucide-react';

interface ContactSelectorProps {
  onContactsSelect: (contacts: WhatsAppContact[]) => void;
  selectedContacts: WhatsAppContact[];
  mode?: 'single' | 'multiple' | 'tags';
}

export function ContactSelector({ onContactsSelect, selectedContacts, mode = 'multiple' }: ContactSelectorProps) {
  const { contacts, loading, getAllTags } = useWhatsAppContacts();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const allTags = getAllTags();
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number.includes(searchTerm)
  );

  const handleTagSelect = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    
    // Buscar contatos que possuem pelo menos uma das tags selecionadas
    const contactsWithTags = contacts.filter(contact =>
      newTags.some(tag => contact.tags.includes(tag))
    );
    
    onContactsSelect(contactsWithTags);
  };

  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    if (mode === 'single') {
      onContactsSelect([contact]);
    } else {
      const isSelected = selectedContacts.some(c => c.id === contactId);
      if (isSelected) {
        onContactsSelect(selectedContacts.filter(c => c.id !== contactId));
      } else {
        onContactsSelect([...selectedContacts, contact]);
      }
    }
  };

  const removeContact = (contactId: string) => {
    onContactsSelect(selectedContacts.filter(c => c.id !== contactId));
  };

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    
    if (newTags.length === 0) {
      onContactsSelect([]);
    } else {
      const contactsWithTags = contacts.filter(contact =>
        newTags.some(tag => contact.tags.includes(tag))
      );
      onContactsSelect(contactsWithTags);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando contatos...</div>;
  }

  return (
    <div className="space-y-4">
      {mode !== 'single' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Seleção por Tags</Label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagSelect(tag)}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
          
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Tags selecionadas:</span>
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {mode === 'single' ? 'Selecionar Contato' : 'Contatos Individuais'}
        </Label>
        
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm"
        />

        {mode === 'single' ? (
          <Select onValueChange={handleContactSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um contato" />
            </SelectTrigger>
            <SelectContent>
              {filteredContacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  <div className="flex flex-col">
                    <span>{contact.name}</span>
                    <span className="text-xs text-gray-500">{contact.phone_number}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="max-h-40 overflow-y-auto border rounded-md">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-2 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                  selectedContacts.some(c => c.id === contact.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleContactSelect(contact.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.phone_number}</p>
                    {contact.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedContacts.some(c => c.id === contact.id) && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedContacts.length > 0 && mode !== 'single' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Contatos Selecionados ({selectedContacts.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedContacts.map((contact) => (
              <Badge key={contact.id} variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {contact.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeContact(contact.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
