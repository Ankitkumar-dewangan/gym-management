import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Apple,
  Clock,
  Copy,
  Edit,
  Eye,
  Filter,
  Flame,
  Grid,
  List,
  Plus,
  Search,
  Trash2,
  Users,
  Utensils,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import {
  DIET_GOALS,
  DIET_TYPES,
} from '../../../constants/workoutDietData';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function DietPlansPage() {
  const navigate = useNavigate();
  const { dietPlans, duplicateDietPlan, deleteDietPlan } = useWorkoutDiet();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [goalFilter, setGoalFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const filteredPlans = useMemo(() => {
    return dietPlans.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.createdBy?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'all' || p.dietType === typeFilter;
      const matchGoal = goalFilter === 'all' || p.goal === goalFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchType && matchGoal && matchStatus;
    });
  }, [dietPlans, searchQuery, typeFilter, goalFilter, statusFilter]);

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete diet plan "${name}"?`)) {
      deleteDietPlan(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diet & Meal Plans Catalog"
        description="Prescribe targeted nutritional regimens, calculate daily calorie deficits/surpluses, and customize meal breakdowns."
        actions={
          <Link to="/gym/diet/create">
            <Button leftIcon={Plus}>
              Create Diet Plan
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search plan, goal, or nutritionist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Diet Types' },
              ...DIET_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />

          <Select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Fitness Goals' },
              ...DIET_GOALS.map((g) => ({ value: g, label: g })),
            ]}
          />

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Draft', label: 'Draft' },
                ]}
              />
            </div>
            {/* View Mode Toggle */}
            <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-primary-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list' ? 'bg-white shadow-2xs text-primary-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid or List */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          icon={Apple}
          title="No diet plans found"
          description="Try modifying search keywords or create a new meal plan."
          action={
            <Link to="/gym/diet/create">
              <Button size="sm" leftIcon={Plus}>
                Create Diet Plan
              </Button>
            </Link>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {plan.dietType}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{plan.targetCalories} kcal</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-800 mt-3 line-clamp-1">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.description}</p>

                {/* Macro split badges */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                  <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">Protein</span>
                    <strong className="text-blue-900">{plan.protein}g</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Carbs</span>
                    <strong className="text-amber-900">{plan.carbs}g</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Fats</span>
                    <strong className="text-emerald-900">{plan.fats}g</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Meta & Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{plan.mealsCount || plan.meals?.length || 4} Meals / Day · {plan.duration}</span>
                  <span className="font-semibold text-primary-600">
                    {plan.assignedMembersCount || 0} Members
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => duplicateDietPlan(plan.id)}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(plan.id, plan.name)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/gym/diet/${plan.id}/edit`)}
                      leftIcon={Edit}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/gym/diet/${plan.id}`)}
                      leftIcon={Eye}
                    >
                      View Meals
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Diet Type</th>
                  <th className="py-3 px-4">Calories</th>
                  <th className="py-3 px-4">Macros (P / C / F)</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Enrolled</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-800">{plan.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{plan.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {plan.dietType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{plan.targetCalories} kcal</td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {plan.protein}g / {plan.carbs}g / {plan.fats}g
                    </td>
                    <td className="py-3 px-4">{plan.duration}</td>
                    <td className="py-3 px-4 font-semibold text-primary-600">
                      {plan.assignedMembersCount || 0} Members
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicateDietPlan(plan.id)}
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/gym/diet/${plan.id}/edit`)}
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/gym/diet/${plan.id}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DietPlansPage;
