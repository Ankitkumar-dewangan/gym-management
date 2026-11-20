import { RotateCcw } from 'lucide-react';
import SearchBar from '../ui/SearchBar';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

export function FilterToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
  hasActiveFilters = false,
  onReset,
  rightContent,
  className = '',
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3',
        className
      )}
    >
      <div className="flex flex-1 flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
        {onSearchChange && (
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="sm:w-64 lg:w-72"
          />
        )}
        {children}
        {hasActiveFilters && onReset && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={RotateCcw}
            onClick={onReset}
            className="text-slate-500"
          >
            Reset
          </Button>
        )}
      </div>

      {rightContent && (
        <div className="flex items-center gap-2.5 shrink-0">{rightContent}</div>
      )}
    </div>
  );
}

export default FilterToolbar;
