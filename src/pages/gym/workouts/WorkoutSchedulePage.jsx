import { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Filter,
  Plus,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useWorkoutDiet } from '../../../contexts/WorkoutDietContext';

export function WorkoutSchedulePage() {
  const {
    scheduleSessions,
    workoutPlans,
    addScheduleSession,
    updateScheduleSession,
    deleteScheduleSession,
  } = useWorkoutDiet();

  const [viewMode, setViewMode] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'
  const [selectedDate, setSelectedDate] = useState('2026-11-20');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);

  const [newSessionForm, setNewSessionForm] = useState({
    date: '2026-11-20',
    time: '08:00 AM',
    memberName: 'Aarav Sharma',
    memberId: 'MEM-4094',
    workoutPlanName: workoutPlans[0]?.name || 'Beginner Weight Loss',
    trainerName: 'Vikram Singh',
    routineTitle: 'Day 1: Full Body Circuit',
    status: 'scheduled',
    notes: '',
  });

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return scheduleSessions.filter((s) => {
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      if (viewMode === 'daily') {
        return s.date === selectedDate && matchStatus;
      }
      return matchStatus;
    });
  }, [scheduleSessions, viewMode, selectedDate, statusFilter]);

  const handleCreateSession = (e) => {
    e.preventDefault();
    addScheduleSession(newSessionForm);
    setIsScheduleModalOpen(false);
  };

  const handleStatusChange = (id, newStatus) => {
    updateScheduleSession(id, { status: newStatus });
    if (selectedSessionDetail?.id === id) {
      setSelectedSessionDetail((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'missed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Missed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Schedule & Session Calendar"
        description="Track daily member training appointments, floor routines, completed sessions, and trainer coaching allocations."
        actions={
          <Button onClick={() => setIsScheduleModalOpen(true)} leftIcon={Plus}>
            Schedule Workout Session
          </Button>
        }
      />

      {/* Control Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* View Mode Toggle */}
        <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50">
          {['daily', 'weekly', 'monthly'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                viewMode === mode
                  ? 'bg-white text-primary-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode} Calendar
            </button>
          ))}
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Session Statuses' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'completed', label: 'Completed' },
              { value: 'missed', label: 'Missed' },
            ]}
          />
        </div>
      </div>

      {/* Session Cards Grid / Schedule View */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No workout sessions scheduled"
          description="There are no training sessions for the selected calendar range or filter."
          action={
            <Button size="sm" onClick={() => setIsScheduleModalOpen(true)} leftIcon={Plus}>
              Schedule New Session
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setSelectedSessionDetail(session)}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-md hover:border-primary-400 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-primary-600" />
                  <span>{session.time}</span>
                  <span className="text-slate-300">•</span>
                  <span>{session.date}</span>
                </div>
                {getStatusBadge(session.status)}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">{session.memberName}</h4>
                <p className="text-xs text-primary-600 font-medium">{session.workoutPlanName}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{session.routineTitle}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Trainer: <strong>{session.trainerName}</strong>
                </span>
                {session.burnCalories > 0 && (
                  <span className="text-emerald-600 font-semibold">
                    🔥 {session.burnCalories} kcal
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Schedule New Session */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Workout Session"
        size="md"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <Input
            label="Member Name"
            value={newSessionForm.memberName}
            onChange={(e) =>
              setNewSessionForm({ ...newSessionForm, memberName: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Session Date"
              type="date"
              value={newSessionForm.date}
              onChange={(e) =>
                setNewSessionForm({ ...newSessionForm, date: e.target.value })
              }
              required
            />
            <Input
              label="Session Time"
              value={newSessionForm.time}
              onChange={(e) =>
                setNewSessionForm({ ...newSessionForm, time: e.target.value })
              }
              placeholder="e.g. 07:30 AM"
              required
            />
          </div>

          <Select
            label="Workout Plan"
            value={newSessionForm.workoutPlanName}
            onChange={(e) =>
              setNewSessionForm({ ...newSessionForm, workoutPlanName: e.target.value })
            }
            options={workoutPlans.map((p) => ({ value: p.name, label: p.name }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Assigned Trainer"
              value={newSessionForm.trainerName}
              onChange={(e) =>
                setNewSessionForm({ ...newSessionForm, trainerName: e.target.value })
              }
              required
            />
            <Input
              label="Routine Focus"
              value={newSessionForm.routineTitle}
              onChange={(e) =>
                setNewSessionForm({ ...newSessionForm, routineTitle: e.target.value })
              }
              placeholder="e.g. Day 1: Upper Body"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Session Notes</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:outline-hidden"
              value={newSessionForm.notes}
              onChange={(e) =>
                setNewSessionForm({ ...newSessionForm, notes: e.target.value })
              }
              placeholder="Special instructions or member requests..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Schedule Session</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View & Update Session Details */}
      {selectedSessionDetail && (
        <Modal
          isOpen={Boolean(selectedSessionDetail)}
          onClose={() => setSelectedSessionDetail(null)}
          title="Workout Session Details"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-500 font-bold">
                  {selectedSessionDetail.date} · {selectedSessionDetail.time}
                </span>
                {getStatusBadge(selectedSessionDetail.status)}
              </div>
              <h3 className="font-bold text-base text-slate-800">
                {selectedSessionDetail.memberName}
              </h3>
              <p className="text-xs text-primary-600 font-semibold">
                {selectedSessionDetail.workoutPlanName}
              </p>
              <p className="text-xs text-slate-600">{selectedSessionDetail.routineTitle}</p>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                <strong>Assigned Trainer:</strong> {selectedSessionDetail.trainerName}
              </p>
              {selectedSessionDetail.notes && (
                <p>
                  <strong>Notes:</strong> {selectedSessionDetail.notes}
                </p>
              )}
            </div>

            {/* Quick Status Toggles */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">Update Status:</span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(selectedSessionDetail.id, 'completed')}
                  className="text-emerald-700 hover:bg-emerald-50"
                >
                  Mark Completed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(selectedSessionDetail.id, 'missed')}
                  className="text-rose-700 hover:bg-rose-50"
                >
                  Mark Missed
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    deleteScheduleSession(selectedSessionDetail.id);
                    setSelectedSessionDetail(null);
                  }}
                  className="text-slate-400 hover:text-rose-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default WorkoutSchedulePage;
