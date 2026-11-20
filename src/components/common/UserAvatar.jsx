import { useState } from 'react';
import { cn } from '../../utils/cn';
import { getInitials } from '../../utils/formatters';

export function UserAvatar({ src, name = '', size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-xs',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-lg',
  }[size] || 'h-9 w-9 text-xs';

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={cn(
          'rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0',
          sizeClasses,
          className
        )}
      />
    );
  }

  return (
    <span
      aria-label={name || 'User avatar'}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-navy-900 font-semibold text-white shrink-0',
        sizeClasses,
        className
      )}
    >
      {getInitials(name || 'U')}
    </span>
  );
}

export default UserAvatar;
