import { cn } from '../../utils/cn';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Pagination from '../ui/Pagination';

export function DataTable({
  columns = [],
  data = [],
  rowKey = 'id',
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'Adjust your search or filters to see records here.',
  onEmptyAction,
  emptyActionLabel,
  onRowClick,
  pagination,
  className = '',
}) {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-slate-200 bg-white p-10 flex justify-center', className)}>
        <LoadingSpinner label="Loading records..." />
      </div>
    );
  }

  if (!data.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        className={className}
      />
    );
  }

  const getKey = (row, index) => (typeof rowKey === 'function' ? rowKey(row) : row[rowKey] ?? index);

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white overflow-hidden', className)}>
      {/* Desktop & Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 font-medium whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => (
              <tr
                key={getKey(row, rowIndex)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition-colors hover:bg-slate-50/70',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-slate-700',
                      col.align === 'right' && 'text-right tabular-nums',
                      col.align === 'center' && 'text-center',
                      col.numeric && 'tabular-nums font-mono text-[13px]',
                      col.cellClassName
                    )}
                  >
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Card View */}
      <div className="md:hidden divide-y divide-slate-200">
        {data.map((row, rowIndex) => (
          <div
            key={getKey(row, rowIndex)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              'p-4 space-y-2.5 bg-white',
              onRowClick && 'cursor-pointer active:bg-slate-50'
            )}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-xs font-medium text-slate-500 shrink-0">
                  {col.header}
                </span>
                <div
                  className={cn(
                    'text-right text-slate-900 min-w-0',
                    col.numeric && 'tabular-nums font-mono text-[13px]'
                  )}
                >
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {pagination && (
        <div className="px-4 pb-4">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}

export default DataTable;
