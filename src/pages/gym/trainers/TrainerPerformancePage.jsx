import { Link } from 'react-router-dom';
import { Award, CheckCircle2, ClipboardCheck, Star, XCircle } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import {
  MemberProgressSummaryChart,
  TrainerPerformanceChart,
  WeeklyTrainingSessionsChart,
} from '../../../components/gym/trainers/TrainerCharts';
import {
  MEMBER_PROGRESS_SUMMARY_SERIES,
  WEEKLY_TRAINING_SESSIONS_SERIES,
} from '../../../constants/trainerStaffData';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { formatCurrency } from '../../../utils/payrollCalculations';

export function TrainerPerformancePage() {
  const { trainers } = useTrainerStaff();

  const totalAssigned = trainers.reduce((sum, t) => sum + (t.assignedClients || 0), 0);
  const completedSessions = trainers.reduce((sum, t) => sum + (t.completedSessionsMonth || 0), 0);
  const cancelledSessions = trainers.reduce((sum, t) => sum + (t.cancelledSessionsMonth || 0), 0);
  const avgRetention = trainers.length
    ? Math.round(trainers.reduce((sum, t) => sum + (t.retentionRate || 90), 0) / trainers.length)
    : 0;
  const avgRating = trainers.length
    ? (trainers.reduce((sum, t) => sum + (t.rating || 4.7), 0) / trainers.length).toFixed(2)
    : '0.00';

  const rankedTrainers = [...trainers].sort(
    (a, b) => (b.completedSessionsMonth || 0) - (a.completedSessionsMonth || 0)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainer Performance"
        description="Track coaching volume, retention rates, member progress outcomes, and simulated feedback ratings."
      />

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        Note: Ratings, retention percentages, and member progress outcomes shown below are simulated demo analytics for UI verification.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Assigned Members" value={totalAssigned} icon={ClipboardCheck} />
        <StatCard label="Completed Sessions" value={completedSessions} change="+11%" trend="up" icon={CheckCircle2} />
        <StatCard label="Cancelled Sessions" value={cancelledSessions} icon={XCircle} />
        <StatCard label="Member Retention" value={`${avgRetention}%`} change="+2.4%" trend="up" icon={Award} />
        <StatCard label="Average Rating (Demo)" value={`${avgRating} / 5`} icon={Star} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrainerPerformanceChart trainers={trainers} />
        <MemberProgressSummaryChart data={MEMBER_PROGRESS_SUMMARY_SERIES} />
      </div>

      <WeeklyTrainingSessionsChart data={WEEKLY_TRAINING_SESSIONS_SERIES} />

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Trainer Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="py-3 pr-4">Trainer</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Clients</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">Cancelled</th>
                <th className="py-3 px-4">Retention</th>
                <th className="py-3 px-4">Revenue (Demo)</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 pl-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedTrainers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar src={t.avatar} name={t.fullName} size="md" />
                      <div>
                        <Link
                          to={`/gym/trainers/${t.id}`}
                          className="font-semibold text-navy-800 hover:underline"
                        >
                          {t.fullName}
                        </Link>
                        <p className="text-xs text-slate-500">{t.specializations?.[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{t.branchName}</td>
                  <td className="py-3.5 px-4 tabular-nums">{t.assignedClients}/{t.maxClients}</td>
                  <td className="py-3.5 px-4 font-semibold tabular-nums text-slate-900">
                    {t.completedSessionsMonth}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums text-slate-600">
                    {t.cancelledSessionsMonth}
                  </td>
                  <td className="py-3.5 px-4 font-medium tabular-nums text-emerald-700">
                    {t.retentionRate}%
                  </td>
                  <td className="py-3.5 px-4 font-medium tabular-nums text-slate-900">
                    {formatCurrency(t.sessionRevenueMonth)}
                  </td>
                  <td className="py-3.5 px-4 font-medium tabular-nums text-slate-900">
                    {t.rating} ★
                  </td>
                  <td className="py-3.5 pl-4">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default TrainerPerformancePage;
