🧠 VISÃO DETALHADA DO PROJETO
🧱 Estrutura Geral
Stack Principal:
Frontend: React (com TailwindCSS)


Backend/DB: Supabase


Query Layer: React Query


UI Components: ShadCN/UI + Lucide Icons


State Management: useQuery, useMutation, useQueryClient (da React Query)


Notificações: Sonner


Armazenamento & APIs: Supabase como backend + integração com Meta API

Stack e Ferramentas:
Frontend: React + TailwindCSS (UI visivelmente montada com shadcn/ui)


Backend/API:


Supabase


Chamada direta à Meta Ads API (via settings.ts, storeKey.ts, testConnection.ts)


Build/Dev Tools:


Vite


TypeScript


PostCSS


ESLint


Vitest (testes unitários com arquivos .test.ts)


Gerenciamento de Estado e API Cache:


Tanstack React Query


Outros libs chave detectados:


lucide-react, sonner, react-hook-form, class-variance-authority, react-day-picker, radix-ui libs




🗺️ Fluxo de Uso
1. Configurações (Admin)
🧩 Aba 1: Gestão da API Meta
Objetivo: Validar, visualizar e configurar a conexão com a Meta API.


Exibe:


App ID


Status de conexão


Última verificação


Controle de chamadas por hora (rate limit)


Cache e reset automático


🧩 Aba 2: Gestão de Dados
Objetivo: Gerenciar a conta de anúncios padrão e personalizar as métricas visíveis nas páginas operacionais.


Configurações disponíveis:


Conta Principal de Anúncio (dropdown com lista de contas vinculadas)


Métricas por Página: Dashboard, Campanhas, Conjuntos, Anúncios


Categorias de métricas:


Performance (Impressões, Cliques, etc.)
Conversões (Resultados, Leads)
Custos (CPC, CPM, CPA, etc.)
Engajamento (Reações, Curtidas)
Vídeo (Visualizações, Reproduções)
Tráfego (Cliques externos, em links)



📊 Páginas Operacionais
2. Dashboard
Dados de visão geral da conta ativa.


Exibe:


Impressões totais
Cliques totais
Gasto total
CTR médio
Cards de campanhas ativas com estatísticas rápidas


Problemas pendentes:


Data range ainda não atualiza os dados corretamente
Alguns cards não carregam informações



3. Campanhas
Tabela com todas as campanhas da conta ativa selecionada.


Filtros:


Status da campanha
Período (últimos X dias)


Colunas:


Nome, Status, Objetivo
Impressões, Cliques, Resultados
Custo por Resultado
Data de criação


Sorting funciona por clique nas colunas


Ponto de atenção:


Fontes ainda grandes, precisa de um ajuste visual
Algumas métricas ainda com valores zerados



4. Conjuntos de Anúncios
Listagem dos adsets vinculados à campanha


Filtros:


Por campanha
Por status
Por período


Colunas:


Nome do conjunto
Campanha associada
Métricas (impressões, cliques, CPM, resultados, CPA)


Problemas:


Carregamento lento dos dados
Colunas desalinhadas
Botão de limpar desalinhado



5. Anúncios
Tabela com todos os anúncios do adset


Filtros:


Por campanha
Por conjunto
Por status
Por período


Colunas:


Criativo (imagem miniatura)
Nome do anúncio
Status
Conjunto
Campanha
Métricas (Impressões, CTR, Frequência, etc.)


Funcionalidade importante:


Clicar na imagem do criativo abre modal ou visualização ampliada (em desenvolvimento)


Problemas:


Algumas métricas não carregam
Falta alinhar os inputs e filtros no topo
Botão “Limpar” desalinhado



🎯 Página: Personalização de Métricas
Aqui é onde a mágica acontece!


Possível selecionar quais métricas devem ser exibidas em:


Dashboard
Campanhas
Conjuntos
Anúncios


Templates com configurações visuais para bom, médio e ruim por faixa de valor


Exemplo:


CPC: Verde = R$0-R$6,80 | Laranja = R$6,80-R$18,80 | Vermelho = R$18,80+
CTR: Verde = 5%+ | Laranja = 2-5% | Vermelho <2%



📤 Relatórios via WhatsApp
Conecta com API de WhatsApp
Permite agendar envio semanal/mensal de relatórios para clientes
Clientes configurados via painel


Status atual:


Funcionalidade de conexão está no ar
Envio depende da conta estar conectada



📥 Gerenciar Chamados
Lista de chamados abertos por clientes
Status: Aguardando, Respondido
Sistema de resposta interno com botão de criar novo chamado



👤 Gerenciar Clientes
Lista de clientes vinculados ao sistema


Exibe:
Nome, e-mail
Tipo de acesso (API ou Sheets)
Contas vinculadas
Botões de editar, desativar, remover



🔌 Integrações & Lógica
📡 Supabase
Armazena:


