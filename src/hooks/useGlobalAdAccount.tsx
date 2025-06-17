
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GlobalAdAccountState {
  selectedAdAccount: string;
  selectedAdAccountName: string;
  setSelectedAdAccount: (accountId: string, accountName: string) => void;
  clearSelectedAdAccount: () => void;
}

export const useGlobalAdAccount = create<GlobalAdAccountState>()(
  persist(
    (set) => ({
      selectedAdAccount: '',
      selectedAdAccountName: '',
      setSelectedAdAccount: (accountId: string, accountName: string) => 
        set({ selectedAdAccount: accountId, selectedAdAccountName: accountName }),
      clearSelectedAdAccount: () => 
        set({ selectedAdAccount: '', selectedAdAccountName: '' }),
    }),
    {
      name: 'global-ad-account-storage',
    }
  )
);
