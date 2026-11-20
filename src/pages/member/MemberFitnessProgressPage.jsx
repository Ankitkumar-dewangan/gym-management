import { useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Camera,
  CheckCircle2,
  Download,
  Eye,
  Plus,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { MEMBER_PROGRESS_RECORDS } from '../../constants/memberPortalData';

export function MemberFitnessProgressPage() {
  const [data, setData] = useState(MEMBER_PROGRESS_RECORDS);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '78.2',
    bodyFat: '16.3',
    chest: '40.4',
    waist: '31.8',
    arms: '15.3',
    notes: 'Morning weigh-in after workout.',
  });

  const metrics = data.currentMetrics;

  const handleSaveMeasurement = (e) => {
    e.preventDefault();
    const entry = {
      date: newLog.date,
      weight: parseFloat(newLog.weight),
      bodyFat: parseFloat(newLog.bodyFat),
      chest: `${newLog.chest}"`,
      waist: `${newLog.waist}"`,
      arms: `${newLog.arms}"`,
      notes: newLog.notes,
    };

    setData((prev) => ({
      ...prev,
      historyTable: [entry, ...prev.historyTable],
      currentMetrics: {
        ...prev.currentMetrics,
        weight: entry.weight,
        bodyFatPct: entry.bodyFat,
        weightChange: (entry.weight - prev.currentMetrics.startWeight).toFixed(1),
      },
    }));

    toast.success('Body measurements successfully recorded!');
    setShowLogModal(false);
  };

  const handleSimulatePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success('Progress transformation photo uploaded!');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Fitness & Body Composition Progress"
        description="Track weight loss, body fat reduction, tape measurements, and before-and-after transformation photos."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={Eye}
              onClick={() => setShowCompareModal(true)}
            >
              Photo Comparison
            </Button>
            <Button
              size="sm"
              leftIcon={Plus}
              onClick={() => setShowLogModal(true)}
            >
              Log New Check-in
            </Button>
          </div>
        }
      />

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          label="Current Weight"
          value={`${metrics.weight} kg`}
          helperText="Latest weigh-in"
          icon={Scale}
        />
        <StatCard
          label="Starting Weight"
          value={`${metrics.startWeight} kg`}
          helperText="Baseline (Jun 2026)"
          icon={Activity}
        />
        <StatCard
          label="Weight Change"
          value={`${metrics.weightChange} kg`}
          helperText="Total lean loss"
          icon={TrendingDown}
        />
        <StatCard
          label="Current BMI"
          value={metrics.bmi}
          helperText="Normal / Healthy range"
          icon={Sparkles}
        />
        <StatCard
          label="Body Fat %"
          value={`${metrics.bodyFatPct}%`}
          helperText={`Down from ${metrics.startBodyFatPct}%`}
          icon={TrendingDown}
        />
        <StatCard
          label="Plan Adherence"
          value={`${metrics.adherencePct}%`}
          helperText="Nutrition & training"
          icon={CheckCircle2}
        />
      </div>

      {/* Visual Recharts: Weight & Body Fat Trend */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Body Weight & Body Fat % Progression</h3>
            <p className="text-xs text-slate-400">6-Month periodized tracking</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Weight (kg)
            </span>
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Body Fat (%)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trendChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" domain={[70, 88]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[10, 25]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Weight (kg)" />
              <Line yAxisId="right" type="monotone" dataKey="bodyFat" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Body Fat (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Body Measurements Comparison Grid */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800">Body Circumference Measurements</h3>
          <span className="text-xs text-slate-400">Baseline vs Current</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {data.bodyMeasurements.map((m, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">{m.label}</span>
              <p className="text-base font-extrabold text-slate-900">{m.current}</p>
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200/50">
                <span>Start: {m.start}</span>
                <strong className={m.change.startsWith('-') ? 'text-emerald-600' : 'text-blue-600'}>
                  {m.change}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before / After Photo Gallery */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Visual Transformation Gallery</h3>
            <p className="text-xs text-slate-400">Private photographic records to track physical changes.</p>
          </div>

          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            <Camera className="w-3.5 h-3.5 text-primary-600" />
            <span>Add Progress Photo</span>
            <input type="file" accept="image/*" onChange={handleSimulatePhotoUpload} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.transformationPhotos.map((photo) => (
            <div key={photo.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-sm">
              <div className="relative h-64 sm:h-72 w-full">
                <img
                  src={photo.image}
                  alt={photo.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] uppercase font-bold text-primary-400">{photo.date}</span>
                  <h4 className="font-bold text-base text-white">{photo.label}</h4>
                  <p className="text-xs text-slate-300">
                    Weight: {photo.weight} · Body Fat: {photo.bodyFat}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Measurement History Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-800">Historical Measurement Logs</h3>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-4">Weight (kg)</th>
                <th className="py-3 px-4">Body Fat %</th>
                <th className="py-3 px-4">Chest</th>
                <th className="py-3 px-4">Waist</th>
                <th className="py-3 px-4">Arms</th>
                <th className="py-3 px-5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.historyTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-5 font-bold font-mono text-slate-800">{row.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.weight} kg</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{row.bodyFat}%</td>
                  <td className="py-3 px-4">{row.chest}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">{row.waist}</td>
                  <td className="py-3 px-4">{row.arms}</td>
                  <td className="py-3 px-5 text-slate-500">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Measurement Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Record New Fitness Check-in"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveMeasurement} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Check-in Date"
              type="date"
              required
              value={newLog.date}
              onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
            />
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              required
              value={newLog.weight}
              onChange={(e) => setNewLog({ ...newLog, weight: e.target.value })}
            />
            <Input
              label="Body Fat %"
              type="number"
              step="0.1"
              value={newLog.bodyFat}
              onChange={(e) => setNewLog({ ...newLog, bodyFat: e.target.value })}
            />
            <Input
              label="Waist (inches)"
              value={newLog.waist}
              onChange={(e) => setNewLog({ ...newLog, waist: e.target.value })}
            />
            <Input
              label="Chest (inches)"
              value={newLog.chest}
              onChange={(e) => setNewLog({ ...newLog, chest: e.target.value })}
            />
            <Input
              label="Arms (inches)"
              value={newLog.arms}
              onChange={(e) => setNewLog({ ...newLog, arms: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Notes
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              value={newLog.notes}
              onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowLogModal(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Side-by-side Photo Comparison Modal */}
      <Modal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        title="Side-by-Side Physique Transformation"
        maxWidth="max-w-2xl"
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {data.transformationPhotos.map((p) => (
              <div key={p.id} className="space-y-2 text-center">
                <div className="h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  <img src={p.image} alt={p.label} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-xs text-slate-800">{p.label}</h4>
                <p className="text-[11px] text-slate-500">{p.date} · {p.weight}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setShowCompareModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MemberFitnessProgressPage;
