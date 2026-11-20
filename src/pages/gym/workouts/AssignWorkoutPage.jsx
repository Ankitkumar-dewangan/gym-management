import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Filter,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

const DEFAULT_MEMBERS = [
  {
    id: 'MEM-4094',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    phone: '+91 98201 22311',
    membershipStatus: 'Active',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'MEM-4095',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@outlook.com',
    phone: '+91 98192 44321',
    membershipStatus: 'Active',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'MEM-4096',
    name: 'Pooja Verma',
    email: 'pooja.verma@gmail.com',
    phone: '+91 99203 11843',
    membershipStatus: 'Active',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'MEM-4097',
    name: 'Karan Kapoor',
    email: 'karan.kapoor@yahoo.com',
    phone: '+91 98334 55902',
    membershipStatus: 'Active',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'MEM-4098',
    name: 'Sneha Patel',
    email: 'sneha.patel@gmail.com',
    phone: '+91 98210 99841',
    membershipStatus: 'Active',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
];

export function AssignWorkoutPage() {
  const [searchParams] = useSearchParams();
  const preselectedPlanId = searchParams.get('planId') || '';

  const { tenantMembers } = useMemberManagement();
  const { tenantTrainers } = useTrainerStaff();
  const { workoutPlans, workoutAssignments, assignWorkout, bulkAssignWorkout } = useWorkoutDiet();

  // Combine tenant members with defaults if empty
  const membersList = useMemo(() => {
    if (tenantMembers && tenantMembers.length > 0) {
      return tenantMembers.map((m) => ({
        id: m.id || m.memberId,
        name: m.fullName || m.name,
        email: m.email,
        phone: m.phone,
        membershipStatus: m.status || 'Active',
        photo: m.avatar || m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      }));
    }
    return DEFAULT_MEMBERS;
  }, [tenantMembers]);

  const trainersList = useMemo(() => {
    if (tenantTrainers && tenantTrainers.length > 0) {
      return tenantTrainers.map((t) => t.fullName || t.name);
    }
    return ['Vikram Singh', 'Rahul Deshmukh', 'Ananya Roy', 'Kabir Bedi'];
  }, [tenantTrainers]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [modalTargetMember, setModalTargetMember] = useState(null); // null if bulk

  const [assignmentForm, setAssignmentForm] = useState({
    workoutPlanId: preselectedPlanId || (workoutPlans[0]?.id || ''),
    trainerName: trainersList[0] || 'Vikram Singh',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    weeklySchedule: 'Mon, Wed, Fri, Sat',
    notes: 'Focus on progressive overload and maintain proper hydration.',
  });

  const filteredMembers = useMemo(() => {
    return membersList.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || m.membershipStatus.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [membersList, searchQuery, statusFilter]);

  // Get active workout for member
  const getActiveWorkout = (memberId) => {
    return workoutAssignments.find(
      (a) => a.memberId === memberId && a.status === 'Active'
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMemberIds(filteredMembers.map((m) => m.id));
    } else {
      setSelectedMemberIds([]);
    }
  };

  const toggleSelectMember = (memberId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const openAssignModalForMember = (member) => {
    setModalTargetMember(member);
    setAssignmentForm((prev) => ({
      ...prev,
      workoutPlanId: preselectedPlanId || prev.workoutPlanId || (workoutPlans[0]?.id || ''),
    }));
    setIsAssignModalOpen(true);
  };

  const openBulkAssignModal = () => {
    if (selectedMemberIds.length === 0) {
      toast.error('Please select at least one member.');
      return;
    }
    setModalTargetMember(null);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    const selectedPlan = workoutPlans.find((p) => p.id === assignmentForm.workoutPlanId);
    const planName = selectedPlan?.name || 'Assigned Plan';

    if (modalTargetMember) {
      // Single assignment
      assignWorkout({
        memberId: modalTargetMember.id,
        memberName: modalTargetMember.name,
        memberPhoto: modalTargetMember.photo,
        membershipStatus: modalTargetMember.membershipStatus,
        workoutPlanId: assignmentForm.workoutPlanId,
        workoutPlanName: planName,
        trainerName: assignmentForm.trainerName,
        startDate: assignmentForm.startDate,
        endDate: assignmentForm.endDate,
        weeklySchedule: assignmentForm.weeklySchedule,
        notes: assignmentForm.notes,
      });
    } else {
      // Bulk assignment
      const targetMembers = membersList.filter((m) => selectedMemberIds.includes(m.id));
      bulkAssignWorkout({
        memberList: targetMembers,
        workoutPlanId: assignmentForm.workoutPlanId,
        workoutPlanName: planName,
        trainerName: assignmentForm.trainerName,
        startDate: assignmentForm.startDate,
        endDate: assignmentForm.endDate,
        weeklySchedule: assignmentForm.weeklySchedule,
      });
      setSelectedMemberIds([]);
    }

    setIsAssignModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Workout Plans to Members"
        description="Enroll single or multiple gym members into customized workout splits, assign responsible trainers, and define weekly training schedules."
        actions={
          selectedMemberIds.length > 0 && (
            <Button onClick={openBulkAssignModal} leftIcon={UserCheck}>
              Bulk Assign to ({selectedMemberIds.length}) Selected
            </Button>
          )
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search member by name, ID, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Membership Statuses' },
              { value: 'Active', label: 'Active Members Only' },
              { value: 'Expired', label: 'Expired / Inactive' },
            ]}
          />
        </div>
      </div>

      {/* Member Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Members Directory ({filteredMembers.length})
            </span>
            {selectedMemberIds.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-bold">
                {selectedMemberIds.length} Selected
              </span>
            )}
          </div>

          {selectedMemberIds.length > 0 && (
            <Button size="sm" onClick={openBulkAssignModal} leftIcon={UserCheck}>
              Assign Plan ({selectedMemberIds.length})
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredMembers.length > 0 &&
                      selectedMemberIds.length === filteredMembers.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                  />
                </th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Membership Status</th>
                <th className="py-3 px-4">Current Workout Plan</th>
                <th className="py-3 px-4">Assigned Trainer</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const activeAssignment = getActiveWorkout(member.id);
                const isSelected = selectedMemberIds.includes(member.id);

                return (
                  <tr
                    key={member.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-primary-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectMember(member.id)}
                        className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{member.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          member.membershipStatus.toLowerCase() === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {member.membershipStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {activeAssignment ? (
                        <div>
                          <p className="font-medium text-slate-800">
                            {activeAssignment.workoutPlanName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {activeAssignment.completedSessions}/{activeAssignment.totalSessions} Sessions done
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No plan assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {activeAssignment?.trainerName || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant={activeAssignment ? 'outline' : 'primary'}
                        onClick={() => openAssignModalForMember(member)}
                      >
                        {activeAssignment ? 'Reassign' : 'Assign Plan'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={
          modalTargetMember
            ? `Assign Workout to ${modalTargetMember.name}`
            : `Bulk Assign Workout to (${selectedMemberIds.length}) Members`
        }
        size="lg"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <Select
            label="Select Workout Plan"
            value={assignmentForm.workoutPlanId}
            onChange={(e) =>
              setAssignmentForm({ ...assignmentForm, workoutPlanId: e.target.value })
            }
            options={workoutPlans.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.difficulty} · ${p.duration})`,
            }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assigned Lead Trainer"
              value={assignmentForm.trainerName}
              onChange={(e) =>
                setAssignmentForm({ ...assignmentForm, trainerName: e.target.value })
              }
              options={trainersList.map((t) => ({ value: t, label: t }))}
              required
            />

            <Input
              label="Weekly Training Schedule"
              value={assignmentForm.weeklySchedule}
              onChange={(e) =>
                setAssignmentForm({ ...assignmentForm, weeklySchedule: e.target.value })
              }
              placeholder="e.g. Mon, Wed, Fri, Sat"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={assignmentForm.startDate}
              onChange={(e) =>
                setAssignmentForm({ ...assignmentForm, startDate: e.target.value })
              }
              required
            />
            <Input
              label="End Date"
              type="date"
              value={assignmentForm.endDate}
              onChange={(e) =>
                setAssignmentForm({ ...assignmentForm, endDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Trainer Remarks / Special Instructions
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:outline-hidden"
              placeholder="Notes on form, injury history, warm-up reminders, or load progression..."
              value={assignmentForm.notes}
              onChange={(e) =>
                setAssignmentForm({ ...assignmentForm, notes: e.target.value })
              }
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" leftIcon={CheckCircle2}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AssignWorkoutPage;
