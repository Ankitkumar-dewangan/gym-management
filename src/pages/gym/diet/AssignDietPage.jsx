import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Apple,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

const DEFAULT_MEMBERS = [
  {
    id: 'MEM-4094',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    membershipStatus: 'Active',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'MEM-4095',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@outlook.com',
    membershipStatus: 'Active',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'MEM-4096',
    name: 'Pooja Verma',
    email: 'pooja.verma@gmail.com',
    membershipStatus: 'Active',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'MEM-4097',
    name: 'Karan Kapoor',
    email: 'karan.kapoor@yahoo.com',
    membershipStatus: 'Active',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'MEM-4098',
    name: 'Sneha Patel',
    email: 'sneha.patel@gmail.com',
    membershipStatus: 'Active',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
];

export function AssignDietPage() {
  const [searchParams] = useSearchParams();
  const preselectedPlanId = searchParams.get('planId') || '';

  const { tenantMembers } = useMemberManagement();
  const { dietPlans, dietAssignments, assignDiet, bulkAssignDiet } = useWorkoutDiet();

  const membersList = useMemo(() => {
    if (tenantMembers && tenantMembers.length > 0) {
      return tenantMembers.map((m) => ({
        id: m.id || m.memberId,
        name: m.fullName || m.name,
        email: m.email,
        membershipStatus: m.status || 'Active',
        photo: m.avatar || m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      }));
    }
    return DEFAULT_MEMBERS;
  }, [tenantMembers]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // Assignment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetMember, setModalTargetMember] = useState(null);

  const [form, setForm] = useState({
    dietPlanId: preselectedPlanId || (dietPlans[0]?.id || ''),
    nutritionistName: 'Priya Patel (Nutritionist)',
    targetCalories: 2200,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    allergies: 'None reported. Prefers low sodium in evening meal.',
  });

  const filteredMembers = useMemo(() => {
    return membersList.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [membersList, searchQuery]);

  const getActiveDiet = (memberId) => {
    return dietAssignments.find((a) => a.memberId === memberId && a.status === 'Active');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMemberIds(filteredMembers.map((m) => m.id));
    } else {
      setSelectedMemberIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openAssignModal = (member) => {
    setModalTargetMember(member);
    const plan = dietPlans.find((p) => p.id === (preselectedPlanId || form.dietPlanId));
    setForm((prev) => ({
      ...prev,
      dietPlanId: plan?.id || prev.dietPlanId,
      targetCalories: plan?.targetCalories || prev.targetCalories,
    }));
    setIsModalOpen(true);
  };

  const openBulkAssignModal = () => {
    if (selectedMemberIds.length === 0) {
      toast.error('Select at least one member');
      return;
    }
    setModalTargetMember(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const plan = dietPlans.find((p) => p.id === form.dietPlanId);
    const planName = plan?.name || 'Assigned Diet Plan';

    if (modalTargetMember) {
      assignDiet({
        memberId: modalTargetMember.id,
        memberName: modalTargetMember.name,
        memberPhoto: modalTargetMember.photo,
        dietPlanId: form.dietPlanId,
        dietPlanName: planName,
        nutritionistName: form.nutritionistName,
        startDate: form.startDate,
        endDate: form.endDate,
        targetCalories: Number(form.targetCalories) || 2000,
        allergies: form.allergies,
      });
    } else {
      const selectedMembers = membersList.filter((m) => selectedMemberIds.includes(m.id));
      bulkAssignDiet({
        memberList: selectedMembers,
        dietPlanId: form.dietPlanId,
        dietPlanName: planName,
        nutritionistName: form.nutritionistName,
        startDate: form.startDate,
        endDate: form.endDate,
        targetCalories: Number(form.targetCalories) || 2000,
      });
      setSelectedMemberIds([]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Diet & Nutrition Plans"
        description="Prescribe personalized macronutrient targets, dietary restrictions, and certified nutritionist consultations to gym members."
        actions={
          selectedMemberIds.length > 0 && (
            <Button onClick={openBulkAssignModal} leftIcon={UserCheck}>
              Assign Diet to ({selectedMemberIds.length}) Selected
            </Button>
          )
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <Input
          placeholder="Search member by name or member ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={Search}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Member Roster ({filteredMembers.length})
            </span>
            {selectedMemberIds.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
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
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Membership</th>
                <th className="py-3 px-4">Current Diet Plan</th>
                <th className="py-3 px-4">Nutritionist</th>
                <th className="py-3 px-4">Adherence</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const activeDiet = getActiveDiet(member.id);
                const isSelected = selectedMemberIds.includes(member.id);

                return (
                  <tr
                    key={member.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(member.id)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {member.membershipStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {activeDiet ? (
                        <div>
                          <p className="font-medium text-slate-800">{activeDiet.dietPlanName}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">
                            🔥 {activeDiet.targetCalories} kcal
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No diet plan assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {activeDiet?.nutritionistName || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {activeDiet ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {activeDiet.adherenceRate}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant={activeDiet ? 'outline' : 'primary'}
                        onClick={() => openAssignModal(member)}
                      >
                        {activeDiet ? 'Update Plan' : 'Assign Diet'}
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalTargetMember
            ? `Assign Diet Plan to ${modalTargetMember.name}`
            : `Bulk Assign Diet Plan to (${selectedMemberIds.length}) Members`
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Diet Plan"
            value={form.dietPlanId}
            onChange={(e) => {
              const selectedPlan = dietPlans.find((p) => p.id === e.target.value);
              setForm({
                ...form,
                dietPlanId: e.target.value,
                targetCalories: selectedPlan?.targetCalories || form.targetCalories,
              });
            }}
            options={dietPlans.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.dietType} · ${p.targetCalories} kcal)`,
            }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Assigned Nutritionist"
              value={form.nutritionistName}
              onChange={(e) => setForm({ ...form, nutritionistName: e.target.value })}
              required
            />
            <Input
              label="Custom Daily Calorie Target (kcal)"
              type="number"
              value={form.targetCalories}
              onChange={(e) => setForm({ ...form, targetCalories: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Food Allergies & Restrictions Notes
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-500 focus:outline-hidden"
              placeholder="e.g. Peanut allergy, gluten sensitive, lactose intolerance..."
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={CheckCircle2}>
              Confirm Diet Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AssignDietPage;
