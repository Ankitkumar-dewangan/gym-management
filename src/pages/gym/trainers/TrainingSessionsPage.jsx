import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Clock, Plus, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';

export function TrainingSessionsPage() {
  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();
  const {
    allTenantTrainers,
    sessions,
    createTrainingSession,
    updateTrainingSession,
  } = useTrainerStaff();

  const [tab, setTab] = useState('all'); // all | scheduled | completed | cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStart, setRescheduleStart] = useState('');
  const [rescheduleEnd, setRescheduleEnd] = useState('');

  const [newSession, setNewSession] = useState({
    trainerId: allTenantTrainers[0]?.id || '',
    memberId: tenantMembers[0]?.id || '',
    branchId: tenantBranches[0]?.id || '',
    sessionType: 'Strength & Hypertrophy',
    date: '2026-11-20',
    startTime: '11:00',
    endTime: '12:00',
    notes: '',
  });

  const upcomingCount = sessions.filter((s) => s.status === 'scheduled').length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const cancelledCount = sessions.filter((s) => s.status === 'cancelled').length;

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions.filter((s) => {
      const matchTab = tab === 'all' || s.status === tab;
      const matchSearch =
        !q ||
        s.memberName.toLowerCase().includes(q) ||
        s.trainerName.toLowerCase().includes(q) ||
        s.sessionType.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [sessions, tab, searchQuery]);

  const handleCreate = (e) => {
    e.preventDefault();
    const member = tenantMembers.find((m) => m.id === newSession.memberId);
    const res = createTrainingSession({
      ...newSession,
      memberName: member?.fullName || 'Member',
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('Training session created');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Sessions"
        description="Manage upcoming, completed, and cancelled personal training sessions."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
            New Training Session
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Sessions" value={sessions.length} icon={CalendarClock} />
        <StatCard label="Upcoming Sessions" value={upcomingCount} icon={Clock} />
        <StatCard label="Completed Sessions" value={completedCount} icon={CheckCircle2} />
        <StatCard label="Cancelled Sessions" value={cancelledCount} icon={XCircle} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'scheduled', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                  tab === item.id
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member, trainer, or session..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
            />
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <EmptyState
            title="No sessions match this filter"
            description="Schedule a new session or switch status tabs."
            actionLabel="Schedule Session"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="py-3 pr-4">Session ID</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Trainer</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 pr-4 font-mono text-xs font-medium text-slate-700">
                      {s.id}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-medium text-slate-900">
                      {s.date} · {s.startTime}–{s.endTime}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">{s.trainerName}</td>
                    <td className="py-3.5 px-4 text-slate-800">{s.memberName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.sessionType}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.branchName}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      {s.status === 'scheduled' ? (
                        <div className="inline-flex items-center gap-2 text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleTarget(s);
                              setRescheduleDate(s.date);
                              setRescheduleStart(s.startTime);
                              setRescheduleEnd(s.endTime);
                            }}
                            className="text-navy-800 hover:underline cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateTrainingSession(s.id, { status: 'completed', rating: 5 });
                              toast.success('Session marked completed');
                            }}
                            className="text-emerald-700 hover:underline cursor-pointer"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateTrainingSession(s.id, { status: 'cancelled' });
                              toast.success('Session cancelled');
                            }}
                            className="text-red-600 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {s.rating ? `Rated ${s.rating} ★` : 'Closed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Training Session"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Trainer"
            value={newSession.trainerId}
            onChange={(e) => setNewSession((p) => ({ ...p, trainerId: e.target.value }))}
            options={allTenantTrainers.map((t) => ({ value: t.id, label: t.fullName }))}
          />
          <Select
            label="Member"
            value={newSession.memberId}
            onChange={(e) => setNewSession((p) => ({ ...p, memberId: e.target.value }))}
            options={tenantMembers.map((m) => ({ value: m.id, label: `${m.fullName} (${m.id})` }))}
          />
          <Select
            label="Branch"
            value={newSession.branchId}
            onChange={(e) => setNewSession((p) => ({ ...p, branchId: e.target.value }))}
            options={tenantBranches.map((b) => ({ value: b.id, label: b.name }))}
          />
          <Input
            label="Session Focus"
            value={newSession.sessionType}
            onChange={(e) => setNewSession((p) => ({ ...p, sessionType: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Date"
              type="date"
              value={newSession.date}
              onChange={(e) => setNewSession((p) => ({ ...p, date: e.target.value }))}
            />
            <Input
              label="Start"
              type="time"
              value={newSession.startTime}
              onChange={(e) => setNewSession((p) => ({ ...p, startTime: e.target.value }))}
            />
            <Input
              label="End"
              type="time"
              value={newSession.endTime}
              onChange={(e) => setNewSession((p) => ({ ...p, endTime: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Session
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule Session"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRescheduleTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const res = updateTrainingSession(rescheduleTarget.id, {
                  date: rescheduleDate,
                  startTime: rescheduleStart,
                  endTime: rescheduleEnd,
                });
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                toast.success('Session updated');
                setRescheduleTarget(null);
              }}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Date"
            type="date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
          />
          <Input
            label="Start"
            type="time"
            value={rescheduleStart}
            onChange={(e) => setRescheduleStart(e.target.value)}
          />
          <Input
            label="End"
            type="time"
            value={rescheduleEnd}
            onChange={(e) => setRescheduleEnd(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export default TrainingSessionsPage;
