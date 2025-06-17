
import { Permission } from '@/types/auth';

export function hasPermission(
  userPermissions: Permission[], 
  requiredPermission: Permission, 
  isRootAdmin: boolean
): boolean {
  // Root admin tem todas as permissões
  if (isRootAdmin) return true;
  
  // Verificar se tem a permissão específica
  return userPermissions.includes(requiredPermission);
}
