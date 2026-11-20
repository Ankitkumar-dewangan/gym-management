import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Dumbbell,
  Eye,
  GripVertical,
  Image as ImageIcon,
  Layers,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import {
  DAYS_PER_WEEK_OPTIONS,
  DIFFICULTY_LEVELS,
  DURATION_OPTIONS,
  WORKOUT_GOALS,
} from '../../../constants/workoutDietData';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function WorkoutPlanFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { workoutPlans, addWorkoutPlan, updateWorkoutPlan, exercises: libraryExercises } = useWorkoutDiet();

  const isEditing = Boolean(id);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: 'Weight Loss',
    difficulty: 'Beginner',
    duration: '6 Weeks',
    daysPerWeek: 4,
    targetGender: 'All',
    ageRange: '18 - 50',
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    trainer: 'Vikram Singh',
    status: 'Active',
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        dayTitle: 'Day 1: Full Body & Compound Lift Circuit',
        exercises: [
          {
            id: `ex-init-1`,
            exerciseId: 'ex-1',
            name: 'Barbell Flat Bench Press',
            muscleGroup: 'Chest',
            sets: 4,
            reps: '10-12 reps',
            rest: '60s',
            instructions: 'Controlled eccentric tempo, explosive drive.',
            order: 1,
            image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
          },
        ],
      },
    ],
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [targetDayIndex, setTargetDayIndex] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const existing = workoutPlans.find((p) => p.id === id);
      if (existing) {
        setFormData({
          ...existing,
          days: existing.days || [],
        });
      } else {
        toast.error('Workout plan not found');
        navigate('/gym/workouts/plans');
      }
    }
  }, [id, isEditing, workoutPlans, navigate]);

  // Day handlers
  const handleAddDay = () => {
    const nextDayNum = formData.days.length + 1;
    const newDay = {
      id: `day-${Date.now()}`,
      dayNumber: nextDayNum,
      dayTitle: `Day ${nextDayNum}: Training Routine`,
      exercises: [],
    };
    setFormData((prev) => ({
      ...prev,
      days: [...prev.days, newDay],
    }));
  };

  const handleDuplicateDay = (dayIndex) => {
    const sourceDay = formData.days[dayIndex];
    const duplicatedDay = {
      ...sourceDay,
      id: `day-${Date.now()}`,
      dayNumber: formData.days.length + 1,
      dayTitle: `${sourceDay.dayTitle} (Copy)`,
      exercises: sourceDay.exercises.map((e) => ({ ...e, id: `ex-${Date.now()}-${Math.random()}` })),
    };
    setFormData((prev) => ({
      ...prev,
      days: [...prev.days, duplicatedDay],
    }));
    toast.success('Day routine duplicated');
  };

  const handleRemoveDay = (dayIndex) => {
    if (formData.days.length <= 1) {
      toast.error('Workout plan must contain at least one day routine.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      days: prev.days.filter((_, idx) => idx !== dayIndex),
    }));
  };

  const handleDayTitleChange = (dayIndex, newTitle) => {
    setFormData((prev) => {
      const updated = [...prev.days];
      updated[dayIndex] = { ...updated[dayIndex], dayTitle: newTitle };
      return { ...prev, days: updated };
    });
  };

  // Exercise handlers inside a day
  const openAddExerciseModal = (dayIndex) => {
    setTargetDayIndex(dayIndex);
    setExerciseModalOpen(true);
  };

  const selectExerciseFromLibrary = (libEx) => {
    if (targetDayIndex === null) return;
    const newExerciseItem = {
      id: `item-${Date.now()}`,
      exerciseId: libEx.id,
      name: libEx.name,
      muscleGroup: libEx.muscleGroup,
      sets: libEx.suggestedSets || 3,
      reps: libEx.suggestedReps || '10-12 reps',
      rest: libEx.restTime || '60s',
      instructions: libEx.instructions || '',
      image: libEx.image,
      order: (formData.days[targetDayIndex]?.exercises?.length || 0) + 1,
    };

    setFormData((prev) => {
      const updatedDays = [...prev.days];
      const targetDay = updatedDays[targetDayIndex];
      updatedDays[targetDayIndex] = {
        ...targetDay,
        exercises: [...(targetDay.exercises || []), newExerciseItem],
      };
      return { ...prev, days: updatedDays };
    });

    setExerciseModalOpen(false);
    toast.success(`Added ${libEx.name}`);
  };

  const handleExerciseChange = (dayIndex, exIndex, field, value) => {
    setFormData((prev) => {
      const updatedDays = [...prev.days];
      const targetDay = { ...updatedDays[dayIndex] };
      const updatedExercises = [...targetDay.exercises];
      updatedExercises[exIndex] = { ...updatedExercises[exIndex], [field]: value };
      targetDay.exercises = updatedExercises;
      updatedDays[dayIndex] = targetDay;
      return { ...prev, days: updatedDays };
    });
  };

  const handleRemoveExercise = (dayIndex, exIndex) => {
    setFormData((prev) => {
      const updatedDays = [...prev.days];
      const targetDay = { ...updatedDays[dayIndex] };
      targetDay.exercises = targetDay.exercises.filter((_, idx) => idx !== exIndex);
      updatedDays[dayIndex] = targetDay;
      return { ...prev, days: updatedDays };
    });
  };

  const handleMoveExercise = (dayIndex, exIndex, direction) => {
    setFormData((prev) => {
      const updatedDays = [...prev.days];
      const targetDay = { ...updatedDays[dayIndex] };
      const list = [...targetDay.exercises];
      const targetPos = exIndex + direction;
      if (targetPos < 0 || targetPos >= list.length) return prev;
      const temp = list[exIndex];
      list[exIndex] = list[targetPos];
      list[targetPos] = temp;
      targetDay.exercises = list;
      updatedDays[dayIndex] = targetDay;
      return { ...prev, days: updatedDays };
    });
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a workout plan name');
      return;
    }

    if (isEditing) {
      updateWorkoutPlan(id, formData);
      navigate(`/gym/workouts/${id}`);
    } else {
      const created = addWorkoutPlan(formData);
      navigate(`/gym/workouts/${created.id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={isEditing ? `Edit Plan: ${formData.name}` : 'Create New Workout Plan'}
        description="Configure target goals, training duration, and curate daily exercise routines."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              leftIcon={Eye}
            >
              Live Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/gym/workouts/plans')}
              leftIcon={ArrowLeft}
            >
              Back to Plans
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Plan Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">1. Basic Plan Information</h2>
              <p className="text-xs text-slate-500">Plan naming, difficulty level, and coaching goals</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
              General Info
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Workout Plan Name"
                placeholder="e.g. Muscle Building – 6 Weeks Hypertrophy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <Select
              label="Fitness Goal"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              options={WORKOUT_GOALS.map((g) => ({ value: g, label: g }))}
            />

            <Select
              label="Difficulty Level"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              options={DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))}
            />

            <Select
              label="Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              options={DURATION_OPTIONS.map((dur) => ({ value: dur, label: dur }))}
            />

            <Select
              label="Workout Days Per Week"
              value={formData.daysPerWeek}
              onChange={(e) => setFormData({ ...formData, daysPerWeek: Number(e.target.value) })}
              options={DAYS_PER_WEEK_OPTIONS.map((d) => ({ value: d, label: `${d} Days / Week` }))}
            />

            <Input
              label="Assigned Lead Trainer"
              value={formData.trainer}
              onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
              placeholder="e.g. Vikram Singh"
            />

            <Select
              label="Target Gender"
              value={formData.targetGender}
              onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
              options={[
                { value: 'All', label: 'All Genders (Unisex)' },
                { value: 'Men', label: 'Men' },
                { value: 'Women', label: 'Women' },
              ]}
            />

            <Input
              label="Age Range Recommendation"
              value={formData.ageRange}
              onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
              placeholder="e.g. 18 - 50"
            />

            <div className="sm:col-span-2">
              <Input
                label="Cover Image URL"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <Select
              label="Plan Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Draft', label: 'Draft' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Plan Description & Overview</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-primary-500 focus:outline-hidden"
              placeholder="Describe what members can achieve with this workout schedule..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Day-by-Day Exercise Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">2. Day-wise Workout Routines</h2>
              <p className="text-xs text-slate-500">
                Organize training splits, assign sets/reps, and sequence movements.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddDay}
              leftIcon={Plus}
            >
              Add Workout Day
            </Button>
          </div>

          {formData.days.map((day, dayIndex) => (
            <div
              key={day.id || dayIndex}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
            >
              {/* Day Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center">
                    {dayIndex + 1}
                  </span>
                  <input
                    type="text"
                    value={day.dayTitle}
                    onChange={(e) => handleDayTitleChange(dayIndex, e.target.value)}
                    placeholder="Day title (e.g. Day 1: Chest & Triceps)"
                    className="flex-1 font-semibold text-sm text-slate-800 border-b border-dashed border-slate-300 focus:border-primary-500 focus:outline-hidden py-0.5"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDuplicateDay(dayIndex)}
                    title="Duplicate Day"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveDay(dayIndex)}
                    title="Remove Day"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openAddExerciseModal(dayIndex)}
                    leftIcon={Plus}
                  >
                    Add Exercise
                  </Button>
                </div>
              </div>

              {/* Exercises in Day */}
              {day.exercises?.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg">
                  <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No exercises added to this day yet.</p>
                  <button
                    type="button"
                    onClick={() => openAddExerciseModal(dayIndex)}
                    className="text-xs font-semibold text-primary-600 hover:underline mt-1"
                  >
                    + Pick from Exercise Library
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {day.exercises.map((ex, exIndex) => (
                    <div
                      key={ex.id || exIndex}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between"
                    >
                      {/* Left: Info */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={exIndex === 0}
                            onClick={() => handleMoveExercise(dayIndex, exIndex, -1)}
                            className="text-[10px] text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={exIndex === day.exercises.length - 1}
                            onClick={() => handleMoveExercise(dayIndex, exIndex, 1)}
                            className="text-[10px] text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          >
                            ▼
                          </button>
                        </div>
                        {ex.image && (
                          <img
                            src={ex.image}
                            alt={ex.name}
                            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                          />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800">{ex.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                            {ex.muscleGroup || 'Full Body'}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Sets, Reps, Rest inputs */}
                      <div className="grid grid-cols-3 gap-2 w-full sm:w-auto flex-1 max-w-sm">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Sets</label>
                          <input
                            type="number"
                            min="1"
                            value={ex.sets}
                            onChange={(e) =>
                              handleExerciseChange(dayIndex, exIndex, 'sets', Number(e.target.value))
                            }
                            className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Reps / Time</label>
                          <input
                            type="text"
                            value={ex.reps}
                            onChange={(e) =>
                              handleExerciseChange(dayIndex, exIndex, 'reps', e.target.value)
                            }
                            className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Rest</label>
                          <input
                            type="text"
                            value={ex.rest}
                            onChange={(e) =>
                              handleExerciseChange(dayIndex, exIndex, 'rest', e.target.value)
                            }
                            className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md"
                          />
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(dayIndex, exIndex)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Remove Exercise"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Actions */}
        <div className="sticky bottom-4 z-10 p-4 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/gym/workouts/plans')}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              leftIcon={Eye}
            >
              Preview Plan
            </Button>
            <Button type="submit" leftIcon={Save}>
              {isEditing ? 'Save Changes' : 'Create Workout Plan'}
            </Button>
          </div>
        </div>
      </form>

      {/* Modal: Exercise Library Selector */}
      <Modal
        isOpen={exerciseModalOpen}
        onClose={() => setExerciseModalOpen(false)}
        title="Select Exercise from Library"
        size="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <p className="text-xs text-slate-500">
            Pick from standard exercises categorized by equipment and targeted muscle groups:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {libraryExercises.map((libEx) => (
              <div
                key={libEx.id}
                onClick={() => selectExerciseFromLibrary(libEx)}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/30 cursor-pointer transition-all"
              >
                <img
                  src={libEx.image}
                  alt={libEx.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{libEx.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium text-slate-500">{libEx.muscleGroup}</span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400">{libEx.equipment}</span>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-primary-600 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Live Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Live Workout Plan Preview"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900">
            <img
              src={formData.coverImage}
              alt={formData.name}
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-600 uppercase self-start mb-1">
                {formData.difficulty} · {formData.goal}
              </span>
              <h3 className="font-bold text-lg">{formData.name || 'Untitled Workout Plan'}</h3>
              <p className="text-xs text-slate-300">{formData.description || 'No description entered.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-slate-50 rounded-lg">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
              <p className="font-bold text-slate-800">{formData.duration}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Weekly</span>
              <p className="font-bold text-slate-800">{formData.daysPerWeek} Days</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Trainer</span>
              <p className="font-bold text-slate-800">{formData.trainer}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Workout Days Routine</h4>
            {formData.days.map((d, idx) => (
              <div key={d.id || idx} className="p-3 rounded-lg border border-slate-200 space-y-2">
                <p className="font-semibold text-xs text-slate-800">{d.dayTitle}</p>
                <div className="divide-y divide-slate-100 text-xs">
                  {d.exercises?.map((e, eIdx) => (
                    <div key={e.id || eIdx} className="py-1.5 flex items-center justify-between">
                      <span className="font-medium text-slate-700">{e.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {e.sets} sets × {e.reps} (Rest: {e.rest})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default WorkoutPlanFormPage;
