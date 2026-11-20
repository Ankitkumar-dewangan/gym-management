import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Dumbbell,
  Edit,
  Eye,
  Flame,
  Layers,
  Play,
  Plus,
  Share2,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function WorkoutPlanDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    workoutPlans,
    workoutAssignments,
    duplicateWorkoutPlan,
    deleteWorkoutPlan,
  } = useWorkoutDiet();

  const plan = workoutPlans.find((p) => p.id === id);

  const assignedMembers = useMemo(() => {
    return workoutAssignments.filter((a) => a.workoutPlanId === id);
  }, [workoutAssignments, id]);

  if (!plan) {
    return (
      <div className="space-y-6">
        <PageHeader title="Workout Plan Not Found" />
        <EmptyState
          icon={Dumbbell}
          title="Plan Not Found"
          description="The requested workout plan does not exist or has been removed."
          action={
            <Link to="/gym/workouts/plans">
              <Button leftIcon={ArrowLeft}>Back to Plans</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      deleteWorkoutPlan(plan.id);
      navigate('/gym/workouts/plans');
    }
  };

  const handleDuplicate = () => {
    duplicateWorkoutPlan(plan.id);
    navigate('/gym/workouts/plans');
  };

  const totalExercises = (plan.days || []).reduce(
    (acc, d) => acc + (d.exercises ? d.exercises.length : 0),
    0
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={plan.name}
        description={`Designed by ${plan.trainer || 'Vikram Singh'} · ${plan.goal} · ${plan.duration}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/gym/workouts/assign?planId=${plan.id}`}>
              <Button size="sm" leftIcon={UserCheck}>
                Assign to Members
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/gym/workouts/${plan.id}/edit`)}
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

      {/* Hero Banner Card */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm text-white">
        <div className="relative h-64 w-full">
          <img
            src={plan.coverImage}
            alt={plan.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-600">
                {plan.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                {plan.goal}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/80">
                {plan.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{plan.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              {plan.description}
            </p>
          </div>
        </div>

        {/* Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 bg-slate-950/90 py-3.5 px-4 text-center">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Duration</p>
            <p className="text-sm font-bold text-white mt-0.5">{plan.duration}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Weekly Schedule</p>
            <p className="text-sm font-bold text-white mt-0.5">{plan.daysPerWeek || plan.days?.length || 4} Days / Week</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Exercises</p>
            <p className="text-sm font-bold text-white mt-0.5">{totalExercises} Movements</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Enrolled Members</p>
            <p className="text-sm font-bold text-primary-400 mt-0.5">
              {assignedMembers.length > 0 ? assignedMembers.length : plan.assignedMembersCount || 0} Members
            </p>
          </div>
        </div>
      </div>

      {/* Day-wise Exercise Routines */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-600" /> Day-by-Day Routine & Exercise Schedule
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {plan.days?.length || 0} Workout Routines Configured
          </span>
        </div>

        <div className="space-y-4">
          {(plan.days || []).map((day, dayIndex) => (
            <div
              key={day.id || dayIndex}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
            >
              {/* Day title header */}
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-primary-600 text-white font-bold text-xs flex items-center justify-center">
                    {dayIndex + 1}
                  </span>
                  <h3 className="font-bold text-sm text-slate-800">{day.dayTitle}</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {day.exercises?.length || 0} Exercises
                </span>
              </div>

              {/* Exercise List */}
              <div className="p-4 divide-y divide-slate-100">
                {(day.exercises || []).map((ex, exIndex) => (
                  <div
                    key={ex.id || exIndex}
                    className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5">
                        {exIndex + 1}.
                      </span>
                      {ex.image && (
                        <img
                          src={ex.image}
                          alt={ex.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">{ex.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-primary-50 text-primary-700">
                            {ex.muscleGroup || 'Full Body'}
                          </span>
                          {ex.instructions && (
                            <span className="text-[11px] text-slate-400 line-clamp-1">
                              • {ex.instructions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium self-end sm:self-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Sets</span>
                        <strong className="text-slate-800">{ex.sets}</strong>
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <span className="text-slate-400 text-[10px] block">Reps</span>
                        <strong className="text-slate-800">{ex.reps}</strong>
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <span className="text-slate-400 text-[10px] block">Rest</span>
                        <strong className="text-slate-800">{ex.rest}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Members Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Assigned Members</h3>
            <p className="text-xs text-slate-500">Members currently enrolled in this program</p>
          </div>
          <Link to={`/gym/workouts/assign?planId=${plan.id}`}>
            <Button size="sm" variant="outline" leftIcon={Plus}>
              Enroll New Member
            </Button>
          </Link>
        </div>

        {assignedMembers.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">
            No active assignments logged for this plan yet. Click "Assign to Members" to enroll members.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {assignedMembers.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-lg border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={m.memberPhoto}
                    alt={m.memberName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{m.memberName}</p>
                    <p className="text-[10px] text-slate-400">
                      {m.completedSessions}/{m.totalSessions} Sessions Done
                    </p>
                  </div>
                </div>
                <Link
                  to="/gym/progress"
                  className="text-xs font-semibold text-primary-600 hover:underline"
                >
                  Track
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutPlanDetailsPage;
