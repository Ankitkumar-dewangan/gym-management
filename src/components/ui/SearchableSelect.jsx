import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SearchableSelect({
  label,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found',
  error,
  hint,
  required = false,
  disabled = false,
  allowCustom = true,
  className = '',
  containerClassName = '',
  id,
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options into { label, value } array
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { label: String(opt), value: String(opt) };
      }
      return {
        label: opt?.label ?? String(opt?.value ?? ''),
        value: String(opt?.value ?? ''),
        disabled: opt?.disabled,
      };
    });
  }, [options]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const query = searchTerm.toLowerCase().trim();
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(query)
    );
  }, [normalizedOptions, searchTerm]);

  // Selected option label
  const selectedLabel = useMemo(() => {
    if (!value) return '';
    const match = normalizedOptions.find((opt) => opt.value === String(value));
    return match ? match.label : String(value);
  }, [value, normalizedOptions]);

  // Check if current search query already exists as an option
  const exactMatchExists = useMemo(() => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase().trim();
    return normalizedOptions.some((opt) => opt.label.toLowerCase() === query);
  }, [normalizedOptions, searchTerm]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      // Small timeout to allow element to render into DOM
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Click outside and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
    setSearchTerm('');
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', isOpen && 'z-30', containerClassName)}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={selectId}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex w-full h-10 items-center justify-between rounded-lg border bg-white px-3.5 text-left text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700',
          disabled
            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'cursor-pointer hover:border-slate-400',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300',
          className
        )}
      >
        <span
          className={cn(
            'truncate block mr-2',
            selectedLabel ? 'text-slate-900 font-normal' : 'text-slate-400'
          )}
        >
          {selectedLabel || placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClear(e);
                }
              }}
              title="Clear selection"
              className="p-0.5 rounded-full hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isOpen && 'rotate-180 text-navy-700'
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden py-1.5 animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredOptions.length > 0) {
                      handleSelect(filteredOptions[0].value);
                    } else if (allowCustom && searchTerm.trim()) {
                      handleSelect(searchTerm.trim());
                    }
                  }
                }}
                placeholder={searchPlaceholder}
                className="w-full h-8.5 rounded-md bg-slate-50 pl-8.5 pr-7 text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:bg-white focus:border-navy-600 focus:ring-1 focus:ring-navy-600 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto px-1 py-1 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredOptions.map((opt, idx) => {
              const isSelected = String(value) === opt.value;
              return (
                <button
                  key={`${opt.value}-${idx}`}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg text-left transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-navy-50 text-navy-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                    opt.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-navy-700 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}

            {/* Custom option item if search query is not in list */}
            {allowCustom && searchTerm.trim() && !exactMatchExists && (
              <button
                type="button"
                onClick={() => handleSelect(searchTerm.trim())}
                className="w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg text-left bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium transition-colors cursor-pointer border border-dashed border-emerald-300 mt-1"
              >
                <span className="truncate">
                  Use custom: <span className="font-semibold">"{searchTerm.trim()}"</span>
                </span>
                <span className="text-[11px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                  + Add
                </span>
              </button>
            )}

            {/* Empty state when no matches and not custom */}
            {filteredOptions.length === 0 && (!allowCustom || !searchTerm.trim()) && (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export default SearchableSelect;
