
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

interface DateRangeFilterProps {
  onDateChange?: (dateRange: DateRange | undefined) => void;
}

export function DateRangeFilter({ onDateChange }: DateRangeFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
    to: new Date()
  });

  const [selectedPreset, setSelectedPreset] = useState('7d');

  const presets = [
    { label: 'Hoje', value: 'today', days: 0 },
    { label: 'Últimos 7 dias', value: '7d', days: 7 },
    { label: 'Últimos 14 dias', value: '14d', days: 14 },
    { label: 'Últimos 30 dias', value: '30d', days: 30 },
    { label: 'Últimos 90 dias', value: '90d', days: 90 },
    { label: 'Personalizado', value: 'custom', days: null }
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setSelectedPreset(preset.value);
    
    if (preset.days !== null) {
      const newRange = {
        from: preset.days === 0 ? new Date() : new Date(Date.now() - preset.days * 24 * 60 * 60 * 1000),
        to: new Date()
      };
      setDateRange(newRange);
      // Trigger the callback immediately
      onDateChange?.(newRange);
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    setSelectedPreset('custom');
    // Trigger the callback immediately
    onDateChange?.(range);
  };

  // Trigger callback when component mounts with initial range
  useEffect(() => {
    onDateChange?.(dateRange);
  }, []);

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Selecione as datas';
    
    if (selectedPreset !== 'custom') {
      const preset = presets.find(p => p.value === selectedPreset);
      return preset?.label || 'Últimos 7 dias';
    }

    if (dateRange.to) {
      return `${format(dateRange.from, 'dd/MM/yy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yy', { locale: ptBR })}`;
    }
    
    return format(dateRange.from, 'dd/MM/yy', { locale: ptBR });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs font-normal">
          <CalendarIcon className="w-3 h-3 mr-1" />
          {formatDateRange()}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r p-2 space-y-1">
            <div className="text-xs font-medium text-slate-700 mb-1">Períodos</div>
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant={selectedPreset === preset.value ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start h-6 text-xs"
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          {/* Calendar */}
          <div className="p-2">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              locale={ptBR}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
