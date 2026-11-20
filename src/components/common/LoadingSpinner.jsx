import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
};

export function LoadingSpinner({
  size = 'md',
  label = 'Loading...',
  fullPage = false,
  className = '',
}) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn('inline-flex flex-col items-center justify-center gap-2.5 text-slate-500', className)}
    >
      <Loader2
        className={cn('animate-spin text-navy-800', SIZE_CLASSES[size] || SIZE_CLASSES.md)}
        aria-hidden="true"
      />
      {label && <span className="text-sm font-medium text-slate-600">{label}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

export default LoadingSpinner;
