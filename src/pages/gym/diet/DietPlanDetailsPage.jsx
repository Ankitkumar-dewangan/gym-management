import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Apple,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  Eye,
  Flame,
  PieChart as PieIcon,
  Plus,
  Trash2,
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
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function DietPlanDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dietPlans, dietAssignments, duplicateDietPlan, deleteDietPlan } = useWorkoutDiet();

  const plan = dietPlans.find((p) => p.id === id);

  const assignedMembers = useMemo(() => {
    return dietAssignments.filter((a) => a.dietPlanId === id);
  }, [dietAssignments, id]);

  if (!plan) {
    return (
      <div className="space-y-6">
        <PageHeader title="Diet Plan Not Found" />
        <EmptyState
          icon={Apple}
          title="Plan Not Found"
          description="The requested diet plan does not exist or has been deleted."
          action={
            <Link to="/gym/diet/plans">
              <Button leftIcon={ArrowLeft}>Back to Plans</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      deleteDietPlan(plan.id);
      navigate('/gym/diet/plans');
    }
  };

  const handleDuplicate = () => {
    duplicateDietPlan(plan.id);
    navigate('/gym/diet/plans');
  };

  // Macro pie chart data
  const macroBreakdownData = [
    { name: `Protein (${plan.protein}g)`, value: plan.protein * 4, color: '#2563EB' },
    { name: `Carbs (${plan.carbs}g)`, value: plan.carbs * 4, color: '#F59E0B' },
    { name: `Fats (${plan.fats}g)`, value: plan.fats * 9, color: '#10B981' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={plan.name}
        description={`Designed by ${plan.createdBy || 'Priya Patel'} · ${plan.dietType} · ${plan.duration}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/gym/diet/assign?planId=${plan.id}`}>
              <Button size="sm" leftIcon={UserCheck}>
                Assign to Members
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/gym/diet/${plan.id}/edit`)}
              leftIcon={Edit}
            >
              Edit Plan
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDuplicate}
              leftIcon={Copy}
            >
              Duplicate
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="text-rose-600 hover:text-rose-700"
              leftIcon={Trash2}
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* Top Banner Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              {plan.dietType}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
              {plan.goal}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {plan.duration}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Target: {plan.targetCalories} kcal / day</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{plan.description}</p>

        {/* Macro KPI Split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
            <span className="text-xs font-bold text-blue-700 uppercase">Protein Target</span>
            <p className="text-2xl font-bold text-blue-950 mt-1">{plan.protein}g</p>
            <span className="text-[11px] text-blue-600">{plan.protein * 4} kcal (approx)</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
            <span className="text-xs font-bold text-amber-700 uppercase">Carbohydrates</span>
            <p className="text-2xl font-bold text-amber-950 mt-1">{plan.carbs}g</p>
            <span className="text-[11px] text-amber-600">{plan.carbs * 4} kcal (approx)</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
            <span className="text-xs font-bold text-emerald-700 uppercase">Healthy Fats</span>
            <p className="text-2xl font-bold text-emerald-950 mt-1">{plan.fats}g</p>
            <span className="text-[11px] text-emerald-600">{plan.fats * 9} kcal (approx)</span>
          </div>
        </div>
      </div>

      {/* Split: Meal Schedule & Macro Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Meal Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" /> Daily Meal Schedule
          </h2>

          <div className="space-y-3">
            {(plan.meals || []).map((meal, mealIdx) => (
              <div
                key={meal.id || mealIdx}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
              >
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {mealIdx + 1}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">{meal.mealName}</h4>
                  </div>
                  <span className="text-[11px] text-slate-400">{meal.items?.length || 0} Foods</span>
                </div>

                <div className="p-4 divide-y divide-slate-100 text-xs">
                  {(meal.items || []).map((item, itemIdx) => (
                    <div key={itemIdx} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-[11px] text-slate-400">Portion: {item.quantity}</p>
                      </div>

                      <div className="text-right">
                        <strong className="text-slate-800 font-mono">🔥 {item.calories} kcal</strong>
                        <p className="text-[10px] text-slate-400">
                          P: {item.protein}g · C: {item.carbs}g · F: {item.fats}g
                        </p>
                      </div>
                    </div>
                  ))}
                  {meal.notes && (
                    <div className="pt-2 text-[11px] text-slate-500 italic">
                      💡 {meal.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Macro Donut Chart & Details */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-3">
              Caloric Ratio Chart
            </h3>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {macroBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assigned Members */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase">Enrolled Members</h4>
              <span className="text-xs text-primary-600 font-bold">
                {assignedMembers.length} Active
              </span>
            </div>

            {assignedMembers.length === 0 ? (
              <p className="text-xs text-slate-400">No members assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {assignedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={m.memberPhoto}
                        alt={m.memberName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-800">{m.memberName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {m.adherenceRate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DietPlanDetailsPage;
