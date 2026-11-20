import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, CheckCircle2, ClipboardCheck, Plus, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { WORKING_DAYS_OPTIONS } from '../../../constants/trainerStaffData';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';

export function TrainerAssignmentsPage() {
  const [searchParams] = useSearchParams();
  const initialTrainer = searchParams.get('trainer') || '';

  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();
  const {
    allTenantTrainers,
    assignments,
    createAssignment,
    reassignTrainer,
    endAssignment,
  } = useTrainerStaff();

  const [trainerId, setTrainerId] = useState(initialTrainer || allTenantTrainers[0]?.id || '');
  const [memberId, setMemberId] = useState(tenantMembers[0]?.id || '');
  const [branchId, setBranchId] = useState(tenantBranches[0]?.id || '');
  const [planType, setPlanType] = useState('12-Session Hypertrophy Block');
  const [startDate, setStartDate] = useState('2026-11-20');
  const [endDate, setEndDate] = useState('2027-02-20');
  const [timeSlot, setTimeSlot] = useState('09:00 - 10:00');
  const [scheduleDays, setScheduleDays] = useState(['Mon', 'Wed', 'Fri']);
  const [sessionsTotal, setSessionsTotal] = useState(24);
  const [goal, setGoal] = useState('Lean muscle gain & movement consistency');
  const [notes, setNotes] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');
  const [reassignTarget, setReassignTarget] = useState(null);
  const [newTrainerId, setNewTrainerId] = useState('');
  const [endTarget, setEndTarget] = useState(null);

  useEffect(() => {
    if (!trainerId && allTenantTrainers[0]?.id) setTrainerId(allTenantTrainers[0].id);
    if (!memberId && tenantMembers[0]?.id) setMemberId(tenantMembers[0].id);
    if (!branchId && tenantBranches[0]?.id) setBranchId(tenantBranches[0].id);
  }, [allTenantTrainers, tenantMembers, tenantBranches, trainerId, memberId, branchId]);

  const selectedTrainer = allTenantTrainers.find((t) => t.id === trainerId);
  const activeCount = assignments.filter((a) => a.status === 'active').length;
  const completedCount = assignments.filter((a) => a.status === 'completed').length;

  const filteredAssignments = useMemo(() => {
    if (statusFilter === 'all') return assignments;
    return assignments.filter((a) => a.status === statusFilter);
  }, [assignments, statusFilter]);

  const toggleDay = (day) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAssign = (e) => {
    e.preventDefault();
    const member = tenantMembers.find((m) => m.id === memberId);
    if (!member) {
      toast.error('Please select a valid member');
      return;
    }

    const result = createAssignment({
      trainerId,
      memberId: member.id,
      memberName: member.fullName,
      branchId,
      planType,
      startDate,
      endDate,
      scheduleDays,
      timeSlot,
      sessionsTotal,
      goal,
      notes,
    });

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(`Assigned ${member.fullName} to ${selectedTrainer?.fullName || 'trainer'}`);
    setNotes('');
  };

  const handleReassignSubmit = () => {
    if (!reassignTarget || !newTrainerId) return;
    const res = reassignTrainer(reassignTarget.id, newTrainerId);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('Trainer reassigned cleanly');
    setReassignTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainer Assignments"
        description="Pair members with personal trainers, validate coach capacity, and prevent time-slot conflicts."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Assignments" value={activeCount} icon={ClipboardCheck} />
        <StatCard label="Completed Programs" value={completedCount} icon={CheckCircle2} />
        <StatCard
          label="Available Coaches"
          value={allTenantTrainers.filter((t) => t.status === 'active' && t.assignedClients < t.maxClients).length}
          icon={Plus}
        />
      </div>

      {/* Assign Form */}
      <form
        onSubmit={handleAssign}
        className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Assign Trainer to Member</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an active coach, existing gym member, branch, and weekly coaching window.
            </p>
          </div>
          {selectedTrainer && (
            <div className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
              <span className="text-slate-500">Coach Load: </span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {selectedTrainer.assignedClients}/{selectedTrainer.maxClients} clients
              </span>
              <span className="text-slate-400"> · </span>
              <span className="text-slate-600">Shift {selectedTrainer.shiftStart}–{selectedTrainer.shiftEnd}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Select Trainer *"
            value={trainerId}
            onChange={(e) => setTrainerId(e.target.value)}
            options={allTenantTrainers.map((t) => ({
              value: t.id,
              label: `${t.fullName} (${t.assignedClients}/${t.maxClients})`,
            }))}
          />
          <Select
            label="Select Member *"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            options={tenantMembers.map((m) => ({
              value: m.id,
              label: `${m.fullName} (${m.id})`,
            }))}
          />
          <Select
            label="Branch *"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            options={tenantBranches.map((b) => ({ value: b.id, label: b.name }))}
          />
          <Input
            label="Plan / Package"
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
          />
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Input
            label="Time Slot"
            placeholder="09:00 - 10:00"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          />
          <Input
            label="Total Sessions"
            type="number"
            min="1"
            max="120"
            value={sessionsTotal}
            onChange={(e) => setSessionsTotal(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Schedule Days
            </label>
            <div className="flex flex-wrap gap-2">
              {WORKING_DAYS_OPTIONS.map((day) => {
                const active = scheduleDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                      active
                        ? 'border-navy-900 bg-navy-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Primary Training Goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <Input
              label="Coaching Notes"
              placeholder="Injury notes or progression focus..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={Plus}>
            Create Assignment
          </Button>
        </div>
      </form>

      {/* Assignment Table */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Member-Trainer Assignments</h2>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <EmptyState
            title="No assignments found"
            description="Create a member coaching assignment using the form above."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="py-3 pr-4">Member</th>
                  <th className="py-3 px-4">Trainer</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Program &amp; Goal</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Sessions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 pr-4">
                      <Link
                        to={`/gym/members/${a.memberId}`}
                        className="font-semibold text-navy-800 hover:underline"
                      >
                        {a.memberName}
                      </Link>
                      <p className="text-xs text-slate-500">{a.memberId}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/gym/trainers/${a.trainerId}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {a.trainerName}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{a.branchName}</td>
                    <td className="py-3.5 px-4 max-w-[240px]">
                      <p className="font-medium text-slate-800 truncate">{a.planType}</p>
                      <p className="text-xs text-slate-500 truncate">{a.goal}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <p>{a.scheduleDays?.join(', ')}</p>
                      <p className="tabular-nums">{a.timeSlot}</p>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-medium text-slate-900">
                      {a.sessionsCompleted}/{a.sessionsTotal}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      {a.status === 'active' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReassignTarget(a);
                              setNewTrainerId(a.trainerId);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-navy-800 hover:underline cursor-pointer"
                          >
                            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => setEndTarget(a)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            End
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Change Trainer Modal */}
      <Modal
        isOpen={Boolean(reassignTarget)}
        onClose={() => setReassignTarget(null)}
        title="Change Assigned Trainer"
        description={
          reassignTarget
            ? `Reassign ${reassignTarget.memberName} (${reassignTarget.planType}) to another active coach.`
            : ''
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReassignTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleReassignSubmit}>
              Confirm Reassignment
            </Button>
          </div>
        }
      >
        <Select
          label="New Trainer"
          value={newTrainerId}
          onChange={(e) => setNewTrainerId(e.target.value)}
          options={allTenantTrainers
            .filter((t) => t.status === 'active')
            .map((t) => ({
              value: t.id,
              label: `${t.fullName} (${t.assignedClients}/${t.maxClients} clients)`,
            }))}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(endTarget)}
        title="End Coaching Assignment?"
        description={
          endTarget
            ? `Mark ${endTarget.memberName}'s assignment with ${endTarget.trainerName} as completed?`
            : ''
        }
        confirmLabel="End Assignment"
        variant="danger"
        onConfirm={() => {
          endAssignment(endTarget.id);
          toast.success('Assignment marked completed');
          setEndTarget(null);
        }}
        onClose={() => setEndTarget(null)}
      />
    </div>
  );
}

export default TrainerAssignmentsPage;
