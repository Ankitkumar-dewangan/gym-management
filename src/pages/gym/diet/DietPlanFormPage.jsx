import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Apple,
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Eye,
  Flame,
  Layers,
  Plus,
  Save,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import {
  DIET_GOALS,
  DIET_TYPES,
  DURATION_OPTIONS,
  MEAL_TYPES,
} from '../../../constants/workoutDietData';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function DietPlanFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { dietPlans, addDietPlan, updateDietPlan, foodLibrary } = useWorkoutDiet();

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: 'Muscle Gain',
    dietType: 'Non-Vegetarian',
    targetCalories: 2400,
    protein: 160,
    carbs: 240,
    fats: 60,
    duration: '8 Weeks',
    status: 'Active',
    createdBy: 'Priya Patel (Nutritionist)',
    meals: [
      {
        id: 'meal-1',
        mealName: 'Breakfast (8:00 AM)',
        notes: 'High protein energy start',
        items: [
          { foodId: 'fd-1', name: 'Rolled Oats (Raw)', quantity: '50g', calories: 190, protein: 7, carbs: 34, fats: 3 },
          { foodId: 'fd-2', name: 'Whole Eggs (Boiled)', quantity: '2 large', calories: 144, protein: 13, carbs: 1, fats: 10 },
        ],
      },
    ],
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [targetMealIndex, setTargetMealIndex] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const existing = dietPlans.find((p) => p.id === id);
      if (existing) {
        setFormData({
          ...existing,
          meals: existing.meals || [],
        });
      } else {
        toast.error('Diet plan not found');
        navigate('/gym/diet/plans');
      }
    }
  }, [id, isEditing, dietPlans, navigate]);

  // Dynamically compute summed totals from all meals
  const computedTotals = useMemo(() => {
    let cal = 0;
    let pro = 0;
    let carb = 0;
    let fat = 0;

    (formData.meals || []).forEach((m) => {
      (m.items || []).forEach((item) => {
        cal += Number(item.calories) || 0;
        pro += Number(item.protein) || 0;
        carb += Number(item.carbs) || 0;
        fat += Number(item.fats) || 0;
      });
    });

    return { cal, pro, carb, fat };
  }, [formData.meals]);

  // Meal management
  const handleAddMeal = () => {
    const mealNum = formData.meals.length + 1;
    const nextType = MEAL_TYPES[mealNum - 1] || `Meal ${mealNum}`;
    const newMeal = {
      id: `meal-${Date.now()}`,
      mealName: nextType,
      notes: '',
      items: [],
    };
    setFormData((prev) => ({
      ...prev,
      meals: [...prev.meals, newMeal],
    }));
  };

  const handleRemoveMeal = (mealIdx) => {
    if (formData.meals.length <= 1) {
      toast.error('At least one meal must remain in the diet plan.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, idx) => idx !== mealIdx),
    }));
  };

  const openAddFoodModal = (mealIdx) => {
    setTargetMealIndex(mealIdx);
    setFoodModalOpen(true);
  };

  const selectFoodFromLibrary = (foodItem) => {
    if (targetMealIndex === null) return;
    const newItem = {
      foodId: foodItem.id,
      name: foodItem.name,
      quantity: foodItem.servingSize,
      calories: foodItem.calories,
      protein: foodItem.protein,
      carbs: foodItem.carbs,
      fats: foodItem.fats,
    };

    setFormData((prev) => {
      const updatedMeals = [...prev.meals];
      const targetMeal = updatedMeals[targetMealIndex];
      updatedMeals[targetMealIndex] = {
        ...targetMeal,
        items: [...(targetMeal.items || []), newItem],
      };
      return { ...prev, meals: updatedMeals };
    });

    setFoodModalOpen(false);
    toast.success(`Added ${foodItem.name}`);
  };

  const handleRemoveFoodItem = (mealIdx, itemIdx) => {
    setFormData((prev) => {
      const updatedMeals = [...prev.meals];
      const targetMeal = { ...updatedMeals[mealIdx] };
      targetMeal.items = targetMeal.items.filter((_, idx) => idx !== itemIdx);
      updatedMeals[mealIdx] = targetMeal;
      return { ...prev, meals: updatedMeals };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a diet plan name');
      return;
    }

    const payload = {
      ...formData,
      targetCalories: Number(formData.targetCalories) || computedTotals.cal,
      protein: Number(formData.protein) || computedTotals.pro,
      carbs: Number(formData.carbs) || computedTotals.carb,
      fats: Number(formData.fats) || computedTotals.fat,
      mealsCount: formData.meals.length,
    };

    if (isEditing) {
      updateDietPlan(id, payload);
      navigate(`/gym/diet/${id}`);
    } else {
      const created = addDietPlan(payload);
      navigate(`/gym/diet/${created.id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={isEditing ? `Edit Diet Plan: ${formData.name}` : 'Create New Diet Plan'}
        description="Prescribe daily calorie ceilings, macronutrient distributions, and meal schedules."
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
              onClick={() => navigate('/gym/diet/plans')}
              leftIcon={ArrowLeft}
            >
              Back to Plans
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Target Goals & Parameters */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">1. Nutritional Objectives</h2>
              <p className="text-xs text-slate-500">Plan naming, dietary preference, and daily macro targets</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              Macro Setup
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Diet Plan Name"
                placeholder="e.g. High Protein Lean Muscle Gain"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <Select
              label="Dietary Classification"
              value={formData.dietType}
              onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
              options={DIET_TYPES.map((t) => ({ value: t, label: t }))}
            />

            <Select
              label="Fitness Goal"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              options={DIET_GOALS.map((g) => ({ value: g, label: g }))}
            />

            <Select
              label="Program Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              options={DURATION_OPTIONS.map((d) => ({ value: d, label: d }))}
            />

            <Input
              label="Created By / Nutritionist"
              value={formData.createdBy}
              onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
              placeholder="e.g. Priya Patel"
            />
          </div>

          {/* Daily Calorie & Macro Target Row */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Daily Macro Targets & Calculated Sum
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    targetCalories: computedTotals.cal,
                    protein: computedTotals.pro,
                    carbs: computedTotals.carb,
                    fats: computedTotals.fat,
                  }))
                }
                className="text-xs font-semibold text-primary-600 hover:underline"
              >
                Auto-fill from Added Foods
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Calories (kcal)"
                type="number"
                value={formData.targetCalories}
                onChange={(e) => setFormData({ ...formData, targetCalories: Number(e.target.value) })}
                required
              />
              <Input
                label="Protein (g)"
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                required
              />
              <Input
                label="Carbs (g)"
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                required
              />
              <Input
                label="Fats (g)"
                type="number"
                value={formData.fats}
                onChange={(e) => setFormData({ ...formData, fats: Number(e.target.value) })}
                required
              />
            </div>

            <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-4">
              <span>Foods Total Sum: <strong>{computedTotals.cal} kcal</strong></span>
              <span>P: <strong>{computedTotals.pro}g</strong></span>
              <span>C: <strong>{computedTotals.carb}g</strong></span>
              <span>F: <strong>{computedTotals.fat}g</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Diet Description & Guidelines
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:outline-hidden"
              placeholder="Instructions on water intake, meal timing windows, and cheat meal boundaries..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Meal-by-Meal Schedule Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">2. Meal Schedule & Food Portions</h2>
              <p className="text-xs text-slate-500">
                Structure daily eating windows, add verified food portions, and calibrate macros.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddMeal}
              leftIcon={Plus}
            >
              Add Meal Slot
            </Button>
          </div>

          {formData.meals.map((meal, mealIdx) => (
            <div
              key={meal.id || mealIdx}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3"
            >
              {/* Meal Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {mealIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={meal.mealName}
                    onChange={(e) => {
                      const updated = [...formData.meals];
                      updated[mealIdx].mealName = e.target.value;
                      setFormData({ ...formData, meals: updated });
                    }}
                    className="font-bold text-sm text-slate-800 border-b border-dashed border-slate-300 focus:border-emerald-500 focus:outline-hidden py-0.5"
                    placeholder="Meal name (e.g. Breakfast 08:30 AM)"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMeal(mealIdx)}
                    title="Remove Meal"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openAddFoodModal(mealIdx)}
                    leftIcon={Plus}
                  >
                    Add Food Item
                  </Button>
                </div>
              </div>

              {/* Meal Food Items */}
              {meal.items?.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg">
                  <UtensilsCrossed className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500">No foods added to this meal slot yet.</p>
                  <button
                    type="button"
                    onClick={() => openAddFoodModal(mealIdx)}
                    className="text-xs font-semibold text-emerald-600 hover:underline mt-1"
                  >
                    + Pick from Food Library
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {meal.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-800">{item.name}</strong>
                        <span className="text-slate-400">({item.quantity})</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-semibold text-slate-700">
                          🔥 {item.calories} kcal
                        </span>
                        <span className="text-slate-500 hidden sm:inline">
                          P: {item.protein}g · C: {item.carbs}g · F: {item.fats}g
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFoodItem(mealIdx, itemIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-4 z-10 p-4 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/gym/diet/plans')}
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
              {isEditing ? 'Save Changes' : 'Create Diet Plan'}
            </Button>
          </div>
        </div>
      </form>

      {/* Modal: Pick Food from Library */}
      <Modal
        isOpen={foodModalOpen}
        onClose={() => setFoodModalOpen(false)}
        title="Add Food from Database"
        size="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {foodLibrary.map((food) => (
              <div
                key={food.id}
                onClick={() => selectFoodFromLibrary(food)}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{food.name}</h4>
                  <p className="text-[10px] text-slate-400">Serving: {food.servingSize}</p>
                  <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                    🔥 {food.calories} kcal · P: {food.protein}g · C: {food.carbs}g · F: {food.fats}g
                  </p>
                </div>
                <Plus className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Live Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Diet Plan Live Preview"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-5 rounded-xl bg-slate-900 text-white space-y-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 uppercase">
              {formData.dietType} · {formData.goal}
            </span>
            <h3 className="font-bold text-lg">{formData.name || 'Untitled Diet Plan'}</h3>
            <p className="text-xs text-slate-300">{formData.description || 'No description entered.'}</p>
            <div className="pt-2 flex items-center gap-4 text-xs font-bold">
              <span>🔥 {formData.targetCalories} kcal</span>
              <span>P: {formData.protein}g</span>
              <span>C: {formData.carbs}g</span>
              <span>F: {formData.fats}g</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Daily Meals</h4>
            {formData.meals.map((m, idx) => (
              <div key={m.id || idx} className="p-3 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-xs text-slate-800">{m.mealName}</p>
                <div className="divide-y divide-slate-100 text-xs">
                  {m.items?.map((item, iIdx) => (
                    <div key={iIdx} className="py-1 flex items-center justify-between text-slate-600">
                      <span>{item.name} ({item.quantity})</span>
                      <span className="font-mono font-medium">{item.calories} kcal</span>
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

export default DietPlanFormPage;
