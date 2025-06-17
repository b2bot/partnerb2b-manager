
import React from 'react';
import { Button } from '@/components/dashboard_ui/button';
import { Calendar } from '@/components/dashboard_ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/dashboard_ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from '@/hooks/dashboard_hooks/useFilters';
import { cn } from '@/lib/dashboard_lib/utils';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const DateRangePicker = ({ dateRange, onDateRangeChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full min-w-[250px] justify-start text-left font-normal bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 transition-colors duration-200 h-9",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
              </>
            ) : (
              format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
            )
          ) : (
            <span>Selecione o período</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={{
            from: dateRange?.from,
            to: dateRange?.to,
          }}
          onSelect={(range) => {
            if (range?.from) {
              if (range?.to) {
                onDateRangeChange({ from: range.from, to: range.to });
                setIsOpen(false);
              } else {
                onDateRangeChange({ from: range.from, to: range.from });
              }
            }
          }}
          numberOfMonths={2}
          locale={ptBR}
          className="pointer-events-auto bg-white dark:bg-gray-800"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
