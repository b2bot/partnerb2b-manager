
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Megaphone, Target, Users, FileText, MessageSquare } from 'lucide-react';
import { CreateCampaignModal } from '@/components/CreateCampaignModal';
import { CreateAdSetModal } from '@/components/CreateAdSetModal';
import { CreateAdModal } from '@/components/CreateAdModal';
import { CreateTicketModal } from '@/components/CreateTicketModal';
import { UploadCreativeModal } from '@/components/UploadCreativeModal';

export function QuickCreateButton() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const menuItems = [
    { id: 'campaign', label: 'Nova Campanha', icon: Megaphone, color: 'text-blue-600' },
    { id: 'adset', label: 'Novo Conjunto', icon: Target, color: 'text-green-600' },
    { id: 'ad', label: 'Novo Anúncio', icon: Users, color: 'text-purple-600' },
    { id: 'creative', label: 'Enviar Criativo', icon: FileText, color: 'text-orange-600' },
    { id: 'ticket', label: 'Novo Chamado', icon: MessageSquare, color: 'text-pink-600' },
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => setActiveModal(item.id)}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50"
            >
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="font-medium">{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modais */}
      {activeModal === 'campaign' && (
        <CreateCampaignModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'adset' && (
        <CreateAdSetModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'ad' && (
        <CreateAdModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'creative' && (
        <UploadCreativeModal
          open={true}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'ticket' && (
        <CreateTicketModal
          open={true}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
