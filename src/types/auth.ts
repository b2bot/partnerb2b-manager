
export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'cliente';
  ativo: boolean;
  is_root_admin?: boolean;
  foto_url?: string;
  status?: string;
}

export type Permission = 
  | 'access_dashboard'
  | 'access_resultados'
  | 'access_whatsapp'
  | 'create_campaigns'
  | 'edit_campaigns'
  | 'view_templates'
  | 'send_messages'
  | 'view_metrics'
  | 'access_tasks'
  | 'create_tasks'
  | 'assign_tasks'
  | 'finalize_tasks'
  | 'edit_execution_time'
  | 'access_calls'
  | 'create_calls'
  | 'finalize_calls'
  | 'link_calls_to_tasks'
  | 'access_creatives'
  | 'create_edit_creatives'
  | 'approve_creatives'
  | 'view_change_history'
  | 'access_paid_media'
  | 'create_campaigns_media'
  | 'view_metrics_media'
  | 'access_reports'
  | 'create_automatic_reports'
  | 'manage_user_settings'
  | 'manage_collaborators'
  | 'manage_whatsapp_templates'
  | 'manage_api_settings'
  | 'manage_appearance_and_visual_identity'
  | 'manage_external_integrations'
  | 'manage_variables_and_pre_configurations'
  | 'view_billing_settings'
  | 'view_system_logs';

export const ALL_PERMISSIONS: Permission[] = [
  'access_dashboard',
  'access_resultados',
  'access_whatsapp',
  'create_campaigns',
  'edit_campaigns',
  'view_templates',
  'send_messages',
  'view_metrics',
  'access_tasks',
  'create_tasks',
  'assign_tasks',
  'finalize_tasks',
  'edit_execution_time',
  'access_calls',
  'create_calls',
  'finalize_calls',
  'link_calls_to_tasks',
  'access_creatives',
  'create_edit_creatives',
  'approve_creatives',
  'view_change_history',
  'access_paid_media',
  'create_campaigns_media',
  'view_metrics_media',
  'access_reports',
  'create_automatic_reports',
  'manage_user_settings',
  'manage_collaborators',
  'manage_whatsapp_templates',
  'manage_api_settings',
  'manage_appearance_and_visual_identity',
  'manage_external_integrations',
  'manage_variables_and_pre_configurations',
  'view_billing_settings',
  'view_system_logs'
];
