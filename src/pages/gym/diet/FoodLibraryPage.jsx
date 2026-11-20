import { useMemo, useState } from 'react';
import {
  Apple,
  Edit,
  Flame,
  Grid,
  List,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { FOOD_CATEGORIES } from '../../../constants/workoutDietData';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function FoodLibraryPage() {
  const { foodLibrary, addFood, updateFood, deleteFood } = useWorkoutDiet();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Proteins',
    servingSize: '100g',
    calories: 150,
    protein: 20,
    carbs: 5,
    fats: 4,
  });

  const filteredFoods = useMemo(() => {
    return foodLibrary.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [foodLibrary, searchQuery, categoryFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      category: 'Proteins',
      servingSize: '100g',
      calories: 150,
      protein: 20,
      carbs: 5,
      fats: 4,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (food) => {
    setEditingId(food.id);
    setForm({
      name: food.name,
      category: food.category,
      servingSize: food.servingSize,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Food item name is required');
      return;
    }

    if (editingId) {
      updateFood(editingId, form);
    } else {
      addFood(form);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}" from food database?`)) {
      deleteFood(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Food & Macro Database"
        description="Comprehensive nutritional database of calibrated whole foods, Indian staples, lean proteins, and macro breakdowns."
        actions={
          <Button onClick={openCreateModal} leftIcon={Plus}>
            Add Food Item
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search food item, ingredient, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...FOOD_CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
              />
            </div>
            {/* View Mode */}
            <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-primary-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list' ? 'bg-white shadow-2xs text-primary-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 mr-2 uppercase tracking-wider">
            Category:
          </span>
          {['all', ...FOOD_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === c
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c === 'all' ? 'All Foods' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid or Table */}
      {filteredFoods.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No food items found"
          description="Try relaxing your filters or register a custom food item to the database."
          action={
            <Button size="sm" onClick={openCreateModal} leftIcon={Plus}>
              Add Food
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {food.category}
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    🔥 {food.calories} kcal
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 mt-2 line-clamp-1">{food.name}</h4>
                <p className="text-[11px] text-slate-400">Standard Serving: {food.servingSize}</p>

                {/* Macro pill summary */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 text-center text-xs">
                  <div className="p-1.5 rounded bg-blue-50/70 border border-blue-100">
                    <span className="text-[9px] font-bold text-blue-700 block">PRO</span>
                    <strong className="text-blue-900">{food.protein}g</strong>
                  </div>
                  <div className="p-1.5 rounded bg-amber-50/70 border border-amber-100">
                    <span className="text-[9px] font-bold text-amber-700 block">CARB</span>
                    <strong className="text-amber-900">{food.carbs}g</strong>
                  </div>
                  <div className="p-1.5 rounded bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[9px] font-bold text-emerald-700 block">FAT</span>
                    <strong className="text-emerald-900">{food.fats}g</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(food)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(food.id, food.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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
                  <th className="py-3 px-4">Food Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Serving Size</th>
                  <th className="py-3 px-4">Calories</th>
                  <th className="py-3 px-4">Protein</th>
                  <th className="py-3 px-4">Carbohydrates</th>
                  <th className="py-3 px-4">Fats</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{food.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {food.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{food.servingSize}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{food.calories} kcal</td>
                    <td className="py-3 px-4 font-semibold text-blue-700">{food.protein}g</td>
                    <td className="py-3 px-4 font-semibold text-amber-700">{food.carbs}g</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">{food.fats}g</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(food)} title="Edit">
                          <Edit className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(food.id, food.name)} title="Delete">
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

      {/* Modal: Add / Edit Food */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Food Item' : 'Add Food Item to Database'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Food Name"
            placeholder="e.g. Rolled Oats (Raw)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Food Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={FOOD_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <Input
              label="Standard Serving Size"
              placeholder="e.g. 100g, 1 scoop, 2 rotis"
              value={form.servingSize}
              onChange={(e) => setForm({ ...form, servingSize: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Calories (kcal)"
              type="number"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
              required
            />
            <Input
              label="Protein (g)"
              type="number"
              step="0.1"
              value={form.protein}
              onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
              required
            />
            <Input
              label="Carbs (g)"
              type="number"
              step="0.1"
              value={form.carbs}
              onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })}
              required
            />
            <Input
              label="Fats (g)"
              type="number"
              step="0.1"
              value={form.fats}
              onChange={(e) => setForm({ ...form, fats: Number(e.target.value) })}
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? 'Save Changes' : 'Add to Food Database'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default FoodLibraryPage;
