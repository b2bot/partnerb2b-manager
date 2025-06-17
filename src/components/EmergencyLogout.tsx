
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, RefreshCw } from 'lucide-react';

export function EmergencyLogout() {
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      // Forçar reload da página após logout
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForceReload = () => {
    // Limpar todo o localStorage e recarregar
    localStorage.clear();
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-64">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-red-600">Acesso de Emergência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-slate-600">
            Usuário: {user.email}
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleSignOut} 
              disabled={loading}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <LogOut className="h-3 w-3 mr-1" />
              {loading ? 'Saindo...' : 'Logout'}
            </Button>
            <Button 
              onClick={handleForceReload}
              size="sm"
              variant="destructive"
              className="flex-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
