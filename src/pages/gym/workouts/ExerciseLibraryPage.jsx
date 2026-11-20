import { useMemo, useState } from 'react';
import {
  Check,
  Dumbbell,
  Edit,
  Eye,
  Filter,
  Grid,
  Info,
  Layers,
  List,
  Play,
  Plus,
  Search,
  Trash2,
  Video,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import {
  DIFFICULTY_LEVELS,
  EQUIPMENT_CATEGORIES,
  EXERCISE_TYPES,
  MUSCLE_GROUPS,
} from '../../../constants/workoutDietData';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function ExerciseLibraryPage() {
  const { exercises, addExercise, updateExercise, deleteExercise } = useWorkoutDiet();

  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    type: 'Strength',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
    targetMuscles: 'Chest, Triceps, Front Deltoids',
    instructions: '',
    suggestedSets: 3,
    suggestedReps: '10-12 reps',
    restTime: '60s',
    videoUrl: '',
  });

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMuscle = muscleFilter === 'all' || ex.muscleGroup === muscleFilter;
      const matchEquip = equipmentFilter === 'all' || ex.equipment === equipmentFilter;
      const matchDiff = difficultyFilter === 'all' || ex.difficulty === difficultyFilter;
      return matchSearch && matchMuscle && matchEquip && matchDiff;
    });
  }, [exercises, searchQuery, muscleFilter, equipmentFilter, difficultyFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      muscleGroup: 'Chest',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      type: 'Strength',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
      targetMuscles: 'Chest, Triceps, Delts',
      instructions: '',
      suggestedSets: 3,
      suggestedReps: '10-12 reps',
      restTime: '60s',
      videoUrl: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (ex) => {
    setEditingId(ex.id);
    setForm({
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      difficulty: ex.difficulty,
      type: ex.type || 'Strength',
      image: ex.image,
      targetMuscles: Array.isArray(ex.targetMuscles)
        ? ex.targetMuscles.join(', ')
        : ex.targetMuscles || '',
      instructions: ex.instructions || '',
      suggestedSets: ex.suggestedSets || 3,
      suggestedReps: ex.suggestedReps || '10-12 reps',
      restTime: ex.restTime || '60s',
      videoUrl: ex.videoUrl || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Exercise name is required');
      return;
    }

    const payload = {
      ...form,
      suggestedSets: Number(form.suggestedSets) || 3,
      targetMuscles: form.targetMuscles
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (editingId) {
      updateExercise(editingId, payload);
    } else {
      addExercise(payload);
    }
    setIsFormModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete exercise "${name}" from the library?`)) {
      deleteExercise(id);
    }
  };

  const openDetail = (ex) => {
    setSelectedExercise(ex);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comprehensive Exercise Library"
        description="Search, categorize, and document training movements across all muscle groups, equipment types, and technique instructions."
        actions={
          <Button onClick={openCreateModal} leftIcon={Plus}>
            Add New Exercise
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search exercise, muscle, or equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <Select
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Muscle Groups' },
              ...MUSCLE_GROUPS.map((m) => ({ value: m, label: m })),
            ]}
          />

          <Select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Equipment' },
              ...EQUIPMENT_CATEGORIES.map((eq) => ({ value: eq, label: eq })),
            ]}
          />

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Difficulties' },
                  ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d })),
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

        {/* Muscle group pill chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 mr-2 uppercase tracking-wider">
            Quick Filter:
          </span>
          {['all', ...MUSCLE_GROUPS].map((mg) => (
            <button
              key={mg}
              onClick={() => setMuscleFilter(mg)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                muscleFilter === mg
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mg === 'all' ? 'All Muscles' : mg}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises View */}
      {filteredExercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No exercises match your search"
          description="Try relaxing your filters or add a custom movement to your library."
          action={
            <Button size="sm" onClick={openCreateModal} leftIcon={Plus}>
              Add Exercise
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="group rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div
                className="relative h-40 w-full bg-slate-100 overflow-hidden cursor-pointer"
                onClick={() => openDetail(ex)}
              >
                <img
                  src={ex.image}
                  alt={ex.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs">
                    {ex.muscleGroup}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-600 text-white shadow-xs">
                    {ex.difficulty}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <h4 className="text-xs font-bold truncate">{ex.name}</h4>
                  <p className="text-[11px] text-slate-200">{ex.equipment}</p>
                </div>
              </div>

              <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 line-clamp-2">
                  {ex.instructions || 'Controlled reps with strict posture.'}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Target: <strong>{ex.suggestedSets} Sets × {ex.suggestedReps}</strong></span>
                  <span>Rest: <strong>{ex.restTime}</strong></span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openDetail(ex)}
                    className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(ex)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ex.id, ex.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                  <th className="py-3 px-4">Exercise Name</th>
                  <th className="py-3 px-4">Muscle Group</th>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Sets & Reps</th>
                  <th className="py-3 px-4">Rest</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ex.image}
                          alt={ex.name}
                          className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{ex.name}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{ex.instructions}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary-700">{ex.muscleGroup}</td>
                    <td className="py-3 px-4 text-slate-600">{ex.equipment}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {ex.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{ex.suggestedSets} × {ex.suggestedReps}</td>
                    <td className="py-3 px-4 text-slate-500">{ex.restTime}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => openDetail(ex)} title="View">
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(ex)} title="Edit">
                          <Edit className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(ex.id, ex.name)} title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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

      {/* Modal: Add / Edit Exercise */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingId ? 'Edit Exercise' : 'Add New Exercise to Library'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Input
            label="Exercise Name"
            placeholder="e.g. Barbell Incline Bench Press"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Muscle Group"
              value={form.muscleGroup}
              onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
              options={MUSCLE_GROUPS.map((m) => ({ value: m, label: m }))}
            />

            <Select
              label="Equipment Type"
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
              options={EQUIPMENT_CATEGORIES.map((eq) => ({ value: eq, label: eq }))}
            />

            <Select
              label="Difficulty Level"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              options={DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))}
            />

            <Select
              label="Exercise Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={EXERCISE_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Suggested Sets"
              type="number"
              min="1"
              value={form.suggestedSets}
              onChange={(e) => setForm({ ...form, suggestedSets: e.target.value })}
            />
            <Input
              label="Suggested Reps"
              value={form.suggestedReps}
              onChange={(e) => setForm({ ...form, suggestedReps: e.target.value })}
              placeholder="e.g. 10-12 reps"
            />
            <Input
              label="Rest Time"
              value={form.restTime}
              onChange={(e) => setForm({ ...form, restTime: e.target.value })}
              placeholder="e.g. 60s"
            />
          </div>

          <Input
            label="Target Muscles (comma separated)"
            value={form.targetMuscles}
            onChange={(e) => setForm({ ...form, targetMuscles: e.target.value })}
            placeholder="e.g. Pectorals, Anterior Deltoids, Triceps"
          />

          <Input
            label="Exercise Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />

          <Input
            label="Video Demonstration URL (Optional)"
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Execution Instructions</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:outline-hidden"
              placeholder="Describe posture, grip width, breathing, and safety tips..."
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? 'Save Exercise' : 'Add to Library'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Exercise Detail View */}
      {selectedExercise && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedExercise.name}
          size="lg"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="relative h-56 rounded-xl overflow-hidden bg-slate-900">
              <img
                src={selectedExercise.image}
                alt={selectedExercise.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-600 text-white shadow-xs">
                  {selectedExercise.muscleGroup}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 backdrop-blur-xs">
                  {selectedExercise.equipment}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Difficulty</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedExercise.difficulty}</p>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Suggested Volume</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedExercise.suggestedSets} Sets × {selectedExercise.suggestedReps}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Recommended Rest</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedExercise.restTime}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Muscle Groups
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(selectedExercise.targetMuscles)
                  ? selectedExercise.targetMuscles
                  : [selectedExercise.targetMuscles]
                ).map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Technique & Form Instructions
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                {selectedExercise.instructions || 'Perform with steady tempo and full range of motion.'}
              </p>
            </div>

            {selectedExercise.videoUrl && (
              <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <Video className="w-4 h-4 text-rose-600" />
                  <span>Video Demonstration Available</span>
                </div>
                <a
                  href={selectedExercise.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-primary-600 hover:underline"
                >
                  Watch Technique
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setIsDetailModalOpen(false)}>Close View</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ExerciseLibraryPage;
