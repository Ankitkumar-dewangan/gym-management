import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, CalendarCheck, Plus, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { MemberProgressCharts } from '../../../components/gym/members/MemberCharts';
import { MEMBER_MEDIA } from '../../../constants/memberManagementData';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';

export function MemberProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMemberById, addMemberProgressEntry } = useMemberManagement();

  const member = getMemberById(id);

  const [logOpen, setLogOpen] = useState(false);
  const [monthLabel, setMonthLabel] = useState('Dec');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [arm, setArm] = useState('');

  if (!member) {
    return (
      <EmptyState
        title="Member progress not found"
        description="Unable to locate this member profile under the active gym tenant."
        actionLabel="Back to Members"
        onAction={() => navigate('/gym/members')}
      />
    );
  }

  const latest =
    member.progressHistory?.[member.progressHistory.length - 1] || null;
  const currentWeight = latest?.weight ?? member.weightKg;
  const currentBmi =
    latest?.bmi ||
    (member.heightCm && currentWeight
      ? Number((currentWeight / Math.pow(member.heightCm / 100, 2)).toFixed(1))
      : null);

  const handleSaveEntry = () => {
    const w = weight ? Number(weight) : null;
    if (!monthLabel.trim() || !w) {
      toast.error('Enter a check-in label and weight');
      return;
    }
    const bmi =
      member.heightCm && w
        ? Number((w / Math.pow(member.heightCm / 100, 2)).toFixed(1))
        : null;

    addMemberProgressEntry(member.id, {
      month: monthLabel.trim(),
      weight: w,
      bmi,
      bodyFat: bodyFat ? Number(bodyFat) : null,
      chest: chest ? Number(chest) : null,
      waist: waist ? Number(waist) : null,
      hip: hip ? Number(hip) : null,
      arm: arm ? Number(arm) : null,
    });
    toast.success(`Added ${monthLabel} progress check-in`);
    setLogOpen(false);
    setWeight('');
    setBodyFat('');
    setChest('');
    setWaist('');
    setHip('');
    setArm('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Progress Overview · ${member.fullName}`}
        description={`Optional weight, body composition, and circumference check-ins for ${member.id}.`}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={ArrowLeft}
              onClick={() => navigate(`/gym/members/${member.id}`)}
            >
              Back to Profile
            </Button>
            <Button
              variant="emerald"
              leftIcon={Plus}
              onClick={() => setLogOpen(true)}
            >
              Log Check-in
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Weight"
          value={currentWeight ? `${currentWeight} kg` : '—'}
          helperText="optional weigh-in"
          icon={Scale}
        />
        <StatCard
          label="BMI Estimate"
          value={currentBmi ? String(currentBmi) : '—'}
          helperText={member.heightCm ? `height ${member.heightCm} cm` : 'height not set'}
          icon={Activity}
        />
        <StatCard
          label="Body Fat %"
          value={latest?.bodyFat ? `${latest.bodyFat}%` : '—'}
          helperText="trainer check-in"
          icon={Activity}
        />
        <StatCard
          label="Attendance Consistency"
          value={`${member.monthlyAttendance || 0} visits`}
          helperText="this month"
          icon={CalendarCheck}
        />
      </div>

      {/* Charts */}
      <MemberProgressCharts progressHistory={member.progressHistory || []} />

      {/* Optional Before & After Progress Gallery */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Before & After Photo Gallery (Optional)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual training milestone snapshots shared with the member&apos;s coach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <img
              src={MEMBER_MEDIA.progressBefore}
              alt="Baseline studio orientation snapshot"
              referrerPolicy="no-referrer"
              className="h-56 w-full object-cover"
            />
            <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900">Onboarding Baseline</span>
              <span className="font-mono text-slate-500">Month 1</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <img
              src={MEMBER_MEDIA.progressAfter}
              alt="Current training milestone snapshot"
              referrerPolicy="no-referrer"
              className="h-56 w-full object-cover"
            />
            <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900">Latest Training Milestone</span>
              <span className="font-mono text-emerald-700 font-semibold">Current Cycle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Progress Measurement Modal */}
      <Modal
        isOpen={logOpen}
        onClose={() => setLogOpen(false)}
        title="Log Optional Progress Measurement"
        description="Record updated weight or circumference metrics (non-medical)."
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setLogOpen(false)}>Cancel</Button>
            <Button variant="emerald" size="sm" onClick={handleSaveEntry}>Save Measurement</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Month / Label" value={monthLabel} onChange={(e) => setMonthLabel(e.target.value)} />
          <Input label="Weight (kg)" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <Input label="Body Fat % (Optional)" type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
          <Input label="Chest (cm)" type="number" step="0.1" value={chest} onChange={(e) => setChest(e.target.value)} />
          <Input label="Waist (cm)" type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} />
          <Input label="Hip (cm)" type="number" step="0.1" value={hip} onChange={(e) => setHip(e.target.value)} />
          <Input label="Arm (cm)" type="number" step="0.1" value={arm} onChange={(e) => setArm(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}

export default MemberProgressPage;
