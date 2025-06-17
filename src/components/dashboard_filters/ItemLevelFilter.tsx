import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboard_ui/select';

interface ItemLevelFilterProps {
  items: string[];
  selected: string;
  onChange: (value: string) => void;
  label?: string;
}

const ItemLevelFilter = ({ items, selected, onChange, label }: ItemLevelFilterProps) => {
  return (
    <div className="w-full sm:w-64">
      {label && (
        <label htmlFor="item-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label}
        </label>
      )}
      <Select value={selected} onValueChange={onChange}>
        <SelectTrigger
          id="item-filter"
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-9"
        >
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <SelectItem value="all">Todos</SelectItem>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ItemLevelFilter;
