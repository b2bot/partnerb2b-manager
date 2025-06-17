
import { supabase } from '@/integrations/supabase/client';

export const seedActivityLogs = async () => {
  const sampleLogs = [
    {
      action: 'CAMPAIGN_CREATED',
      entity_type: 'campaign',
      entity_id: 'camp_001',
      entity_name: 'Campanha Black Friday 2024',
      user_name: 'Admin Sistema',
      details: { budget: 1000, objective: 'conversions' }
    },
    {
      action: 'CREATIVE_UPLOADED',
      entity_type: 'creative',
      entity_id: 'creat_001',
      entity_name: 'Banner Principal Black Friday',
      user_name: 'Designer João',
      details: { file_type: 'image/jpeg', size: '2.1MB' }
    },
    {
      action: 'TICKET_CREATED',
      entity_type: 'ticket',
      entity_id: 'ticket_001',
      entity_name: 'Dúvida sobre configuração de campanha',
      user_name: 'Cliente Maria',
      details: { priority: 'medium', category: 'support' }
    },
    {
      action: 'CAMPAIGN_PAUSED',
      entity_type: 'campaign',
      entity_id: 'camp_002',
      entity_name: 'Campanha Natal 2024',
      user_name: 'Admin Sistema',
      details: { reason: 'budget_exhausted' }
    },
    {
      action: 'CLIENT_CREATED',
      entity_type: 'client',
      entity_id: 'client_001',
      entity_name: 'Empresa ABC Ltda',
      user_name: 'Admin Sistema',
      details: { plan: 'premium', onboarding_completed: true }
    }
  ];

  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert(sampleLogs);

    if (error) {
      console.error('Error seeding activity logs:', error);
    } else {
      console.log('Activity logs seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding activity logs:', error);
  }
};
