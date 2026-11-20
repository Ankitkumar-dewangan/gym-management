import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  LineChart,
  Search,
  TrendingUp,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function WorkoutProgressPage() {
  const { workoutAssignments, scheduleSessions, fitnessProfiles } = useWorkoutDiet();

  const [searchMember, setSearchMember] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(workoutAssignments[0] || null);

  const totalAssigned = workoutAssignments.length;
  const completedSessions = scheduleSessions.filter((s) => s.status === 'completed').length;
  const missedSessions = scheduleSessions.filter((s) => s.status === 'missed').length;
  const totalSessionsLogged = scheduleSessions.length;
  const overallCompletionRate =
    totalSessionsLogged > 0 ? Math.round((completedSessions / totalSessionsLogged) * 100) : 82;

  // Monthly Chart Data
  const monthlyProgressData = [
    { month: 'Jun', completed: 140, target: 160 },
    { month: 'Jul', completed: 185, target: 190 },
    { month: 'Aug', completed: 210, target: 220 },
    { month: 'Sep', completed: 260, target: 270 },
    { month: 'Oct', completed: 310, target: 330 },
    { month: 'Nov', completed: 345, target: 360 },
  ];

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return workoutAssignments.filter(
      (a) =>
        a.memberName.toLowerCase().includes(searchMember.toLowerCase()) ||
        a.memberId.toLowerCase().includes(searchMember.toLowerCase()) ||
        a.workoutPlanName.toLowerCase().includes(searchMember.toLowerCase())
    );
  }, [workoutAssignments, searchMember]);

  // Selected member profile
  const activeProfile = useMemo(() => {
    if (!selectedAssignment) return null;
    return fitnessProfiles.find((p) => p.memberId === selectedAssignment.memberId);
  }, [fitnessProfiles, selectedAssignment]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Progress & Adherence Analytics"
        description="Analyze gym-wide training consistency, session completion rates, and individual member routine progress."
        actions={
          <Link to="/gym/progress">
            <Button leftIcon={Activity}>
              Body Measurements & Fitness Profiles
            </Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Active Workout Enrollments</p>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{totalAssigned}</h3>
          <p className="text-xs text-slate-400 mt-1">Under trainer supervision</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Completed Sessions</p>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">{completedSessions}</h3>
          <p className="text-xs text-slate-400 mt-1">Logged by members</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Missed Sessions</p>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-rose-600 mt-2">{missedSessions}</h3>
          <p className="text-xs text-slate-400 mt-1">Eligible for follow-up</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Average Adherence Rate</p>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{overallCompletionRate}%</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">+4.2% vs last month</p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Monthly Workout Completion Trends</h3>
            <p className="text-xs text-slate-400">Total sessions executed across all branches</p>
          </div>
          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
            Last 6 Months
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyProgressData}>
              <defs>
                <linearGradient id="workoutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1E36',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#workoutGrad)"
                name="Completed Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Split: Member List & Member Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Member List */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">Member Progress Directory</h3>
          <Input
            placeholder="Search member or plan..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            leftIcon={Search}
          />

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
            {filteredAssignments.map((assignment) => {
              const isSelected = selectedAssignment?.id === assignment.id;
              const percent = Math.round(
                (assignment.completedSessions / assignment.totalSessions) * 100
              );

              return (
                <div
                  key={assignment.id}
                  onClick={() => setSelectedAssignment(assignment)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-primary-50 border border-primary-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={assignment.memberPhoto}
                      alt={assignment.memberName}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {assignment.memberName}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {assignment.workoutPlanName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-primary-600">{percent}%</span>
                    <p className="text-[10px] text-slate-400">
                      {assignment.completedSessions}/{assignment.totalSessions}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Member Detailed Progress View */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
          {selectedAssignment ? (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedAssignment.memberPhoto}
                    alt={selectedAssignment.memberName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      {selectedAssignment.memberName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      ID: {selectedAssignment.memberId} · Trainer: {selectedAssignment.trainerName}
                    </p>
                  </div>
                </div>

                <Link to="/gym/progress">
                  <Button size="sm" variant="outline" leftIcon={Activity}>
                    Body Metrics History
                  </Button>
                </Link>
              </div>

              {/* Workout Plan Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Plan</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedAssignment.workoutPlanName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Start Date</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedAssignment.startDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Schedule</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedAssignment.weeklySchedule}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Completed</span>
                  <p className="font-bold text-emerald-600 mt-0.5">
                    {selectedAssignment.completedSessions} / {selectedAssignment.totalSessions} Sessions
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-600">Plan Adherence & Completion</span>
                  <strong className="text-primary-600">
                    {Math.round(
                      (selectedAssignment.completedSessions / selectedAssignment.totalSessions) * 100
                    )}%
                  </strong>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full"
                    style={{
                      width: `${Math.round(
                        (selectedAssignment.completedSessions / selectedAssignment.totalSessions) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Trainer Remarks */}
              <div className="p-4 rounded-xl border border-slate-200 bg-amber-50/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Award className="w-4 h-4 text-amber-600" /> Trainer Feedback & Coaching Remarks
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {selectedAssignment.notes ||
                    'Consistent attendance. Form on bench press has improved significantly.'}
                </p>
              </div>

              {/* Body stats snippet if available */}
              {activeProfile && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Recent Anthropometric Measurements
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Weight</span>
                      <strong>{activeProfile.weight} kg</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">BMI</span>
                      <strong>{activeProfile.bmi}</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Body Fat</span>
                      <strong>{activeProfile.bodyFat}%</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Chest</span>
                      <strong>{activeProfile.chest}"</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Waist</span>
                      <strong>{activeProfile.waist}"</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Biceps</span>
                      <strong>{activeProfile.biceps}"</strong>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={User}
              title="Select a member"
              description="Choose a member from the directory on the left to inspect detailed workout adherence."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkoutProgressPage;
