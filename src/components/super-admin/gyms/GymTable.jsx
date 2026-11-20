import { ArrowUpDown, Ban, CheckCircle2, Edit3, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../common/EmptyState';
import Pagination from '../../ui/Pagination';
import Select from '../../ui/Select';
import { formatDate, formatNumber } from '../../../utils/formatters';
import GymStatusBadge from './GymStatusBadge';
import SubscriptionBadge from './SubscriptionBadge';

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 / page' },
  { value: '10', label: '10 / page' },
  { value: '25', label: '25 / page' },
];

export function GymTable({
  gyms = [],
  sortField,
  sortDir,
  onSort,
  currentPage = 1,
  pageSize = 5,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  onToggleStatus,
  onDelete,
  onResetFilters,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (!gyms.length) {
    return (
      <EmptyState
        title="No gyms match your filters"
        description="Try adjusting your search query, status, subscription plan, or registration date filter."
        actionLabel="Reset all filters"
        onAction={onResetFilters}
      />
    );
  }

  const renderSortButton = (label, field) => (
    <button
      type="button"
      onClick={() => onSort?.(field)}
      className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-800 cursor-pointer whitespace-nowrap"
    >
      <span>{label}</span>
      <ArrowUpDown
        className={`h-3 w-3 ${sortField === field ? 'text-navy-900' : 'text-slate-400'}`}
        aria-hidden="true"
      />
      {sortField === field && (
        <span className="sr-only">{sortDir === 'asc' ? 'ascending' : 'descending'}</span>
      )}
    </button>
  );

  const renderLogo = (gym) =>
    gym.logoUrl ? (
      <img
        src={gym.logoUrl}
        alt={`${gym.name} logo`}
        className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0"
      />
    ) : (
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: gym.logoColor || '#14213D' }}
      >
        {gym.initials}
      </span>
    );

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
      {/* Desktop & Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
              <th className="px-4 py-3 whitespace-nowrap">Gym Logo</th>
              <th className="px-4 py-3 whitespace-nowrap">
                {renderSortButton('Gym Name', 'name')}
              </th>
              <th className="px-4 py-3 whitespace-nowrap">Owner Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Email Address</th>
              <th className="px-4 py-3 whitespace-nowrap">Contact Number</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">
                {renderSortButton('Total Branches', 'branchesCount')}
              </th>
              <th className="px-4 py-3 text-right whitespace-nowrap">
                {renderSortButton('Total Members', 'totalMembers')}
              </th>
              <th className="px-4 py-3 whitespace-nowrap">Subscription Plan</th>
              <th className="px-4 py-3 whitespace-nowrap">
                {renderSortButton('Registration Date', 'registeredAt')}
              </th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gyms.map((gym) => {
              const isSuspendedOrInactive =
                gym.status === 'suspended' || gym.status === 'inactive';

              return (
                <tr key={gym.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">{renderLogo(gym)}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/super-admin/gyms/${gym.id}`}
                      className="font-semibold text-slate-800 hover:text-navy-800 hover:underline block whitespace-nowrap"
                    >
                      {gym.name}
                    </Link>
                    <span className="font-mono text-[11px] text-slate-400">
                      {gym.id} · {gym.address?.city}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {gym.owner?.fullName}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                    {gym.businessEmail}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-mono tabular-nums whitespace-nowrap">
                    {gym.contactNumber}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[13px] text-slate-700 tabular-nums">
                    {gym.branches?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[13px] text-slate-700 tabular-nums">
                    {formatNumber(gym.totalMembers)}
                  </td>
                  <td className="px-4 py-3">
                    <SubscriptionBadge plan={gym.subscription?.plan} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 tabular-nums whitespace-nowrap">
                    {formatDate(gym.registeredAt)}
                  </td>
                  <td className="px-4 py-3">
                    <GymStatusBadge status={gym.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <Link
                        to={`/super-admin/gyms/${gym.id}`}
                        title="View Gym Details"
                        aria-label={`View ${gym.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <Link
                        to={`/super-admin/gyms/${gym.id}/edit`}
                        title="Edit Gym"
                        aria-label={`Edit ${gym.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onToggleStatus?.(gym)}
                        title={isSuspendedOrInactive ? 'Activate Gym' : 'Suspend Gym'}
                        aria-label={
                          isSuspendedOrInactive
                            ? `Activate ${gym.name}`
                            : `Suspend ${gym.name}`
                        }
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          isSuspendedOrInactive
                            ? 'text-emerald-700 hover:bg-emerald-50'
                            : 'text-amber-700 hover:bg-amber-50'
                        }`}
                      >
                        {isSuspendedOrInactive ? (
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Ban className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(gym)}
                        title="Delete Gym"
                        aria-label={`Delete ${gym.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-slate-200">
        {gyms.map((gym) => {
          const isSuspendedOrInactive =
            gym.status === 'suspended' || gym.status === 'inactive';

          return (
            <div key={gym.id} className="p-4 space-y-3 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {renderLogo(gym)}
                  <div className="min-w-0">
                    <Link
                      to={`/super-admin/gyms/${gym.id}`}
                      className="font-semibold text-slate-900 hover:underline block truncate"
                    >
                      {gym.name}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      {gym.owner?.fullName} · {gym.address?.city}
                    </p>
                  </div>
                </div>
                <GymStatusBadge status={gym.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block">Plan</span>
                  <SubscriptionBadge plan={gym.subscription?.plan} className="mt-1" />
                </div>
                <div>
                  <span className="text-slate-400 block">Branches / Members</span>
                  <span className="font-mono font-medium text-slate-800 tabular-nums mt-1 block">
                    {gym.branches?.length || 0} / {formatNumber(gym.totalMembers)}
                  </span>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-slate-400">Contact: </span>
                  {gym.businessEmail} · {gym.contactNumber}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 tabular-nums">
                  {formatDate(gym.registeredAt)}
                </span>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/super-admin/gyms/${gym.id}`}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    View
                  </Link>
                  <Link
                    to={`/super-admin/gyms/${gym.id}/edit`}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => onToggleStatus?.(gym)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    {isSuspendedOrInactive ? 'Activate' : 'Suspend'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(gym)}
                    aria-label={`Delete ${gym.name}`}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination & Rows Per Page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200 px-4 py-3 bg-slate-50/40">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="whitespace-nowrap">Rows per page:</span>
          <Select
            aria-label="Rows per page"
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            options={PAGE_SIZE_OPTIONS}
            containerClassName="w-28"
            className="h-8 text-xs"
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          className="border-t-0 pt-0 flex-1 sm:justify-end"
        />
      </div>
    </div>
  );
}

export default GymTable;
