import { cn } from '../../utils/cn';

export function BrandLogo({ variant = 'dark', collapsed = false, className = '' }) {
  const textColor = variant === 'light' ? 'text-white' : 'text-navy-900';
  const markBg = variant === 'light' ? 'bg-emerald-500 text-navy-950' : 'bg-navy-900 text-white';

  return (
    <div className={cn('inline-flex items-center gap-2.5 whitespace-nowrap shrink-0', className)}>
      <span
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-lg font-display font-bold text-sm tracking-tight shrink-0',
          markBg
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M4 15L9 7L14 14L20 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 19H20" strokeLinecap="round" />
        </svg>
      </span>
      {!collapsed && (
        <span className={cn('font-display text-lg font-bold tracking-tight', textColor)}>
          GymPilot
        </span>
      )}
    </div>
  );
}

export default BrandLogo;
