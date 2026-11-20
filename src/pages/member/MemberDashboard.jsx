import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Award,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Dumbbell,
  Flame,
  IdCard,
  Play,
  QrCode,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
  Utensils,
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
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import {
  MEMBER_ATTENDANCE_LOGS,
  MEMBER_DASHBOARD_KPIS,
  MEMBER_DIET_PLAN_DATA,
  MEMBER_MONTHLY_ATTENDANCE_CHART,
  MEMBER_PLANS_DATA,
  MEMBER_PROFILE_DATA,
  MEMBER_PROGRESS_RECORDS,
  MEMBER_WORKOUT_PLAN,
} from '../../constants/memberPortalData';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants/roles';

export function MemberDashboard() {
  const { user } = useAuth();
  const [showQrModal, setShowQrModal] = useState(false);
  const [completedExercises, setCompletedExercises] = useState(['ex-1']);

  const member = {
    ...MEMBER_PROFILE_DATA,
    name: user?.role === ROLES.MEMBER && user?.name ? user.name : MEMBER_PROFILE_DATA.name,
    email: user?.role === ROLES.MEMBER && user?.email ? user.email : MEMBER_PROFILE_DATA.email,
  };

  const todayWorkout = MEMBER_WORKOUT_PLAN.days[0];
  const nextMeal = MEMBER_DIET_PLAN_DATA.meals[2]; // Lunch

  const toggleExercise = (id) => {
    setCompletedExercises((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    toast.success('Exercise status updated!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={member.avatar}
              alt={member.name}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-primary-400 shadow-md shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {member.membershipStatus} Member
                </span>
                <span className="text-xs font-mono text-primary-300 bg-white/10 px-2 py-0.5 rounded">
                  {member.memberId}
                </span>
                <span className="text-xs text-slate-300">
                  📍 {member.branch}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Welcome back, {member.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Plan: <strong className="text-white">{member.planName}</strong> · Renews on {member.expiryDate} ({member.daysRemaining} days left)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={QrCode}
              onClick={() => setShowQrModal(true)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Check-in QR
            </Button>
            <Link to="/member/workouts">
              <Button size="sm" leftIcon={Dumbbell}>
                Start Workout
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          label="Days Remaining"
          value={`${MEMBER_DASHBOARD_KPIS.daysRemaining} Days`}
          helperText={MEMBER_DASHBOARD_KPIS.expiryDateText}
          icon={Calendar}
        />
        <StatCard
          label="Total Attendance"
          value={`${MEMBER_DASHBOARD_KPIS.totalAttendance} Visits`}
          helperText={MEMBER_DASHBOARD_KPIS.totalAttendanceSubtext}
          icon={CalendarCheck}
        />
        <StatCard
          label="This Month"
          value={`${MEMBER_DASHBOARD_KPIS.monthAttendance} Visits`}
          helperText={MEMBER_DASHBOARD_KPIS.monthAttendanceTarget}
          icon={Flame}
        />
        <StatCard
          label="Workout Completion"
          value={`${MEMBER_DASHBOARD_KPIS.workoutCompletionRate}%`}
          helperText={MEMBER_DASHBOARD_KPIS.workoutCompletionSubtext}
          icon={Dumbbell}
        />
        <StatCard
          label="Pending Fees"
          value={`₹${MEMBER_DASHBOARD_KPIS.pendingFees}`}
          helperText={MEMBER_DASHBOARD_KPIS.pendingFeesSubtext}
          icon={CreditCard}
        />
        <StatCard
          label="Current Weight"
          value={`${MEMBER_DASHBOARD_KPIS.currentWeight} kg`}
          helperText={MEMBER_DASHBOARD_KPIS.currentWeightSubtext}
          icon={Activity}
        />
      </div>

      {/* Two Column Layout: Workout & Diet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section B: Today's Workout */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                Today's Training Split
              </span>
              <h2 className="text-base font-bold text-slate-800 mt-1">
                {todayWorkout.dayTitle}
              </h2>
            </div>
            <Link
              to="/member/workouts"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Full Routine <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {todayWorkout.exercises.slice(0, 3).map((ex) => {
              const isDone = completedExercises.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExercise(ex.id)}
                      className={`h-5 w-5 rounded flex items-center justify-center border transition-colors ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-primary-500'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-semibold ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {ex.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {ex.sets} Sets × {ex.reps} · Rest {ex.rest}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {ex.muscle}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
            <span>Coach: <strong className="text-slate-700">{MEMBER_WORKOUT_PLAN.trainerName}</strong></span>
            <Link to="/member/workouts">
              <Button size="sm" variant="outline" leftIcon={Play}>
                Start Routine Mode
              </Button>
            </Link>
          </div>
        </div>

        {/* Section C: Today's Diet Plan */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Daily Nutrition Targets
              </span>
              <h2 className="text-base font-bold text-slate-800 mt-1">
                {MEMBER_DIET_PLAN_DATA.dailyTargets.calories} kcal Goal
              </h2>
            </div>
            <Link
              to="/member/diet"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Meal Schedule <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Macro Bars */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
              <span className="text-[10px] text-blue-600 font-bold uppercase">Protein</span>
              <p className="font-extrabold text-blue-900 mt-0.5">{MEMBER_DIET_PLAN_DATA.dailyTargets.proteinGrams}g</p>
              <div className="mt-1 h-1.5 w-full bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-4/5" />
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100">
              <span className="text-[10px] text-amber-600 font-bold uppercase">Carbs</span>
              <p className="font-extrabold text-amber-900 mt-0.5">{MEMBER_DIET_PLAN_DATA.dailyTargets.carbsGrams}g</p>
              <div className="mt-1 h-1.5 w-full bg-amber-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full w-3/4" />
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] text-emerald-600 font-bold uppercase">Fats</span>
              <p className="font-extrabold text-emerald-900 mt-0.5">{MEMBER_DIET_PLAN_DATA.dailyTargets.fatsGrams}g</p>
              <div className="mt-1 h-1.5 w-full bg-emerald-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-2/3" />
              </div>
            </div>
          </div>

          {/* Next Prescribed Meal Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-primary-600" /> Next Meal · {nextMeal.mealName}
              </span>
              <span className="text-slate-500 font-medium">{nextMeal.time}</span>
            </div>
            <p className="text-xs text-slate-600">
              {nextMeal.items.map((i) => i.name).join(', ')}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>Target: 🔥 {nextMeal.targetKcal} kcal</span>
              <span className="text-emerald-700 font-medium">Nutritionist: {MEMBER_DIET_PLAN_DATA.nutritionist}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Attendance & Fitness Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section D: Attendance Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Attendance Overview</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                14 visits recorded in November · 🔥 5-day active streak
              </p>
            </div>
            <Link
              to="/member/attendance"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Full Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MEMBER_MONTHLY_ATTENDANCE_CHART} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} domain={[0, 6]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="days" fill="#0284c7" radius={[4, 4, 0, 0]} name="Attended Days" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Last check-in: <strong>Today, 07:15 AM (Downtown Arena)</strong></span>
            <span className="text-emerald-600 font-semibold">82% Month Target</span>
          </div>
        </div>

        {/* Section E: Fitness Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Body Weight Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current: 78.5 kg · Down from 84.0 kg baseline (-5.5 kg)
              </p>
            </div>
            <Link
              to="/member/progress"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Measurements <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MEMBER_PROGRESS_RECORDS.trendChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis domain={[75, 86]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val} kg`, 'Weight']}
                />
                <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#weightGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Body Fat: <strong>16.5%</strong> (Started at 22%)</span>
            <span>BMI: <strong className="text-slate-800">23.8 (Normal)</strong></span>
          </div>
        </div>
      </div>

      {/* Section A & F: Membership Quick Card & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membership Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary-600" /> Active Membership
          </h3>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tier</span>
              <span className="text-xs font-bold text-slate-800">{MEMBER_PLANS_DATA.currentPlan.tier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Annual Fee</span>
              <span className="text-xs font-bold text-slate-800 font-mono">
                ₹{MEMBER_PLANS_DATA.currentPlan.price.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Validity</span>
              <span className="text-xs text-slate-700 font-medium">Until 14 Jan 2027</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-slate-500">Days Left</span>
              <span className="text-xs font-extrabold text-emerald-600">55 Days</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/member/membership" className="flex-1">
              <Button fullWidth size="sm" variant="outline">
                Manage Plan
              </Button>
            </Link>
            <Link to="/member/payments" className="flex-1">
              <Button fullWidth size="sm" variant="outline">
                Invoices
              </Button>
            </Link>
          </div>
        </div>

        {/* Section F: Recent Activities Timeline */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" /> Recent Activities
            </h3>
            <span className="text-xs text-slate-400">Past 7 Days</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-xs">
              <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">Checked into Downtown Arena</p>
                <p className="text-slate-400 text-[11px]">Today at 07:15 AM · QR Kiosk Scan</p>
              </div>
              <span className="text-[11px] font-medium text-emerald-600">Present</span>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">Completed Chest & Triceps Routine</p>
                <p className="text-slate-400 text-[11px]">Yesterday at 08:30 AM · 4 movements marked done</p>
              </div>
              <span className="text-[11px] text-slate-500">1h 25m</span>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">Recorded Weight Check-in: 78.5 kg</p>
                <p className="text-slate-400 text-[11px]">15 Nov 2026 · Body Fat 16.5%</p>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">-0.6 kg</span>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">Payment Confirmed for INV-2026-9021</p>
                <p className="text-slate-400 text-[11px]">Annual Elite Plan · UPI Auto-Debit</p>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-800">₹18,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="Digital Check-in Pass"
        maxWidth="max-w-md"
      >
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto w-48 h-48 bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col items-center justify-center p-3">
            <QrCode className="w-36 h-36 text-slate-900" />
            <span className="font-mono text-xs font-bold text-slate-700 mt-2">
              {member.memberId}
            </span>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-base">{member.name}</h4>
            <p className="text-xs text-slate-500">{member.planName} · {member.branch}</p>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Hold this QR pass in front of the optical reader at the gym entrance turnstile to register your attendance.
          </p>

          <div className="pt-2 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success('Check-in pass downloaded!');
                setShowQrModal(false);
              }}
            >
              Download Pass
            </Button>
            <Button
              size="sm"
              onClick={() => setShowQrModal(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MemberDashboard;
