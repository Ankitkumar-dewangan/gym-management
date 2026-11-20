import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, PauseCircle, Play, Snowflake } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { formatDate } from '../../../utils/formatters';
import {
  calculateFreezeDurationDays,
  calculateReviewedFreezeExpiry,
  REFERENCE_TODAY,
} from '../../../utils/membershipCalculations';

export function FreezeResumePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getMembershipById,
    freezeMembership,
    resumeMembership,
  } = useMembershipManagement();

  const membership = getMembershipById(id);

  const [freezeStartDate, setFreezeStartDate] = useState(REFERENCE_TODAY);
  const [freezeEndDate, setFreezeEndDate] = useState('2026-11-25');
  const [freezeReason, setFreezeReason] = useState('Travel or temporary medical rest');
  const [applyExtension, setApplyExtension] = useState(true);

  const freezeDays = useMemo(
    () => calculateFreezeDurationDays(freezeStartDate, freezeEndDate),
    [freezeStartDate, freezeEndDate]
  );

  if (!membership) {
    return (
      <EmptyState
        title="Membership not found"
        description="Unable to load this membership record for freeze management."
        actionLabel="Active Memberships"
        onAction={() => navigate('/gym/membership/active')}
      />
    );
  }

  const allowedFreezeDays = membership.allowedFreezeDays || 0;
  const usedFreezeDays = membership.usedFreezeDays || 0;
  const remainingFreezeDays = Math.max(0, allowedFreezeDays - usedFreezeDays);

  const reviewedExpiryDate = applyExtension
    ? calculateReviewedFreezeExpiry(membership.expiryDate, freezeDays)
    : membership.expiryDate;

  const handleFreeze = (e) => {
    e.preventDefault();
    if (freezeDays <= 0) {
      toast.error('Freeze end date must be on or after start date');
      return;
    }
    if (freezeDays > remainingFreezeDays) {
      toast.error(`Requested ${freezeDays} days exceeds remaining allowance (${remainingFreezeDays} days)`);
      return;
    }
    const ok = freezeMembership(membership.id, {
      freezeStartDate,
      freezeEndDate,
      reason: freezeReason,
      applyExpiryExtension: applyExtension,
    });
    if (ok) {
      toast.success(`Frozen ${membership.memberName}'s membership for ${freezeDays} days`);
    }
  };

  const handleResume = () => {
    resumeMembership(membership.id);
    toast.success(`Resumed active membership for ${membership.memberName}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Freeze / Resume · ${membership.memberName}`}
        description={`Manage temporary hold periods and reviewed expiry adjustments for ${membership.planName}.`}
        actions={
          <Button
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => navigate(`/gym/membership/${membership.id}`)}
          >
            Back to Membership
          </Button>
        }
      />

      {/* Freeze Allowance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Allowed Freeze Days"
          value={`${allowedFreezeDays} days`}
          helperText="plan annual cap"
          icon={Snowflake}
        />
        <StatCard
          label="Used Freeze Days"
          value={`${usedFreezeDays} days`}
          helperText="prior holds"
          icon={PauseCircle}
        />
        <StatCard
          label="Remaining Allowance"
          value={`${remainingFreezeDays} days`}
          trend={remainingFreezeDays === 0 ? 'down' : 'neutral'}
          helperText="available to freeze"
          icon={CalendarCheck}
        />
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
          <span className="text-sm font-medium text-slate-500">Current Freeze Status</span>
          <div className="mt-2 flex items-center justify-between">
            <StatusBadge status={membership.status} />
            {membership.status === 'frozen' && (
              <Button variant="emerald" size="sm" leftIcon={Play} onClick={handleResume}>
                Resume Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Freeze Request Form */}
      {membership.status !== 'frozen' && (
        <form
          onSubmit={handleFreeze}
          className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">Schedule Membership Freeze</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review the calculated freeze duration and proposed expiry adjustment before submitting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Member" value={`${membership.memberName} (${membership.memberId})`} readOnly />
            <Input label="Current Membership" value={membership.planName} readOnly />
            <Input
              label="Freeze Start Date"
              type="date"
              required
              value={freezeStartDate}
              onChange={(e) => setFreezeStartDate(e.target.value)}
            />
            <Input
              label="Freeze End Date"
              type="date"
              required
              value={freezeEndDate}
              onChange={(e) => setFreezeEndDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8">
              <Input
                label="Freeze Reason"
                required
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
              />
            </div>
            <div className="md:col-span-4 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs">
              <p className="text-slate-500">Calculated Freeze Duration</p>
              <p className="font-mono text-base font-bold text-navy-900 mt-0.5">
                {freezeDays} {freezeDays === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          {/* Transparent Expiry Review Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
            <label className="flex items-center gap-2.5 font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={applyExtension}
                onChange={(e) => setApplyExtension(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
              />
              <span>Extend membership expiry date by {freezeDays} frozen days</span>
            </label>
            <div className="flex flex-wrap items-center gap-4 text-slate-600">
              <span>
                Current Expiry: <strong className="font-mono text-slate-900">{formatDate(membership.expiryDate)}</strong>
              </span>
              <span aria-hidden="true">→</span>
              <span>
                Reviewed Expiry After Freeze:{' '}
                <strong className="font-mono text-emerald-700">{formatDate(reviewedExpiryDate)}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/gym/membership/${membership.id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={PauseCircle}
              disabled={remainingFreezeDays <= 0}
            >
              Freeze Membership
            </Button>
          </div>
        </form>
      )}

      {/* Freeze History Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Freeze History</h2>
        </div>
        {(membership.freezeHistory || []).length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No previous freezes recorded on this membership.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Freeze Start</th>
                  <th className="px-4 py-3 font-medium">Freeze End</th>
                  <th className="px-4 py-3 font-medium">Days</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Reviewed Expiry</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {membership.freezeHistory.map((f) => (
                  <tr key={f.id}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{formatDate(f.startDate)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{formatDate(f.endDate)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">{f.days}d</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{f.reason}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{formatDate(f.expiryAdjustedTo)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={f.status === 'active' ? 'frozen' : 'active'}
                        label={f.status === 'active' ? 'Frozen' : 'Resumed'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FreezeResumePage;
