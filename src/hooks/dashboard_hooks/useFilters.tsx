
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface DashboardFilters {
  selectedAccount: string;
  searchTerm: string;
  dateRange: DateRange;
}

type FiltersContextType = {
  filters: DashboardFilters;
  updateFilters: (updates: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<DashboardFilters>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('dashboard-filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        if (parsed.dateRange) {
          parsed.dateRange = {
            from: parsed.dateRange.from ? new Date(parsed.dateRange.from) : undefined,
            to: parsed.dateRange.to ? new Date(parsed.dateRange.to) : undefined,
          };
        }
        return parsed;
      } catch {
        return {
          selectedAccount: 'all',
          searchTerm: '',
          dateRange: { from: undefined, to: undefined },
        };
      }
    }
    
    return {
      selectedAccount: 'all',
      searchTerm: '',
      dateRange: { from: undefined, to: undefined },
    };
  });

  // Save to localStorage when filters change
  useEffect(() => {
    localStorage.setItem('dashboard-filters', JSON.stringify(filters));
  }, [filters]);

  const updateFilters = (updates: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters({
      selectedAccount: 'all',
      searchTerm: '',
      dateRange: { from: undefined, to: undefined },
    });
  };

  return (
    <FiltersContext.Provider value={{ filters, updateFilters, resetFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};
