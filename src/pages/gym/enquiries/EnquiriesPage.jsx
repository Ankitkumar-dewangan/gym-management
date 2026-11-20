import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';

const INITIAL_ENQUIRIES = [
  {
    id: 'ENQ-101',
    name: 'Rohan Mehra',
    phone: '+91 98201 11223',
    email: 'rohan.mehra@gmail.com',
    source: 'Walk-in',
    branch: 'Downtown Arena',
    goal: 'Weight Loss & Personal Training',
    status: 'New',
    date: '2026-11-20',
    assignedStaff: 'Kunal Verma',
  },
  {
    id: 'ENQ-102',
    name: 'Ananya Deshmukh',
    phone: '+91 98199 44556',
    email: 'ananya.d@yahoo.com',
    source: 'Website Form',
    branch: 'Downtown Arena',
    goal: 'Strength & Conditioning',
    status: 'Trial Booked',
    date: '2026-11-19',
    assignedStaff: 'Sneha Rao',
  },
  {
    id: 'ENQ-103',
    name: 'Karan Malhotra',
    phone: '+91 97654 33221',
    email: 'karan.m@gmail.com',
    source: 'Instagram Ads',
    branch: 'West Coast Studio',
    goal: 'Muscle Hypertrophy',
    status: 'Contacted',
    date: '2026-11-18',
    assignedStaff: 'Kunal Verma',
  },
  {
    id: 'ENQ-104',
    name: 'Pooja Hegde',
    phone: '+91 98332 55667',
    email: 'pooja.h@outlook.com',
    source: 'Member Referral',
    branch: 'Downtown Arena',
    goal: 'Yoga & Functional Mobility',
    status: 'Converted',
    date: '2026-11-16',
    assignedStaff: 'Sneha Rao',
  },
  {
    id: 'ENQ-105',
    name: 'Devendra Patel',
    phone: '+91 98210 99881',
    email: 'dev.patel@gmail.com',
    source: 'Walk-in',
    branch: 'Downtown Arena',
    goal: 'General Wellness',
    status: 'Lost',
    date: '2026-11-14',
    assignedStaff: 'Kunal Verma',
  },
];

export function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newEnquiry, setNewEnquiry] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Walk-in',
    branch: 'Downtown Arena',
    goal: 'Fat Loss & Fitness',
  });

  const filtered = enquiries.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || item.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddEnquiry = (e) => {
    e.preventDefault();
    const created = {
      id: `ENQ-${Math.floor(100 + Math.random() * 900)}`,
      ...newEnquiry,
      status: 'New',
      date: new Date().toISOString().split('T')[0],
      assignedStaff: 'Sneha Rao',
    };
    setEnquiries([created, ...enquiries]);
    setShowAddModal(false);
    toast.success(`Enquiry created for ${created.name}!`);
    setNewEnquiry({
      name: '',
      phone: '',
      email: '',
      source: 'Walk-in',
      branch: 'Downtown Arena',
      goal: 'Fat Loss & Fitness',
    });
  };

  const handleConvertToMember = (item) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === item.id ? { ...e, status: 'Converted' } : e))
    );
    toast.success(`${item.name} marked as Converted to Member!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Walk-in & Online Enquiries"
        description="Capture prospective fitness members from walk-ins, digital campaigns, trial passes, and member referrals."
        actions={
          <Button
            size="sm"
            leftIcon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add New Enquiry
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Leads"
          value={String(enquiries.length + 120)}
          helperText="All tracked inquiries"
          icon={MessageSquare}
        />
        <StatCard
          label="New Leads Today"
          value="6"
          helperText="Requires immediate triage"
          icon={Sparkles}
        />
        <StatCard
          label="Trial Visits Booked"
          value="14"
          helperText="Free gym trial passes"
          icon={Calendar}
        />
        <StatCard
          label="Lead Conversion"
          value="42%"
          helperText="Converted to active plans"
          icon={TrendingUp}
        />
      </div>

      {/* Ledger Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-base text-slate-800">Lead Registry</h3>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="w-40">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'NEW', label: 'New' },
                  { value: 'CONTACTED', label: 'Contacted' },
                  { value: 'TRIAL BOOKED', label: 'Trial Booked' },
                  { value: 'CONVERTED', label: 'Converted' },
                  { value: 'LOST', label: 'Lost' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-5">ID & Lead Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Channel Source</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Fitness Goal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-3 px-5">
                    <strong className="text-slate-800 block">{row.name}</strong>
                    <span className="font-mono text-[11px] text-slate-400">{row.id} · {row.date}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-700 block">{row.phone}</span>
                    <span className="text-slate-400 text-[11px]">{row.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {row.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{row.branch}</td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-600">{row.goal}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        row.status === 'Converted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.status === 'New'
                          ? 'bg-blue-100 text-blue-800'
                          : row.status === 'Trial Booked'
                          ? 'bg-purple-100 text-purple-800'
                          : row.status === 'Contacted'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    {row.status !== 'Converted' ? (
                      <button
                        type="button"
                        onClick={() => handleConvertToMember(row)}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Convert Member
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Enrolled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Walk-in Lead */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Prospect Enquiry"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddEnquiry} className="p-6 space-y-4">
          <Input
            label="Prospect Full Name"
            required
            value={newEnquiry.name}
            onChange={(e) => setNewEnquiry({ ...newEnquiry, name: e.target.value })}
          />
          <Input
            label="Mobile Number"
            required
            value={newEnquiry.phone}
            onChange={(e) => setNewEnquiry({ ...newEnquiry, phone: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            value={newEnquiry.email}
            onChange={(e) => setNewEnquiry({ ...newEnquiry, email: e.target.value })}
          />
          <Select
            label="Acquisition Source"
            value={newEnquiry.source}
            onChange={(e) => setNewEnquiry({ ...newEnquiry, source: e.target.value })}
            options={[
              { value: 'Walk-in', label: 'Walk-in Front Desk' },
              { value: 'Website Form', label: 'Website Landing Page' },
              { value: 'Instagram Ads', label: 'Instagram / Facebook Ad' },
              { value: 'Member Referral', label: 'Member Referral' },
            ]}
          />
          <Select
            label="Target Branch"
            value={newEnquiry.branch}
            onChange={(e) => setNewEnquiry({ ...newEnquiry, branch: e.target.value })}
            options={[
              { value: 'Downtown Arena', label: 'Downtown Arena' },
              { value: 'West Coast Studio', label: 'West Coast Studio' },
            ]}
          />
          <Input
            label="Fitness Objective"
            value={newEnquiry.goal}
            onChange={(e) => setNewEnquiry({ ...newEnquiry, goal: e.target.value })}
          />

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
              Save Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EnquiriesPage;
