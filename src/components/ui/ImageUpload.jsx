import { useRef, useState } from 'react';
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

export function ImageUpload({
  label,
  value,
  onChange,
  aspect = 'square',
  hint = 'PNG, JPG or WEBP up to 2MB',
  className = '',
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange?.(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-4">
          <div
            className={cn(
              'overflow-hidden rounded-lg border border-slate-200 bg-white shrink-0',
              aspect === 'wide' ? 'h-20 w-36' : 'h-20 w-20'
            )}
          >
            <img
              src={value}
              alt={label || 'Uploaded preview'}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">Image attached</p>
            <p className="text-xs text-slate-500 mt-0.5">Ready for preview</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs font-medium text-navy-800 hover:underline cursor-pointer"
              >
                Replace
              </button>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onChange?.('')}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700',
            dragging
              ? 'border-emerald-500 bg-emerald-50/40'
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
          )}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500">
            {dragging ? (
              <UploadCloud className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
          <p className="mt-2.5 text-sm font-medium text-slate-700">
            Drop image here, or <span className="text-emerald-700">browse</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          processFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default ImageUpload;
