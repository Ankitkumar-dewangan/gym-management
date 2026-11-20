import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Copy,
  Dumbbell,
  Edit,
  Eye,
  Filter,
  Grid,
  Layers,
  List,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import {
  DIFFICULTY_LEVELS,
  WORKOUT_GOALS,
} from '../../../constants/workoutDietData';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function WorkoutPlansPage() {
  const navigate = useNavigate();
  const { workoutPlans, duplicateWorkoutPlan, deleteWorkoutPlan } = useWorkoutDiet();

  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const filteredPlans = useMemo(() => {
    return workoutPlans.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.trainer?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGoal = goalFilter === 'all' || p.goal === goalFilter;
      const matchDifficulty = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchGoal && matchDifficulty && matchStatus;
    });
  }, [workoutPlans, searchQuery, goalFilter, difficultyFilter, statusFilter]);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteWorkoutPlan(id);
    }
  };

  const countTotalExercises = (plan) => {
    if (!plan.days) return 0;
    return plan.days.reduce((acc, d) => acc + (d.exercises ? d.exercises.length : 0), 0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Plans Catalog"
        description="Design, customize, and manage structured exercise programs tailored for weight loss, hypertrophy, and functional strength."
        actions={
          <Link to="/gym/workouts/create">
            <Button leftIcon={Plus}>
              Create Workout Plan
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search plan name, trainer, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <Select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Goals' },
              ...WORKOUT_GOALS.map((g) => ({ value: g, label: g })),
            ]}
          />

          <Select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Difficulties' },
              ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d })),
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

      {/* Plans List or Grid */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workout plans found"
          description="Try adjusting your filter or search keywords, or create a brand new workout program."
          action={
            <Link to="/gym/workouts/create">
              <Button size="sm" leftIcon={Plus}>
                Create Plan
              </Button>
            </Link>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const exCount = countTotalExercises(plan);
            return (
              <div
                key={plan.id}
                className="group rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Image & Badges */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={plan.coverImage}
                    alt={plan.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-slate-800 backdrop-blur-xs">
                      {plan.goal}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        plan.difficulty === 'Beginner'
                          ? 'bg-emerald-500 text-white'
                          : plan.difficulty === 'Intermediate'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {plan.difficulty}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base line-clamp-1">{plan.name}</h3>
                    <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">{plan.description}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{plan.duration}</p>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Weekly</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{plan.daysPerWeek || plan.days?.length || 4} Days</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Exercises</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{exCount} Total</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <strong>{plan.assignedMembersCount || 0}</strong> Members Enrolled
                    </span>
                    <span className="text-slate-400">By {plan.trainer || 'Vikram'}</span>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => duplicateWorkoutPlan(plan.id)}
                        title="Duplicate Plan"
                      >
                        <Copy className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(plan.id, plan.name)}
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/gym/workouts/${plan.id}/edit`)}
                        leftIcon={Edit}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/gym/workouts/${plan.id}`)}
                        leftIcon={Eye}
                      >
                        View Routine
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Goal</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Days / Wk</th>
                  <th className="py-3 px-4">Enrolled</th>
                  <th className="py-3 px-4">Trainer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={plan.coverImage}
                          alt={plan.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{plan.name}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{plan.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{plan.goal}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {plan.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4">{plan.duration}</td>
                    <td className="py-3 px-4 font-semibold">{plan.daysPerWeek || 4} Days</td>
                    <td className="py-3 px-4 font-semibold text-primary-600">
                      {plan.assignedMembersCount || 0} Members
                    </td>
                    <td className="py-3 px-4 text-slate-500">{plan.trainer || 'Vikram'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicateWorkoutPlan(plan.id)}
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/gym/workouts/${plan.id}/edit`)}
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/gym/workouts/${plan.id}`)}
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

export default WorkoutPlansPage;
