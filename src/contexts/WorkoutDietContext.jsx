import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  INITIAL_DIET_ASSIGNMENTS,
  INITIAL_DIET_PLANS,
  INITIAL_EXERCISES,
  INITIAL_FITNESS_PROFILES,
  INITIAL_FOOD_LIBRARY,
  INITIAL_WORKOUT_ASSIGNMENTS,
  INITIAL_WORKOUT_PLANS,
  INITIAL_WORKOUT_SCHEDULE_SESSIONS,
} from '../constants/workoutDietData';

const STORAGE_KEY = 'gympilot_workout_diet_store_v1';

const WorkoutDietContext = createContext(null);

export function WorkoutDietProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load workout/diet data from localStorage', e);
    }
    return {
      workoutPlans: INITIAL_WORKOUT_PLANS,
      exercises: INITIAL_EXERCISES,
      dietPlans: INITIAL_DIET_PLANS,
      foodLibrary: INITIAL_FOOD_LIBRARY,
      workoutAssignments: INITIAL_WORKOUT_ASSIGNMENTS,
      dietAssignments: INITIAL_DIET_ASSIGNMENTS,
      scheduleSessions: INITIAL_WORKOUT_SCHEDULE_SESSIONS,
      fitnessProfiles: INITIAL_FITNESS_PROFILES,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save workout/diet data to localStorage', e);
    }
  }, [data]);

  // Workout Plans CRUD
  const addWorkoutPlan = (newPlan) => {
    const id = `wp-${Date.now().toString().slice(-5)}`;
    const plan = {
      id,
      status: 'Active',
      assignedMembersCount: 0,
      days: [],
      ...newPlan,
    };
    setData((prev) => ({
      ...prev,
      workoutPlans: [plan, ...prev.workoutPlans],
    }));
    toast.success(`Workout plan "${plan.name}" created!`);
    return plan;
  };

  const updateWorkoutPlan = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      workoutPlans: prev.workoutPlans.map((p) =>
        p.id === id ? { ...p, ...updatedFields } : p
      ),
    }));
    toast.success('Workout plan updated!');
  };

  const deleteWorkoutPlan = (id) => {
    setData((prev) => ({
      ...prev,
      workoutPlans: prev.workoutPlans.filter((p) => p.id !== id),
    }));
    toast.success('Workout plan deleted');
  };

  const duplicateWorkoutPlan = (id) => {
    const existing = data.workoutPlans.find((p) => p.id === id);
    if (!existing) return;
    const copy = {
      ...existing,
      id: `wp-${Date.now().toString().slice(-5)}`,
      name: `${existing.name} (Copy)`,
      assignedMembersCount: 0,
    };
    setData((prev) => ({
      ...prev,
      workoutPlans: [copy, ...prev.workoutPlans],
    }));
    toast.success(`Duplicated "${existing.name}"`);
  };

  // Exercises CRUD
  const addExercise = (newEx) => {
    const id = `ex-${Date.now().toString().slice(-5)}`;
    const exercise = {
      id,
      suggestedSets: 3,
      suggestedReps: '10-12 reps',
      restTime: '60s',
      ...newEx,
    };
    setData((prev) => ({
      ...prev,
      exercises: [exercise, ...prev.exercises],
    }));
    toast.success(`Exercise "${exercise.name}" added to library`);
    return exercise;
  };

  const updateExercise = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) =>
        e.id === id ? { ...e, ...updatedFields } : e
      ),
    }));
    toast.success('Exercise updated');
  };

  const deleteExercise = (id) => {
    setData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((e) => e.id !== id),
    }));
    toast.success('Exercise removed');
  };

  // Diet Plans CRUD
  const addDietPlan = (newPlan) => {
    const id = `dp-${Date.now().toString().slice(-5)}`;
    const plan = {
      id,
      status: 'Active',
      assignedMembersCount: 0,
      meals: [],
      ...newPlan,
    };
    setData((prev) => ({
      ...prev,
      dietPlans: [plan, ...prev.dietPlans],
    }));
    toast.success(`Diet plan "${plan.name}" created!`);
    return plan;
  };

  const updateDietPlan = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      dietPlans: prev.dietPlans.map((d) =>
        d.id === id ? { ...d, ...updatedFields } : d
      ),
    }));
    toast.success('Diet plan updated!');
  };

  const deleteDietPlan = (id) => {
    setData((prev) => ({
      ...prev,
      dietPlans: prev.dietPlans.filter((d) => d.id !== id),
    }));
    toast.success('Diet plan deleted');
  };

  const duplicateDietPlan = (id) => {
    const existing = data.dietPlans.find((d) => d.id === id);
    if (!existing) return;
    const copy = {
      ...existing,
      id: `dp-${Date.now().toString().slice(-5)}`,
      name: `${existing.name} (Copy)`,
      assignedMembersCount: 0,
    };
    setData((prev) => ({
      ...prev,
      dietPlans: [copy, ...prev.dietPlans],
    }));
    toast.success(`Duplicated "${existing.name}"`);
  };

  // Food Library CRUD
  const addFood = (newFood) => {
    const id = `fd-${Date.now().toString().slice(-5)}`;
    const item = {
      id,
      ...newFood,
      calories: Number(newFood.calories) || 0,
      protein: Number(newFood.protein) || 0,
      carbs: Number(newFood.carbs) || 0,
      fats: Number(newFood.fats) || 0,
    };
    setData((prev) => ({
      ...prev,
      foodLibrary: [item, ...prev.foodLibrary],
    }));
    toast.success(`Added "${item.name}" to food database`);
    return item;
  };

  const updateFood = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      foodLibrary: prev.foodLibrary.map((f) =>
        f.id === id
          ? {
              ...f,
              ...updatedFields,
              calories: Number(updatedFields.calories ?? f.calories) || 0,
              protein: Number(updatedFields.protein ?? f.protein) || 0,
              carbs: Number(updatedFields.carbs ?? f.carbs) || 0,
              fats: Number(updatedFields.fats ?? f.fats) || 0,
            }
          : f
      ),
    }));
    toast.success('Food item updated');
  };

  const deleteFood = (id) => {
    setData((prev) => ({
      ...prev,
      foodLibrary: prev.foodLibrary.filter((f) => f.id !== id),
    }));
    toast.success('Food item removed');
  };

  // Assignments
  const assignWorkout = (assignment) => {
    const newId = `wa-${Date.now().toString().slice(-5)}`;
    const newEntry = {
      id: newId,
      status: 'Active',
      completedSessions: 0,
      totalSessions: 24,
      ...assignment,
    };
    setData((prev) => {
      // bump plan count
      const updatedPlans = prev.workoutPlans.map((p) =>
        p.id === assignment.workoutPlanId
          ? { ...p, assignedMembersCount: (p.assignedMembersCount || 0) + 1 }
          : p
      );
      return {
        ...prev,
        workoutPlans: updatedPlans,
        workoutAssignments: [newEntry, ...prev.workoutAssignments],
      };
    });
    toast.success(`Workout plan assigned to ${assignment.memberName || 'member'}!`);
    return newEntry;
  };

  const bulkAssignWorkout = ({ memberList, workoutPlanId, workoutPlanName, trainerName, startDate, endDate, weeklySchedule }) => {
    const newAssignments = memberList.map((m) => ({
      id: `wa-${Date.now().toString().slice(-5)}-${m.id}`,
      memberId: m.id,
      memberName: m.name,
      memberPhoto: m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      membershipStatus: m.membershipStatus || 'Active',
      workoutPlanId,
      workoutPlanName,
      trainerName: trainerName || 'Vikram Singh',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      weeklySchedule: weeklySchedule || 'Mon, Wed, Fri',
      status: 'Active',
      completedSessions: 0,
      totalSessions: 20,
    }));

    setData((prev) => {
      const updatedPlans = prev.workoutPlans.map((p) =>
        p.id === workoutPlanId
          ? { ...p, assignedMembersCount: (p.assignedMembersCount || 0) + memberList.length }
          : p
      );
      return {
        ...prev,
        workoutPlans: updatedPlans,
        workoutAssignments: [...newAssignments, ...prev.workoutAssignments],
      };
    });
    toast.success(`Workout assigned to ${memberList.length} members!`);
  };

  const assignDiet = (assignment) => {
    const newId = `da-${Date.now().toString().slice(-5)}`;
    const newEntry = {
      id: newId,
      status: 'Active',
      adherenceRate: 90,
      ...assignment,
    };
    setData((prev) => {
      const updatedPlans = prev.dietPlans.map((p) =>
        p.id === assignment.dietPlanId
          ? { ...p, assignedMembersCount: (p.assignedMembersCount || 0) + 1 }
          : p
      );
      return {
        ...prev,
        dietPlans: updatedPlans,
        dietAssignments: [newEntry, ...prev.dietAssignments],
      };
    });
    toast.success(`Diet plan assigned to ${assignment.memberName || 'member'}!`);
    return newEntry;
  };

  const bulkAssignDiet = ({ memberList, dietPlanId, dietPlanName, nutritionistName, startDate, endDate, targetCalories }) => {
    const newAssignments = memberList.map((m) => ({
      id: `da-${Date.now().toString().slice(-5)}-${m.id}`,
      memberId: m.id,
      memberName: m.name,
      memberPhoto: m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      dietPlanId,
      dietPlanName,
      nutritionistName: nutritionistName || 'Priya Patel',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      targetCalories: Number(targetCalories) || 2000,
      status: 'Active',
      adherenceRate: 85,
    }));

    setData((prev) => {
      const updatedPlans = prev.dietPlans.map((p) =>
        p.id === dietPlanId
          ? { ...p, assignedMembersCount: (p.assignedMembersCount || 0) + memberList.length }
          : p
      );
      return {
        ...prev,
        dietPlans: updatedPlans,
        dietAssignments: [...newAssignments, ...prev.dietAssignments],
      };
    });
    toast.success(`Diet plan assigned to ${memberList.length} members!`);
  };

  // Schedule sessions
  const addScheduleSession = (session) => {
    const newSession = {
      id: `wss-${Date.now().toString().slice(-5)}`,
      status: 'scheduled',
      burnCalories: 350,
      ...session,
    };
    setData((prev) => ({
      ...prev,
      scheduleSessions: [newSession, ...prev.scheduleSessions],
    }));
    toast.success('Workout session scheduled!');
    return newSession;
  };

  const updateScheduleSession = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      scheduleSessions: prev.scheduleSessions.map((s) =>
        s.id === id ? { ...s, ...updatedFields } : s
      ),
    }));
    toast.success('Session status updated');
  };

  const deleteScheduleSession = (id) => {
    setData((prev) => ({
      ...prev,
      scheduleSessions: prev.scheduleSessions.filter((s) => s.id !== id),
    }));
    toast.success('Session removed');
  };

  // Body Measurements / Fitness Profiles
  const updateFitnessProfile = (memberId, newEntry) => {
    setData((prev) => {
      const existing = prev.fitnessProfiles.find((p) => p.memberId === memberId);
      const heightM = ((newEntry.height || existing?.height || 170) / 100);
      const weightKg = Number(newEntry.weight) || (existing?.weight || 70);
      const calculatedBmi = Number((weightKg / (heightM * heightM)).toFixed(1));

      const updatedHistoryItem = {
        date: newEntry.date || new Date().toISOString().split('T')[0],
        weight: weightKg,
        bmi: calculatedBmi,
        bodyFat: Number(newEntry.bodyFat) || (existing?.bodyFat || 20),
        chest: Number(newEntry.chest) || (existing?.chest || 38),
        waist: Number(newEntry.waist) || (existing?.waist || 32),
        biceps: Number(newEntry.biceps) || (existing?.biceps || 14),
      };

      if (existing) {
        return {
          ...prev,
          fitnessProfiles: prev.fitnessProfiles.map((p) =>
            p.memberId === memberId
              ? {
                  ...p,
                  ...newEntry,
                  weight: weightKg,
                  bmi: calculatedBmi,
                  lastUpdated: updatedHistoryItem.date,
                  history: [...(p.history || []), updatedHistoryItem],
                }
              : p
          ),
        };
      } else {
        const newProfile = {
          memberId,
          memberName: newEntry.memberName || 'Member',
          gender: newEntry.gender || 'Male',
          age: Number(newEntry.age) || 28,
          height: Number(newEntry.height) || 170,
          weight: weightKg,
          targetWeight: Number(newEntry.targetWeight) || 68,
          bmi: calculatedBmi,
          bodyFat: Number(newEntry.bodyFat) || 20,
          muscleMass: Number(newEntry.muscleMass) || 30,
          chest: Number(newEntry.chest) || 38,
          waist: Number(newEntry.waist) || 32,
          hips: Number(newEntry.hips) || 38,
          biceps: Number(newEntry.biceps) || 14,
          thighs: Number(newEntry.thighs) || 22,
          calves: Number(newEntry.calves) || 14,
          lastUpdated: updatedHistoryItem.date,
          trainerRemarks: newEntry.trainerRemarks || 'New profile initialized.',
          history: [updatedHistoryItem],
        };
        return {
          ...prev,
          fitnessProfiles: [newProfile, ...prev.fitnessProfiles],
        };
      }
    });
    toast.success('Body measurements updated successfully!');
  };

  const resetToDefaults = () => {
    setData({
      workoutPlans: INITIAL_WORKOUT_PLANS,
      exercises: INITIAL_EXERCISES,
      dietPlans: INITIAL_DIET_PLANS,
      foodLibrary: INITIAL_FOOD_LIBRARY,
      workoutAssignments: INITIAL_WORKOUT_ASSIGNMENTS,
      dietAssignments: INITIAL_DIET_ASSIGNMENTS,
      scheduleSessions: INITIAL_WORKOUT_SCHEDULE_SESSIONS,
      fitnessProfiles: INITIAL_FITNESS_PROFILES,
    });
    toast.success('Reset workout and diet data to defaults');
  };

  return (
    <WorkoutDietContext.Provider
      value={{
        workoutPlans: data.workoutPlans,
        exercises: data.exercises,
        dietPlans: data.dietPlans,
        foodLibrary: data.foodLibrary,
        workoutAssignments: data.workoutAssignments,
        dietAssignments: data.dietAssignments,
        scheduleSessions: data.scheduleSessions,
        fitnessProfiles: data.fitnessProfiles,
        addWorkoutPlan,
        updateWorkoutPlan,
        deleteWorkoutPlan,
        duplicateWorkoutPlan,
        addExercise,
        updateExercise,
        deleteExercise,
        addDietPlan,
        updateDietPlan,
        deleteDietPlan,
        duplicateDietPlan,
        addFood,
        updateFood,
        deleteFood,
        assignWorkout,
        bulkAssignWorkout,
        assignDiet,
        bulkAssignDiet,
        addScheduleSession,
        updateScheduleSession,
        deleteScheduleSession,
        updateFitnessProfile,
        resetToDefaults,
      }}
    >
      {children}
    </WorkoutDietContext.Provider>
  );
}

export function useWorkoutDiet() {
  const ctx = useContext(WorkoutDietContext);
  if (!ctx) {
    throw new Error('useWorkoutDiet must be used within a WorkoutDietProvider');
  }
  return ctx;
}
