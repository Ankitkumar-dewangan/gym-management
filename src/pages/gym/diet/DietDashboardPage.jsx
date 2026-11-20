import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Apple,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Eye,
  Flame,
  Layers,
  PieChart as PieChartIcon,
  Plus,
  TrendingUp,
  UserCheck,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function DietDashboardPage() {
  const navigate = useNavigate();
  const { dietPlans, dietAssignments, foodLibrary } = useWorkoutDiet();

  const totalPlans = dietPlans.length;
  const activePlans = dietPlans.filter((p) => p.status === 'Active').length;
  const totalAssigned = dietAssignments.filter((a) => a.status === 'Active').length;

  const avgCalories =
    dietPlans.length > 0
      ? Math.round(
          dietPlans.reduce((acc, p) => acc + (Number(p.targetCalories) || 0), 0) /
            dietPlans.length
        )
      : 2100;

  // Macro pie chart data (average distribution)
  const macroData = [
    { name: 'Protein (150g)', value: 30, color: '#2563EB' },
    { name: 'Carbs (220g)', value: 45, color: '#F59E0B' },
    { name: 'Healthy Fats (55g)', value: 25, color: '#10B981' },
  ];

  const popularDiets = useMemo(() => {
    return [...dietPlans]
      .sort((a, b) => (b.assignedMembersCount || 0) - (a.assignedMembersCount || 0))
      .slice(0, 4);
  }, [dietPlans]);

  const recentDietAssignments = dietAssignments.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diet & Nutrition Management Dashboard"
        description="Oversee member macronutrient plans, calorie deficit/surplus regimens, certified nutrition coaching, and food database items."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/gym/diet/foods">
              <Button variant="outline" size="sm" leftIcon={UtensilsCrossed}>
                Food Library
              </Button>
            </Link>
            <Link to="/gym/diet/assign">
              <Button variant="outline" size="sm" leftIcon={UserCheck}>
                Assign Diet
              </Button>
            </Link>
            <Link to="/gym/diet/create">
              <Button size="sm" leftIcon={Plus}>
                Create Diet Plan
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Total Diet Plans</p>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Apple className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{totalPlans}</h3>
            <span className="text-xs font-semibold text-emerald-600">{activePlans} Active</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Vegetarian & non-veg splits</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Enrolled Members</p>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{totalAssigned}</h3>
            <span className="text-xs text-slate-500">Active diets</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">92% average meal compliance</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Average Daily Calories</p>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{avgCalories}</h3>
            <span className="text-xs text-slate-500">kcal / day</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Calculated across all tiers</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Food Database Items</p>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <UtensilsCrossed className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{foodLibrary.length}</h3>
            <span className="text-xs text-slate-500">Ingredients</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Calorie & macro certified</p>
        </div>
      </div>

      {/* Navigation Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/gym/diet/plans"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Apple className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Diet Plans Catalog</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/gym/diet/foods"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Food & Macro Library</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/gym/diet/assign"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Assign Member Diets</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/gym/progress"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Body Metrics Tracking</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Main Charts & Popular Diets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macro Distribution Donut */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Macro Caloric Distribution</h3>
            <p className="text-xs text-slate-400">Standard macro ratio target for members</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  layout="horizontal"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Popular Diet Plans */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Top Enrolled Nutrition Plans
            </h3>
            <Link to="/gym/diet/plans" className="text-xs font-semibold text-primary-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularDiets.map((plan) => (
              <div
                key={plan.id}
                onClick={() => navigate(`/gym/diet/${plan.id}`)}
                className="p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-100 text-emerald-800">
                    {plan.dietType}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    🔥 {plan.targetCalories} kcal
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{plan.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{plan.description}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>P: {plan.protein}g · C: {plan.carbs}g · F: {plan.fats}g</span>
                  <span className="font-semibold text-primary-600">{plan.assignedMembersCount} Members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Diet Assignments Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Recent Member Diet Assignments</h3>
            <p className="text-xs text-slate-400">Nutritional regimens under active coaching</p>
          </div>
          <Link to="/gym/diet/assign">
            <Button size="sm" variant="outline">
              Assign Plan
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Diet Plan</th>
                <th className="py-3 px-4">Target Cal</th>
                <th className="py-3 px-4">Nutritionist</th>
                <th className="py-3 px-4">Allergies / Notes</th>
                <th className="py-3 px-4">Adherence</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentDietAssignments.map((row) => (
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
                  <td className="py-3 px-4 font-medium text-slate-800">{row.dietPlanName}</td>
                  <td className="py-3 px-4 font-bold text-slate-700">{row.targetCalories} kcal</td>
                  <td className="py-3 px-4 text-slate-600">{row.nutritionistName}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{row.allergies || 'None'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {row.adherenceRate}% Adherence
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to="/gym/progress"
                      className="text-xs font-semibold text-primary-600 hover:underline"
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

export default DietDashboardPage;
