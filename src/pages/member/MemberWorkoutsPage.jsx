import { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { MEMBER_WORKOUT_PLAN } from '../../constants/memberPortalData';

export function MemberWorkoutsPage() {
  const plan = MEMBER_WORKOUT_PLAN;
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(['ex-1']);
  const [isWorkoutSessionActive, setIsWorkoutSessionActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const activeDay = plan.days[activeDayIdx] || plan.days[0];

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleExerciseDone = (id) => {
    setCompletedExercises((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    toast.success('Exercise state toggled!');
  };

  const startLiveWorkout = () => {
    setIsWorkoutSessionActive(true);
    setIsTimerRunning(true);
    setTimerSeconds(0);
  };

  const finishLiveWorkout = () => {
    setIsTimerRunning(false);
    setIsWorkoutSessionActive(false);
    toast.success(`Workout finished in ${Math.floor(timerSeconds / 60)}m ${timerSeconds % 60}s! Logged to training history.`);
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Training Regimen & Workouts"
        description="Follow your customized training splits, record sets and reps, and execute live guided routines."
        actions={
          <Button
            size="sm"
            leftIcon={Play}
            onClick={startLiveWorkout}
          >
            Start Workout Mode
          </Button>
        }
      />

      {/* Plan Header Hero Card */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm text-white">
        <div className="relative h-56 sm:h-64 w-full">
          <img
            src={plan.coverImage}
            alt={plan.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 flex flex-col justify-end">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-primary-600 uppercase">
                {plan.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 uppercase">
                {plan.goal}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold">{plan.name}</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">{plan.description}</p>
          </div>
        </div>

        {/* Plan Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-800 bg-slate-950/95 py-3.5 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Coach</span>
            <p className="font-bold text-white mt-0.5">{plan.trainerName}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Program Length</span>
            <p className="font-bold text-white mt-0.5">{plan.durationWeeks} Weeks ({plan.completedWeeks} Completed)</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Completed Sessions</span>
            <p className="font-bold text-emerald-400 mt-0.5">{plan.completedSessions} of {plan.totalSessions} Sessions</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Adherence Score</span>
            <p className="font-bold text-primary-400 mt-0.5">71% On Track</p>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        {plan.days.map((day, idx) => (
          <button
            key={day.id}
            type="button"
            onClick={() => setActiveDayIdx(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeDayIdx === idx
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Day {idx + 1} · {day.focus}
          </button>
        ))}
      </div>

      {/* Routine Detail Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-800 uppercase">
                {activeDay.duration} Session
              </span>
              <span className="text-xs font-semibold text-slate-400">Target: {activeDay.focus}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-1">{activeDay.dayTitle}</h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 self-start sm:self-auto">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>
              {completedExercises.length} / {activeDay.exercises.length} Exercises Completed
            </span>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-3.5">
          {activeDay.exercises.map((ex, exIdx) => {
            const isDone = completedExercises.includes(ex.id);

            return (
              <div
                key={ex.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-emerald-50/40 border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => toggleExerciseDone(ex.id)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all shrink-0 mt-0.5 sm:mt-0 ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-primary-500 bg-white'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <img
                    src={ex.image}
                    alt={ex.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {ex.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {ex.muscle}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong>{ex.sets} Sets</strong> × <strong>{ex.reps}</strong> · Rest: <strong>{ex.rest}</strong> · Tempo: {ex.tempo}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      💡 Coach Note: {ex.notes}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isDone ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workout History Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-800">Recent Completed Workouts</h3>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-4">Routine</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Movements Done</th>
                <th className="py-3 px-4">Estimated Burn</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-5 font-bold text-slate-800 font-mono">19 Nov 2026</td>
                <td className="py-3 px-4 text-slate-800 font-medium">Day 2 · Pull Focus</td>
                <td className="py-3 px-4">1h 15m</td>
                <td className="py-3 px-4">4 / 4 Exercises</td>
                <td className="py-3 px-4 font-mono">🔥 490 kcal</td>
                <td className="py-3 px-5 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Logged
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-5 font-bold text-slate-800 font-mono">17 Nov 2026</td>
                <td className="py-3 px-4 text-slate-800 font-medium">Day 1 · Push Focus</td>
                <td className="py-3 px-4">1h 20m</td>
                <td className="py-3 px-4">4 / 4 Exercises</td>
                <td className="py-3 px-4 font-mono">🔥 520 kcal</td>
                <td className="py-3 px-5 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Logged
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Active Workout Modal */}
      <Modal
        isOpen={isWorkoutSessionActive}
        onClose={() => setIsWorkoutSessionActive(false)}
        title="Live Workout Session"
        maxWidth="max-w-lg"
      >
        <div className="p-6 text-center space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-primary-400 font-bold">Elapsed Workout Timer</span>
            <p className="font-mono text-4xl sm:text-5xl font-black text-white">
              {formatTimer(timerSeconds)}
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-3 py-1 rounded bg-white/20 text-xs font-bold hover:bg-white/30 text-white flex items-center gap-1"
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTimerRunning ? 'Pause' : 'Resume'}
              </button>
              <button
                type="button"
                onClick={() => setTimerSeconds(0)}
                className="px-3 py-1 rounded bg-white/10 text-xs font-semibold hover:bg-white/20 text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800">Active: {activeDay.dayTitle}</h4>
            <p className="text-slate-500">
              Keep proper form on each set. Take 60-90 seconds rest intervals between heavy compound movements.
            </p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWorkoutSessionActive(false)}
            >
              Minimize
            </Button>
            <Button
              size="sm"
              onClick={finishLiveWorkout}
            >
              Finish & Save Workout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MemberWorkoutsPage;
