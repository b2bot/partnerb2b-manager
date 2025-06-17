
import { useState } from 'react';
import { ChevronDown, ChevronUp, Building2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMetaData } from '@/hooks/useMetaData';

interface CollapsibleAccountFilterProps {
  selectedAccount: string;
  onAccountChange: (accountId: string) => void;
}

export function CollapsibleAccountFilter({ selectedAccount, onAccountChange }: CollapsibleAccountFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { adAccounts, selectedAdAccountName } = useMetaData();

  const selectedAccountData = adAccounts.find(acc => acc.id === selectedAccount);

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with current selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Conta Selecionada
              </span>
              {selectedAccountData && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                  Ativa
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {/* Current selection display */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-blue-900 dark:text-blue-100 text-sm truncate">
                  {selectedAdAccountName || 'Nenhuma conta selecionada'}
                </p>
                {selectedAccountData && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                    ID: {selectedAccountData.id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Expanded section */}
          {isExpanded && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              {adAccounts.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Trocar conta ({adAccounts.length} disponíveis)
                    </label>
                    <Select value={selectedAccount} onValueChange={onAccountChange}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {adAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div className="flex items-center gap-2">
                              <span className="truncate">{account.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {account.id.substring(0, 8)}...
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* All accounts list (compact) */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Todas as contas conectadas:
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {adAccounts.map((account) => (
                        <div
                          key={account.id}
                          className={`p-2 rounded border text-xs ${
                            account.id === selectedAccount
                              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                              {account.name}
                            </span>
                            {account.id === selectedAccount && (
                              <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 truncate">
                            {account.id}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">Nenhuma conta conectada</p>
                  <p className="text-xs">Configure sua API da Meta primeiro</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
