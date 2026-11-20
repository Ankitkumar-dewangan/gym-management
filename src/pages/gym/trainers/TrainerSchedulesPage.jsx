import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock, Plus, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';

const WEEK_DATES = [
  { date: '2026-11-16', label: 'Mon 16' },
  { date: '2026-11-17', label: 'Tue 17' },
  { date: '2026-11-18', label: 'Wed 18' },
  { date: '2026-11-19', label: 'Thu 19' },
  { date: '2026-11-20', label: 'Fri 20' },
  { date: '2026-11-21', label: 'Sat 21' },
  { date: '2026-11-22', label: 'Sun 22' },
];

export function TrainerSchedulesPage() {
  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();
  const {
    allTenantTrainers,
    sessions,
    createTrainingSession,
    updateTrainingSession,
  } = useTrainerStaff();

  const [calendarView, setCalendarView] = useState('weekly'); // daily | weekly | monthly
  const [selectedDate, setSelectedDate] = useState('2026-11-19');
  const [trainerFilter, setTrainerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [createOpen, setCreateOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [formState, setFormState] = useState({
    trainerId: allTenantTrainers[0]?.id || '',
    memberId: tenantMembers[0]?.id || '',
    branchId: tenantBranches[0]?.id || '',
    sessionType: 'Strength & Conditioning',
    date: '2026-11-20',
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
  });
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStart, setRescheduleStart] = useState('');
  const [rescheduleEnd, setRescheduleEnd] = useState('');

  const filteredSessions = useMemo(() => {
    return sessions
      .filter((s) => {
        const matchTrainer = trainerFilter === 'all' || s.trainerId === trainerFilter;
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchTrainer && matchStatus;
      })
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }, [sessions, trainerFilter, statusFilter]);

  const dailySessions = useMemo(
    () => filteredSessions.filter((s) => s.date === selectedDate),
    [filteredSessions, selectedDate]
  );

  const monthDays = useMemo(() => {
    return Array.from({ length: 30 }, (_, idx) => {
      const day = idx + 1;
      const dateStr = `2026-11-${String(day).padStart(2, '0')}`;
      return {
        day,
        date: dateStr,
        items: filteredSessions.filter((s) => s.date === dateStr),
      };
    });
  }, [filteredSessions]);

  const handleCreateSession = (e) => {
    e.preventDefault();
    const member = tenantMembers.find((m) => m.id === formState.memberId);
    const res = createTrainingSession({
      ...formState,
      memberName: member?.fullName || 'Member',
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('Training session scheduled');
    setCreateOpen(false);
  };

  const openReschedule = (session) => {
    setRescheduleTarget(session);
    setRescheduleDate(session.date);
    setRescheduleStart(session.startTime);
    setRescheduleEnd(session.endTime);
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleTarget) return;
    const res = updateTrainingSession(rescheduleTarget.id, {
      date: rescheduleDate,
      startTime: rescheduleStart,
      endTime: rescheduleEnd,
      status: 'scheduled',
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('Session rescheduled');
    setRescheduleTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainer Schedules"
        description="Interactive daily, weekly, and monthly training calendar with conflict detection."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
            Create Session
          </Button>
        }
      />

      {/* Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['daily', 'weekly', 'monthly'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setCalendarView(mode)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize cursor-pointer ${
                calendarView === mode
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {mode} View
            </button>
          ))}
          {calendarView === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 px-3 text-xs text-slate-800"
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:w-[420px]">
          <Select
            value={trainerFilter}
            onChange={(e) => setTrainerFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Trainers' },
              ...allTenantTrainers.map((t) => ({ value: t.id, label: t.fullName })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Sessions' },
              { value: 'scheduled', label: 'Upcoming' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {/* Daily View */}
      {calendarView === 'daily' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Schedule for {selectedDate}
            </h2>
            <span className="text-xs text-slate-500">{dailySessions.length} sessions</span>
          </div>

          {dailySessions.length === 0 ? (
            <EmptyState
              title="No sessions on this date"
              description="Create a new training session or select another calendar day."
              actionLabel="Create Session"
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {dailySessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 tabular-nums">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {session.startTime} – {session.endTime}
                      </span>
                      <StatusBadge status={session.status} />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {session.sessionType} · {session.memberName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Trainer: {session.trainerName} · {session.branchName}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {session.status === 'scheduled' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReschedule(session)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={CheckCircle2}
                          onClick={() => {
                            updateTrainingSession(session.id, { status: 'completed', rating: 5 });
                            toast.success('Session marked completed');
                          }}
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={XCircle}
                          onClick={() => {
                            updateTrainingSession(session.id, { status: 'cancelled' });
                            toast.success('Session cancelled');
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weekly View */}
      {calendarView === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
          {WEEK_DATES.map((day) => {
            const items = filteredSessions.filter((s) => s.date === day.date);
            return (
              <div
                key={day.date}
                className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col gap-3 min-h-[240px]"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-semibold text-slate-900">{day.label}</span>
                  <span className="text-[11px] text-slate-500 tabular-nums">{items.length}</span>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 my-auto text-center">No sessions</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-semibold text-navy-900 tabular-nums">
                            {s.startTime}–{s.endTime}
                          </span>
                          <StatusBadge status={s.status} />
                        </div>
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {s.memberName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{s.trainerName}</p>
                        <p className="text-[11px] text-slate-600 truncate">{s.sessionType}</p>
                        {s.status === 'scheduled' && (
                          <div className="flex items-center gap-2 pt-1 text-[11px]">
                            <button
                              type="button"
                              onClick={() => openReschedule(s)}
                              className="text-navy-800 hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateTrainingSession(s.id, { status: 'completed', rating: 5 });
                                toast.success('Marked completed');
                              }}
                              className="text-emerald-700 hover:underline cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Monthly View */}
      {calendarView === 'monthly' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-navy-900" aria-hidden="true" />
              November 2026 Calendar
            </h2>
            <span className="text-xs text-slate-500">Click any date to inspect daily schedule</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {monthDays.map((cell) => (
              <button
                key={cell.date}
                type="button"
                onClick={() => {
                  setSelectedDate(cell.date);
                  setCalendarView('daily');
                }}
                className="rounded-lg border border-slate-200 p-3 text-left hover:border-navy-700 hover:bg-slate-50 transition-colors cursor-pointer min-h-[84px] flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-slate-700 tabular-nums">
                  Nov {cell.day}
                </span>
                {cell.items.length > 0 ? (
                  <span className="inline-flex items-center rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-800 w-fit">
                    {cell.items.length} {cell.items.length === 1 ? 'session' : 'sessions'}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Open</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Schedule Training Session"
        description="Book a 1-on-1 or small-group coaching slot with automatic conflict validation."
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <Select
            label="Trainer"
            value={formState.trainerId}
            onChange={(e) => setFormState((p) => ({ ...p, trainerId: e.target.value }))}
            options={allTenantTrainers.map((t) => ({ value: t.id, label: t.fullName }))}
          />
          <Select
            label="Member"
            value={formState.memberId}
            onChange={(e) => setFormState((p) => ({ ...p, memberId: e.target.value }))}
            options={tenantMembers.map((m) => ({ value: m.id, label: `${m.fullName} (${m.id})` }))}
          />
          <Select
            label="Branch"
            value={formState.branchId}
            onChange={(e) => setFormState((p) => ({ ...p, branchId: e.target.value }))}
            options={tenantBranches.map((b) => ({ value: b.id, label: b.name }))}
          />
          <Input
            label="Session Type"
            value={formState.sessionType}
            onChange={(e) => setFormState((p) => ({ ...p, sessionType: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Date"
              type="date"
              value={formState.date}
              onChange={(e) => setFormState((p) => ({ ...p, date: e.target.value }))}
            />
            <Input
              label="Start"
              type="time"
              value={formState.startTime}
              onChange={(e) => setFormState((p) => ({ ...p, startTime: e.target.value }))}
            />
            <Input
              label="End"
              type="time"
              value={formState.endTime}
              onChange={(e) => setFormState((p) => ({ ...p, endTime: e.target.value }))}
            />
          </div>
          <Input
            label="Notes"
            placeholder="Session focus..."
            value={formState.notes}
            onChange={(e) => setFormState((p) => ({ ...p, notes: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule Training Session"
        description={
          rescheduleTarget
            ? `Update time window for ${rescheduleTarget.memberName} with ${rescheduleTarget.trainerName}.`
            : ''
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRescheduleTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRescheduleSubmit}>
              Save Schedule
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
            label="Start Time"
            type="time"
            value={rescheduleStart}
            onChange={(e) => setRescheduleStart(e.target.value)}
          />
          <Input
            label="End Time"
            type="time"
            value={rescheduleEnd}
            onChange={(e) => setRescheduleEnd(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export default TrainerSchedulesPage;
