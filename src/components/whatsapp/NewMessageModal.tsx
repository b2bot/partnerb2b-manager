
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { useWhatsAppContacts, WhatsAppContact } from '@/hooks/useWhatsAppContacts';
import { Send } from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { ContactSelector } from './ContactSelector';
import { WhatsAppTemplate } from '@/hooks/useWhatsAppTemplates';

interface NewMessageModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewMessageModal({ open, onClose }: NewMessageModalProps) {
  const { sendMessage, sendBulkMessages } = useWhatsAppMessages();
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<WhatsAppContact[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  const handleTemplateSelect = (template: WhatsAppTemplate | null, variables: Record<string, string>) => {
    setSelectedTemplate(template);
    setTemplateVariables(variables);
  };

  const handleContactsSelect = (contacts: WhatsAppContact[]) => {
    setSelectedContacts(contacts);
  };

  const handleSend = async () => {
    if (!selectedTemplate || selectedContacts.length === 0) {
      return;
    }

    // Verificar se todas as variáveis foram preenchidas
    const missingVariables = selectedTemplate.variables.filter(
      variable => !templateVariables[variable]?.trim()
    );

    if (missingVariables.length > 0) {
      return;
    }

    setLoading(true);
    try {
      if (selectedContacts.length === 1) {
        // Envio único
        await sendMessage({
          phoneNumber: selectedContacts[0].phone_number,
          templateName: selectedTemplate.name,
          templateVariables,
          contactId: selectedContacts[0].id,
        });
      } else {
        // Envio em lote
        await sendBulkMessages(
          selectedContacts.map(c => c.phone_number),
          selectedTemplate.name,
          templateVariables
        );
      }

      // Reset form
      setSelectedContacts([]);
      setSelectedTemplate(null);
      setTemplateVariables({});
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedTemplate && selectedContacts.length > 0 && 
    selectedTemplate.variables.every(variable => templateVariables[variable]?.trim());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Mensagem WhatsApp</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <ContactSelector
            onContactsSelect={handleContactsSelect}
            selectedContacts={selectedContacts}
            mode="multiple"
          />

          <TemplateSelector
            onTemplateSelect={handleTemplateSelect}
            selectedTemplate={selectedTemplate?.name}
            initialVariables={templateVariables}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={loading || !isFormValid}
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Enviando...' : 
               selectedContacts.length > 1 ? `Enviar para ${selectedContacts.length} contatos` : 'Enviar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