Configs de métricas (metrics_config)
Clientes (clientes)
Perfis (profiles)
Contas vinculadas (contas)
Atividades do sistema (system_logs)


Queries usando .from(...).select().order()... com mapeamento em interfaces


🔄 React Query
Cache das queries principais: ['metrics-config'], ['clients-management'], etc.
Mutations com onSuccess e onError + toast feedback


📂 Estrutura de Diretórios Relevante

├── api/
│   ├── settings.ts           # Configurações de conexão com a API Meta
│   ├── storeKey.ts           # Chave de acesso/token da conta
│   ├── testConnection.ts     # Função de teste de conexão com a API
│   └── __tests__/            # Testes unitários da API


+---public
|       favicon.ico
|       placeholder.svg
|       robots.txt
|       
+---src
|   |   App.css
|   |   App.tsx
|   |   index.css
|   |   main.tsx
|   |   vite-env.d.ts
|   |   
|   +---components
|   |   |   AccountFilter.tsx
|   |   |   ActivityLog.tsx
|   |   |   AdSetsTab.tsx
|   |   |   AdsTab.tsx
|   |   |   AdvancedFilters.tsx
|   |   |   ApiMonitoring.tsx
|   |   |   AuthWrapper.tsx
|   |   |   CampaignsTab.tsx
|   |   |   ClientGreeting.tsx
|   |   |   ClientsManagementTab.tsx
|   |   |   CollaboratorsManagement.tsx
|   |   |   CollapsibleAccountFilter.tsx
|   |   |   CreateAdModal.tsx
|   |   |   CreateAdSetModal.tsx
|   |   |   CreateCampaignModal.tsx
|   |   |   CreateClientModal.tsx
|   |   |   CreateCollaboratorModal.tsx
|   |   |   CreateTicketModal.tsx
|   |   |   CreativeDetailModal.tsx
|   |   |   CreativesTab.tsx
|   |   |   Dashboard.tsx
|   |   |   DataManagement.tsx
|   |   |   DateRangeFilter.tsx
|   |   |   DynamicFilters.tsx
|   |   |   EditAdModal.tsx
|   |   |   EditAdSetModal.tsx
|   |   |   EditCampaignModal.tsx
|   |   |   EditClientModal.tsx
|   |   |   EditCollaboratorModal.tsx
|   |   |   EmergencyLogout.tsx
|   |   |   GlobalSearch.tsx
|   |   |   Header.tsx
|   |   |   HierarchicalFilter.tsx
|   |   |   LoginForm.tsx
|   |   |   MetaApiManagement.tsx
|   |   |   MetaApiSettings.tsx
|   |   |   MetricsCustomization.tsx
|   |   |   MetricsObjectivesTab.tsx
|   |   |   PermissionTemplatesManagement.tsx
|   |   |   ProtectedRoute.tsx
|   |   |   QuickCreateButton.tsx
|   |   |   SelectedAccountDisplay.tsx
|   |   |   SettingsTab.tsx
|   |   |   Sidebar.tsx
|   |   |   TableColumnConfig.tsx
|   |   |   ThemeToggle.tsx
|   |   |   TicketDetailModal.tsx
|   |   |   TicketsTab.tsx
|   |   |   TicketsTabAdvanced.tsx
|   |   |   UploadCreativeModal.tsx
|   |   |   UserMenu.tsx
|   |   |   WhatsAppReportsTab.tsx
|   |   |   
|   |   +---collaborators
|   |   |       AccessDenied.tsx
|   |   |       CollaboratorRow.tsx
|   |   |       CollaboratorsHeader.tsx
|   |   |       CollaboratorsList.tsx
|   |   |       CollaboratorsSearch.tsx
|   |   |       LoadingSpinner.tsx
|   |   |       
|   |   +---tickets
|   |   |       ClientMessageForm.tsx
|   |   |       CreateTicketModalAdvanced.tsx
|   |   |       TicketCard.tsx
|   |   |       TicketDetailModalAdvanced.tsx
|   |   |       TicketFilters.tsx
|   |   |       TicketStatusBadge.tsx
|   |   |       TicketStepper.tsx
|   |   |       TicketTimeline.tsx
|   |   |       
|   |   +---ui
|   |   |       accordion.tsx
|   |   |       alert-dialog.tsx
|   |   |       alert.tsx
|   |   |       aspect-ratio.tsx
|   |   |       avatar.tsx
|   |   |       badge.tsx
|   |   |       breadcrumb.tsx
|   |   |       button.tsx
|   |   |       calendar.tsx
|   |   |       card.tsx
|   |   |       carousel.tsx
|   |   |       chart.tsx
|   |   |       checkbox.tsx
|   |   |       collapsible.tsx
|   |   |       command.tsx
|   |   |       context-menu.tsx
|   |   |       dialog.tsx
|   |   |       drawer.tsx
|   |   |       dropdown-menu.tsx
|   |   |       form.tsx
|   |   |       hover-card.tsx
|   |   |       input-otp.tsx
|   |   |       input.tsx
|   |   |       label.tsx
|   |   |       menubar.tsx
|   |   |       navigation-menu.tsx
|   |   |       pagination.tsx
|   |   |       popover.tsx
|   |   |       progress.tsx
|   |   |       radio-group.tsx
|   |   |       resizable.tsx
|   |   |       scroll-area.tsx
|   |   |       select.tsx
|   |   |       separator.tsx
|   |   |       sheet.tsx
|   |   |       sidebar.tsx
|   |   |       skeleton.tsx
|   |   |       slider.tsx
|   |   |       sonner.tsx
|   |   |       switch.tsx
|   |   |       table.tsx
|   |   |       tabs.tsx
|   |   |       textarea.tsx
|   |   |       toast.tsx
|   |   |       toaster.tsx
|   |   |       toggle-group.tsx
|   |   |       toggle.tsx
|   |   |       tooltip.tsx
|   |   |       use-toast.ts
|   |   |       
|   |   \---whatsapp
|   |           CampaignList.tsx
|   |           ContactSelector.tsx
|   |           ContactsTable.tsx
|   |           MessageFiltersModal.tsx
|   |           MessagesTable.tsx
|   |           NewCampaignModal.tsx
|   |           NewContactModal.tsx
|   |           NewMessageModal.tsx
|   |           TemplateSelector.tsx
|   |           WhatsAppConnectionCard.tsx
|   |           WhatsAppDashboard.tsx
|   |           
|   +---hooks
|   |       use-mobile.tsx
|   |       use-toast.ts
|   |       useAccountInsights.tsx
|   |       useActivityLog.tsx
|   |       useAuth.tsx
|   |       useAuthActions.tsx
|   |       useCollaborators.tsx
|   |       useDateRange.tsx
|   |       useGlobalAdAccount.tsx
|   |       useInsights.tsx
|   |       useMetaData.tsx
|   |       useMetricsConfig.tsx
|   |       usePermissions.tsx
|   |       useSystemLog.tsx
|   |       useUserAccess.tsx
|   |       useUserPermissions.tsx
|   |       useUserProfile.tsx
|   |       useWhatsAppConfig.ts
|   |       useWhatsAppContacts.ts
|   |       useWhatsAppMessages.ts
|   |       useWhatsAppTemplates.ts
|   |       
|   +---integrations
|   |   \---supabase
|   |           client.ts
|   |           types.ts
|   |           
|   +---lib
|   |       metaApi.ts
|   |       metaApiWithRateLimit.ts
|   |       metaInsights.ts
|   |       rateLimit.ts
|   |       utils.ts
|   |       
|   +---pages
|   |       Index.tsx
|   |       MetricsObjectivesTab.tsx
|   |       NotFound.tsx
|   |       objetivos-metricas.tsx
|   |       WhatsAppReportsTab.tsx
|   |       
|   +---types
|   |       auth.ts
|   |       
|   \---utils
|           permissionUtils.ts
|           seedActivityLogs.ts
|           
\---supabase/
├── |   config.toml
├── |   
└── \---migrations/
    ├── 20250613071447-8131066b-e700-4e37-be32-745036d7e8e6.sql
    ├── 20250613072000_create_storage_buckets.sql
    ├── 20250613124901-096449ce-64bc-435c-87de-d87a01dfbf84.sql
    ├── 20250613190527-9cb15cc5-b5bc-442e-9ee5-fa29566dac42.sql
    ├── 20250613201736-d0f77029-c2dd-4eac-a645-509965ade5c5.sql
    ├── 20250614154950-c3750da7-f88d-423c-a5d5-a0d8f90d8a3a.sql
    ├── 20250614224124-176e0d70-2d98-47b5-adff-d5a754a2f47a.sql
    ├── 20250614233723-5f705efc-3d21-480f-be46-be3fcf4d1e1b.sql
    ├── 20250615144518-272c2790-d849-4c4e-83c3-63e9bb3bb8a3.sql
    ├── 20250615181741-e98ebf9f-6e85-4c92-8200-8e3eb181deb4.sql
    ├── 20250615190541-cbc5dc16-3363-4d32-ae85-ca9f37bbbf30.sql
    ├── 20250616103857-4719ac7e-4fb4-409b-8fa9-2f004bc05588.sql
    ├── 20250616115306-3ff9f576-2c1a-4902-ad26-acc974f054dc.sql
    ├── 20250616120000_fix_rls_policies.sql
    ├── 20250616182336-b8a6d049-20a7-4cb8-a4d8-fb5f465c1574.sql
    ├── 20250616183058-0b913d7d-7af5-4155-930f-6ac232dc0aca.sql
    ├── 20250616191136-f2fc3e55-87af-420f-a580-ddad4efae45c.sql
    └── 20250616191200_fix_tickets_system.sql
