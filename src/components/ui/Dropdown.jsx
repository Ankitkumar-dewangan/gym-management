import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

export function Dropdown({
  trigger,
  items = [],
  header,
  align = 'right',
  widthClass = 'w-60',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((prev) => !prev)}>
        {typeof trigger === 'function' ? trigger({ open }) : trigger}
      </div>

      {open && (
        <div
          className={cn(
            'absolute z-40 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5',
            align === 'right' ? 'right-0' : 'left-0',
            widthClass
          )}
        >
          {header && (
            <div className="border-b border-slate-100 px-3.5 py-2.5">
              {header}
            </div>
          )}
          <div className="py-1">
            {items.map((item, idx) => {
              if (item.type === 'divider') {
                return <div key={`div-${idx}`} className="my-1 border-t border-slate-100" />;
              }
              const Icon = item.icon;
              return (
                <button
                  key={item.key || item.label || idx}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
                    item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : item.active
                        ? 'bg-slate-50 text-navy-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />}
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.label}</div>
                    {item.description && (
                      <div className="truncate text-xs text-slate-500">{item.description}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
