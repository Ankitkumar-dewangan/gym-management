import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageCircle,
  MessageSquare,
  Phone,
  PhoneCall,
  Plus,
  Search,
  Sparkles,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';

const INITIAL_FOLLOWUPS = [
  {
    id: 'FOL-01',
    leadName: 'Rohan Mehra',
    phone: '+91 98201 11223',
    channel: 'Phone Call',
    dueDate: '2026-11-20 (Today)',
    priority: 'High',
    topic: 'Follow up on 1-year Platinum tier proposal discount.',
    status: 'Pending',
    assignedStaff: 'Kunal Verma',
  },
  {
    id: 'FOL-02',
    leadName: 'Ananya Deshmukh',
    phone: '+91 98199 44556',
    channel: 'WhatsApp',
    dueDate: '2026-11-20 (Today)',
    priority: 'High',
    topic: 'Confirm free trial session booking for Saturday morning.',
    status: 'Pending',
    assignedStaff: 'Sneha Rao',
  },
  {
    id: 'FOL-03',
    leadName: 'Karan Malhotra',
    phone: '+91 97654 33221',
    channel: 'Phone Call',
    dueDate: '2026-11-21 (Tomorrow)',
    priority: 'Medium',
    topic: 'Discuss trainer availability for 6 AM weightlifting slots.',
    status: 'Pending',
    assignedStaff: 'Kunal Verma',
  },
  {
    id: 'FOL-04',
    leadName: 'Tanvi Joshi',
    phone: '+91 98200 44556',
    channel: 'WhatsApp',
    dueDate: '2026-11-18',
    priority: 'Low',
    topic: 'Sent seasonal corporate promotion brochure.',
    status: 'Completed',
    assignedStaff: 'Sneha Rao',
  },
];

export function FollowupsPage() {
  const [followups, setFollowups] = useState(INITIAL_FOLLOWUPS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFollowup, setNewFollowup] = useState({
    leadName: '',
    phone: '',
    channel: 'Phone Call',
    priority: 'Medium',
    topic: '',
    dueDate: '2026-11-21',
  });

  const handleToggleStatus = (id) => {
    setFollowups((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: f.status === 'Completed' ? 'Pending' : 'Completed',
            }
          : f
      )
    );
    toast.success('Follow-up task updated!');
  };

  const handleAddFollowup = (e) => {
    e.preventDefault();
    const created = {
      id: `FOL-${Math.floor(10 + Math.random() * 90)}`,
      ...newFollowup,
      status: 'Pending',
      assignedStaff: 'Sneha Rao',
    };
    setFollowups([created, ...followups]);
    setShowAddModal(false);
    toast.success(`Follow-up scheduled for ${created.leadName}!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Member & Lead Follow-ups"
        description="Schedule prospective member check-ins, sales calls, WhatsApp updates, and membership renewal reminders."
        actions={
          <Button
            size="sm"
            leftIcon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Schedule Follow-up
          </Button>
        }
      />

      {/* 4 Follow-up Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Due Today"
          value="2 Tasks"
          helperText="Requires contact today"
          icon={Clock}
        />
        <StatCard
          label="Upcoming This Week"
          value="5 Tasks"
          helperText="Scheduled calls & visits"
          icon={Calendar}
        />
        <StatCard
          label="Completed"
          value="34 Calls"
          helperText="Finished in current cycle"
          icon={CheckCircle2}
        />
        <StatCard
          label="Response Rate"
          value="78%"
          helperText="Leads connected successfully"
          icon={PhoneCall}
        />
      </div>

      {/* Task List */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-800">Actionable Reminders</h3>
          <span className="text-xs text-slate-400">{followups.length} scheduled reminders</span>
        </div>

        <div className="space-y-3">
          {followups.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                task.status === 'Completed'
                  ? 'bg-slate-50/60 border-slate-200 opacity-70'
                  : 'bg-white border-slate-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(task.id)}
                  className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 shrink-0 transition-colors ${
                    task.status === 'Completed'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-primary-500 bg-white'
                  }`}
                >
                  {task.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-bold text-xs sm:text-sm ${
                        task.status === 'Completed'
                          ? 'line-through text-slate-400'
                          : 'text-slate-800'
                      }`}
                    >
                      {task.leadName}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">({task.phone})</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{task.topic}</p>
                  <span className="text-[11px] text-slate-400 block">
                    Due: <strong>{task.dueDate}</strong> · Staff: {task.assignedStaff} · Channel: {task.channel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => toast.success(`Simulated call to ${task.phone}...`)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-primary-600" />
                  <span>Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.success(`Opened WhatsApp chat for ${task.leadName}!`)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Schedule Follow-up Call or Nudge"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddFollowup} className="p-6 space-y-4">
          <Input
            label="Prospect / Member Name"
            required
            value={newFollowup.leadName}
            onChange={(e) => setNewFollowup({ ...newFollowup, leadName: e.target.value })}
          />
          <Input
            label="Phone Number"
            required
            value={newFollowup.phone}
            onChange={(e) => setNewFollowup({ ...newFollowup, phone: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Contact Channel"
              value={newFollowup.channel}
              onChange={(e) => setNewFollowup({ ...newFollowup, channel: e.target.value })}
              options={[
                { value: 'Phone Call', label: 'Phone Call' },
                { value: 'WhatsApp', label: 'WhatsApp Message' },
                { value: 'In-person Visit', label: 'In-person Desk Visit' },
              ]}
            />
            <Select
              label="Priority Level"
              value={newFollowup.priority}
              onChange={(e) => setNewFollowup({ ...newFollowup, priority: e.target.value })}
              options={[
                { value: 'High', label: 'High Priority' },
                { value: 'Medium', label: 'Medium Priority' },
                { value: 'Low', label: 'Low Priority' },
              ]}
            />
          </div>
          <Input
            label="Scheduled Date"
            type="date"
            required
            value={newFollowup.dueDate}
            onChange={(e) => setNewFollowup({ ...newFollowup, dueDate: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Discussion Topic & Agenda
            </label>
            <textarea
              rows={2}
              required
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              placeholder="e.g. Discuss trial visit and special seasonal discount."
              value={newFollowup.topic}
              onChange={(e) => setNewFollowup({ ...newFollowup, topic: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Reminder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default FollowupsPage;
