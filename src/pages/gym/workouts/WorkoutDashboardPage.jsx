import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Eye,
  Flame,
  Layers,
  Plus,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function WorkoutDashboardPage() {
  const navigate = useNavigate();
  const { workoutPlans, workoutAssignments, scheduleSessions, exercises } = useWorkoutDiet();

  const totalPlans = workoutPlans.length;
  const activePlans = workoutPlans.filter((p) => p.status === 'Active').length;
  const assignedMembers = workoutAssignments.filter((a) => a.status === 'Active').length;
  const completedSessions = scheduleSessions.filter((s) => s.status === 'completed').length;
  const missedSessions = scheduleSessions.filter((s) => s.status === 'missed').length;
  const pendingSessions = scheduleSessions.filter((s) => s.status === 'scheduled').length;

  const completionRate =
    scheduleSessions.length > 0
      ? Math.round((completedSessions / scheduleSessions.length) * 100)
      : 84;

  // Chart data for weekly activity
  const weeklyActivityData = [
    { day: 'Mon', completed: 28, scheduled: 32 },
    { day: 'Tue', completed: 34, scheduled: 36 },
    { day: 'Wed', completed: 26, scheduled: 30 },
    { day: 'Thu', completed: 38, scheduled: 42 },
    { day: 'Fri', completed: 30, scheduled: 35 },
    { day: 'Sat', completed: 44, scheduled: 48 },
    { day: 'Sun', completed: 18, scheduled: 20 },
  ];

  // Most popular workout plans
  const popularPlans = useMemo(() => {
    return [...workoutPlans]
      .sort((a, b) => (b.assignedMembersCount || 0) - (a.assignedMembersCount || 0))
      .slice(0, 4);
  }, [workoutPlans]);

  // Recent assignments
  const recentAssignments = workoutAssignments.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Management Dashboard"
        description="Monitor member workout regimens, plan adherence rates, exercise assignments, and weekly training volume."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/gym/workouts/exercises">
              <Button variant="outline" size="sm" leftIcon={Dumbbell}>
                Exercise Library
              </Button>
            </Link>
            <Link to="/gym/workouts/assign">
              <Button variant="outline" size="sm" leftIcon={UserCheck}>
                Assign Workout
              </Button>
            </Link>
            <Link to="/gym/workouts/create">
              <Button size="sm" leftIcon={Plus}>
                Create Workout Plan
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Total Workout Plans</p>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{totalPlans}</h3>
            <span className="text-xs font-semibold text-emerald-600">{activePlans} Active</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Across 8 fitness goals</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Assigned Members</p>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{assignedMembers}</h3>
            <span className="text-xs text-slate-500">Active enrollments</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">+6 members assigned this week</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Completion Rate</p>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{completionRate}%</h3>
            <span className="text-xs font-medium text-emerald-600">Above target</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{completedSessions} sessions logged</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Exercise Library</p>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Dumbbell className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{exercises.length}</h3>
            <span className="text-xs text-slate-500">Techniques</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">9 muscle categories</p>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/gym/workouts/plans"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Browse All Plans</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/gym/workouts/exercises"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Exercise Directory</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/gym/workouts/schedule"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Schedule & Calendar</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/gym/workouts/progress"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Progress Tracking</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Main Charts & Popular Plans Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Weekly Workout Activity</h3>
              <p className="text-xs text-slate-400">Scheduled vs Completed training sessions</p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              Current Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1E36',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="scheduled" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Scheduled" />
                <Bar dataKey="completed" fill="#2563EB" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Popular Plans */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Most Popular Plans
            </h3>
            <Link to="/gym/workouts/plans" className="text-xs font-semibold text-primary-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {popularPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => navigate(`/gym/workouts/${plan.id}`)}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <img
                  src={plan.coverImage}
                  alt={plan.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-800 truncate">{plan.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-500">{plan.duration}</span>
                    <span className="text-[11px] text-slate-300">•</span>
                    <span className="text-[11px] text-primary-600 font-medium">
                      {plan.assignedMembersCount} Members
                    </span>
                  </div>
                </div>
                <Eye className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Workout Assignments Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Recent Workout Assignments</h3>
            <p className="text-xs text-slate-400">Latest active member training enrollments</p>
          </div>
          <Link to="/gym/workouts/assign">
            <Button size="sm" variant="outline">
              Manage Assignments
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Workout Plan</th>
                <th className="py-3 px-4">Trainer</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAssignments.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={row.memberPhoto}
                        alt={row.memberName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">{row.memberName}</p>
                        <p className="text-[11px] text-slate-400">{row.memberId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{row.workoutPlanName}</td>
                  <td className="py-3 px-4 text-slate-600">{row.trainerName}</td>
                  <td className="py-3 px-4 text-slate-500">{row.weeklySchedule}</td>
                  <td className="py-3 px-4">
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{row.completedSessions}/{row.totalSessions} Sessions</span>
                        <span>{Math.round((row.completedSessions / row.totalSessions) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{
                            width: `${Math.round((row.completedSessions / row.totalSessions) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to="/gym/progress"
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WorkoutDashboardPage;
