import { useState } from 'react';
import {
  Apple,
  CheckCircle2,
  Clock,
  Download,
  Droplet,
  Flame,
  Plus,
  Sparkles,
  Utensils,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import { MEMBER_DIET_PLAN_DATA } from '../../constants/memberPortalData';

export function MemberDietPage() {
  const plan = MEMBER_DIET_PLAN_DATA;
  const [waterGlasses, setWaterGlasses] = useState(8);
  const targetGlasses = plan.dailyTargets.waterGlassesTarget;

  const handleAddWater = () => {
    setWaterGlasses((prev) => {
      const next = Math.min(prev + 1, targetGlasses + 4);
      toast.success(`Logged 250ml water! Total: ${(next * 0.25).toFixed(2)}L`);
      return next;
    });
  };

  const handleDownloadPDF = () => {
    toast.success('Official Diet Plan PDF downloaded to device!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Nutrition & Meal Plan"
        description="Review your customized caloric and macronutrient targets, hydration progress, and prescribed meal schedule."
        actions={
          <Button
            size="sm"
            variant="outline"
            leftIcon={Download}
            onClick={handleDownloadPDF}
          >
            Download Diet PDF
          </Button>
        }
      />

      {/* Plan Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {plan.dietType}
              </span>
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                Prescribed by {plan.nutritionist}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1.5">
              {plan.planName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Engineered for sustained strength output, optimal muscle synthesis, and lean fat loss.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-slate-400">Daily Calorie Target</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono">
              🔥 {plan.dailyTargets.calories} kcal
            </p>
            <span className="text-[11px] text-slate-400">Resting Metabolic + Workout split</span>
          </div>
        </div>

        {/* 3 Macro Cards with Visual Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-blue-900">
              <span>Protein Target</span>
              <span className="font-mono text-sm">{plan.dailyTargets.proteinGrams}g</span>
            </div>
            <div className="h-2 w-full bg-blue-200/60 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[80%]" />
            </div>
            <div className="flex justify-between text-[11px] text-blue-700">
              <span>{plan.macronutrientSplits.proteinPct}% of total calories</span>
              <span>640 kcal</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-amber-900">
              <span>Carbohydrates Target</span>
              <span className="font-mono text-sm">{plan.dailyTargets.carbsGrams}g</span>
            </div>
            <div className="h-2 w-full bg-amber-200/60 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full w-[75%]" />
            </div>
            <div className="flex justify-between text-[11px] text-amber-700">
              <span>{plan.macronutrientSplits.carbsPct}% of total calories</span>
              <span>960 kcal</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
              <span>Healthy Fats Target</span>
              <span className="font-mono text-sm">{plan.dailyTargets.fatsGrams}g</span>
            </div>
            <div className="h-2 w-full bg-emerald-200/60 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full w-[65%]" />
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700">
              <span>{plan.macronutrientSplits.fatsPct}% of total calories</span>
              <span>585 kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hydration Tracker Card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-sm shrink-0">
            <Droplet className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-bold text-base text-slate-800">Daily Hydration Tracker</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Logged <strong>{waterGlasses}</strong> of <strong>{targetGlasses}</strong> glasses ({(waterGlasses * 0.25).toFixed(2)}L / {plan.dailyTargets.waterLiters}L target)
            </p>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: targetGlasses }).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-3.5 h-6 rounded-sm border transition-all ${
                    idx < waterGlasses
                      ? 'bg-blue-500 border-blue-600'
                      : 'bg-white border-blue-200'
                  }`}
                  title={`Glass ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleAddWater}
            leftIcon={Plus}
          >
            + 250ml Glass
          </Button>
        </div>
      </div>

      {/* Daily Meal Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Today's Prescribed Meals</h3>
            <p className="text-xs text-slate-500">Carefully measured portions aligned with your workout timeline.</p>
          </div>
        </div>

        <div className="space-y-4">
          {plan.meals.map((meal, idx) => (
            <div
              key={meal.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs space-y-3 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-800">{meal.mealName}</h4>
                    <span className="text-xs text-slate-400">Scheduled Time: {meal.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                    🔥 {meal.targetKcal} kcal
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 text-xs">
                {meal.items.map((item, iIdx) => (
                  <div key={iIdx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-800 text-xs">{item.name}</strong>
                      <p className="text-[11px] text-slate-400">Portion: {item.quantity}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-800">
                        {item.calories} kcal
                      </span>
                      <p className="text-[10px] text-slate-400">
                        P: {item.protein}g · C: {item.carbs}g · F: {item.fats}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {meal.notes && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                  💡 <strong>Preparation Tip:</strong> {meal.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Guidelines & Notes */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Nutritionist Instructions & Advice
        </h4>
        <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
          {plan.instructions.map((inst, i) => (
            <li key={i}>{inst}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MemberDietPage;
