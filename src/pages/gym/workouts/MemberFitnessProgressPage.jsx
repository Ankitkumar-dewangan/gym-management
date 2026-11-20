import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Dumbbell,
  History,
  LineChart as ChartIcon,
  Plus,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function MemberFitnessProgressPage() {
  const { fitnessProfiles, updateFitnessProfile } = useWorkoutDiet();

  const [selectedMemberId, setSelectedMemberId] = useState(
    fitnessProfiles[0]?.memberId || 'MEM-4094'
  );
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const currentProfile = useMemo(() => {
    return (
      fitnessProfiles.find((p) => p.memberId === selectedMemberId) ||
      fitnessProfiles[0] ||
      null
    );
  }, [fitnessProfiles, selectedMemberId]);

  // Measurement Modal Form
  const [measurementForm, setMeasurementForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: currentProfile?.weight || 75,
    height: currentProfile?.height || 175,
    bodyFat: currentProfile?.bodyFat || 20,
    muscleMass: currentProfile?.muscleMass || 32,
    chest: currentProfile?.chest || 39,
    waist: currentProfile?.waist || 33,
    hips: currentProfile?.hips || 38,
    biceps: currentProfile?.biceps || 14,
    thighs: currentProfile?.thighs || 22,
    calves: currentProfile?.calves || 15,
    trainerRemarks: '',
  });

  const openLogModal = () => {
    if (currentProfile) {
      setMeasurementForm({
        date: new Date().toISOString().split('T')[0],
        weight: currentProfile.weight,
        height: currentProfile.height,
        bodyFat: currentProfile.bodyFat,
        muscleMass: currentProfile.muscleMass,
        chest: currentProfile.chest,
        waist: currentProfile.waist,
        hips: currentProfile.hips,
        biceps: currentProfile.biceps,
        thighs: currentProfile.thighs,
        calves: currentProfile.calves,
        trainerRemarks: currentProfile.trainerRemarks || '',
      });
    }
    setIsLogModalOpen(true);
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!currentProfile) return;
    updateFitnessProfile(currentProfile.memberId, measurementForm);
    setIsLogModalOpen(false);
  };

  // BMI helper
  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-600 bg-amber-50' };
    if (bmi < 24.9) return { label: 'Normal / Healthy', color: 'text-emerald-600 bg-emerald-50' };
    if (bmi < 29.9) return { label: 'Overweight', color: 'text-amber-700 bg-amber-100' };
    return { label: 'Obese', color: 'text-rose-700 bg-rose-100' };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Fitness Profile & Body Composition"
        description="Monitor physical biometric changes, weight tracking, anthropometric circumference logs, and milestone photos."
        actions={
          <Button onClick={openLogModal} leftIcon={Plus}>
            Log New Measurement
          </Button>
        }
      />

      {/* Member Selector Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase">Select Member:</span>
          <div className="w-64">
            <Select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              options={fitnessProfiles.map((p) => ({
                value: p.memberId,
                label: `${p.memberName} (${p.memberId})`,
              }))}
            />
          </div>
        </div>

        {currentProfile && (
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Age: <strong>{currentProfile.age} yrs</strong></span>
            <span>Gender: <strong>{currentProfile.gender}</strong></span>
            <span>Height: <strong>{currentProfile.height} cm</strong></span>
            <span>Last Logged: <strong>{currentProfile.lastUpdated}</strong></span>
          </div>
        )}
      </div>

      {currentProfile && (
        <>
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Weight</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{currentProfile.weight} kg</p>
              <span className="text-[10px] text-slate-400">Target: {currentProfile.targetWeight} kg</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">BMI Index</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{currentProfile.bmi}</p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBmiCategory(currentProfile.bmi).color}`}>
                {getBmiCategory(currentProfile.bmi).label}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Body Fat %</span>
              <p className="text-xl font-bold text-primary-600 mt-1">{currentProfile.bodyFat}%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">-2.6% trend</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Muscle Mass</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{currentProfile.muscleMass} kg</p>
              <span className="text-[10px] text-emerald-600 font-semibold">+1.8 kg lean</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Waist Circumference</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{currentProfile.waist}"</p>
              <span className="text-[10px] text-slate-400">Inches</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Arms / Biceps</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{currentProfile.biceps}"</p>
              <span className="text-[10px] text-slate-400">Flexed</span>
            </div>
          </div>

          {/* Historical Weight & Measurements Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Weight & Circumference Milestone Timeline
                </h3>
                <p className="text-xs text-slate-400">Track body composition evolution over time</p>
              </div>
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
                Multi-Point History
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentProfile.history || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1E36',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    name="Weight (kg)"
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="waist"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Waist (in)"
                  />
                  <Line
                    type="monotone"
                    dataKey="biceps"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Biceps (in)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Anthropometric Body Measurements Table & Photo Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-800">
                  Detailed Body Circumference Measurements
                </h3>
                <Button size="sm" variant="outline" onClick={openLogModal} leftIcon={Plus}>
                  Add Log
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Chest / Bust</span>
                  <p className="text-base font-bold text-slate-800 mt-1">{currentProfile.chest} inches</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Waistline</span>
                  <p className="text-base font-bold text-slate-800 mt-1">{currentProfile.waist} inches</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Hips / Glutes</span>
                  <p className="text-base font-bold text-slate-800 mt-1">{currentProfile.hips} inches</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Arms / Biceps</span>
                  <p className="text-base font-bold text-slate-800 mt-1">{currentProfile.biceps} inches</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Thighs / Quads</span>
                  <p className="text-base font-bold text-slate-800 mt-1">{currentProfile.thighs} inches</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Calves</span>
                  <p className="text-base font-bold text-slate-800 mt-1">{currentProfile.calves} inches</p>
                </div>
              </div>

              {/* Trainer Remarks */}
              <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-200 mt-2 space-y-1">
                <p className="text-xs font-bold text-primary-900">Trainer Evaluation</p>
                <p className="text-xs text-primary-800 leading-relaxed">
                  {currentProfile.trainerRemarks || 'Progressing consistently on the designated split.'}
                </p>
              </div>
            </div>

            {/* Before / After Photo Comparison Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-primary-600" /> Transformation Comparison
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Month 1
                  </span>
                  <div className="h-44 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=80"
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-medium text-slate-600">84.0 kg · 26.5% BF</p>
                </div>

                <div className="space-y-1.5 text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Current
                  </span>
                  <div className="h-44 rounded-lg bg-slate-100 overflow-hidden border border-emerald-300">
                    <img
                      src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80"
                      alt="Current"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-emerald-700">78.4 kg · 22.4% BF</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => toast('Upload photo dialog')}
              >
                Upload Progress Photo
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modal: Log New Measurement */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log New Anthropometric Measurement"
        size="lg"
      >
        <form onSubmit={handleLogSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <Input
            label="Date of Measurement"
            type="date"
            value={measurementForm.date}
            onChange={(e) =>
              setMeasurementForm({ ...measurementForm, date: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              value={measurementForm.weight}
              onChange={(e) =>
                setMeasurementForm({ ...measurementForm, weight: e.target.value })
              }
              required
            />
            <Input
              label="Height (cm)"
              type="number"
              value={measurementForm.height}
              onChange={(e) =>
                setMeasurementForm({ ...measurementForm, height: e.target.value })
              }
              required
            />
            <Input
              label="Body Fat %"
              type="number"
              step="0.1"
              value={measurementForm.bodyFat}
              onChange={(e) =>
                setMeasurementForm({ ...measurementForm, bodyFat: e.target.value })
              }
            />
            <Input
              label="Muscle Mass (kg)"
              type="number"
              step="0.1"
              value={measurementForm.muscleMass}
              onChange={(e) =>
                setMeasurementForm({ ...measurementForm, muscleMass: e.target.value })
              }
            />
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Circumference Logs (Inches)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Input
                label="Chest"
                type="number"
                step="0.1"
                value={measurementForm.chest}
                onChange={(e) =>
                  setMeasurementForm({ ...measurementForm, chest: e.target.value })
                }
              />
              <Input
                label="Waist"
                type="number"
                step="0.1"
                value={measurementForm.waist}
                onChange={(e) =>
                  setMeasurementForm({ ...measurementForm, waist: e.target.value })
                }
              />
              <Input
                label="Hips"
                type="number"
                step="0.1"
                value={measurementForm.hips}
                onChange={(e) =>
                  setMeasurementForm({ ...measurementForm, hips: e.target.value })
                }
              />
              <Input
                label="Biceps"
                type="number"
                step="0.1"
                value={measurementForm.biceps}
                onChange={(e) =>
                  setMeasurementForm({ ...measurementForm, biceps: e.target.value })
                }
              />
              <Input
                label="Thighs"
                type="number"
                step="0.1"
                value={measurementForm.thighs}
                onChange={(e) =>
                  setMeasurementForm({ ...measurementForm, thighs: e.target.value })
                }
              />
              <Input
                label="Calves"
                type="number"
                step="0.1"
                value={measurementForm.calves}
                onChange={(e) =>
                  setMeasurementForm({ ...measurementForm, calves: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Trainer Remarks / Milestone Assessment
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:outline-hidden"
              value={measurementForm.trainerRemarks}
              onChange={(e) =>
                setMeasurementForm({ ...measurementForm, trainerRemarks: e.target.value })
              }
              placeholder="e.g. Great progress on waist reduction. Increasing protein for recovery."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Measurement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MemberFitnessProgressPage;
