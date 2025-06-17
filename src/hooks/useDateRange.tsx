
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';

export function useDateRange() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
    to: new Date()
  });

  const getApiDateRange = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return {
        since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        until: new Date().toISOString().split('T')[0]
      };
    }

    return {
      since: dateRange.from.toISOString().split('T')[0],
      until: dateRange.to.toISOString().split('T')[0]
    };
  };

  // Log para debug quando o range de data muda
  useEffect(() => {
    const apiRange = getApiDateRange();
    console.log('Date range changed:', {
      dateRange,
      apiRange
    });
  }, [dateRange]);

  return {
    dateRange,
    setDateRange,
    getApiDateRange
  };
}
