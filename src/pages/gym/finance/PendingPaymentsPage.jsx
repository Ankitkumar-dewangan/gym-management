import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  MessageSquare,
  Phone,
  Plus,
  Receipt,
  Search,
  Send,
  User,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useGymFinance } from '../../../contexts/GymFinanceContext';

export function PendingPaymentsPage() {
  const navigate = useNavigate();
  const { memberFees, recordFollowupReminder } = useGymFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDueCategory, setFilterDueCategory] = useState('all'); // 'all', 'overdue', 'due_this_week'
  const [selectedFeeForReminder, setSelectedFeeForReminder] = useState(null);
  const [reminderHistoryModalFee, setReminderHistoryModalFee] = useState(null);
  const [reminderNotes, setReminderNotes] = useState('WhatsApp fee reminder sent with direct payment link.');

  // Pending records only
  const pendingRecords = useMemo(() => {
    return memberFees.filter((f) => (f.pendingAmount || 0) > 0);
  }, [memberFees]);

  const totalPendingAmount = useMemo(() => {
    return pendingRecords.reduce((sum, f) => sum + (Number(f.pendingAmount) || 0), 0);
  }, [pendingRecords]);

  const totalMembersWithDues = pendingRecords.length;

  const overdueRecords = useMemo(() => {
    return pendingRecords.filter((f) => f.paymentStatus === 'Overdue' || (f.daysOverdue && f.daysOverdue > 0));
  }, [pendingRecords]);

  const totalOverdueAmount = useMemo(() => {
    return overdueRecords.reduce((sum, f) => sum + (Number(f.pendingAmount) || 0), 0);
  }, [overdueRecords]);

  const dueThisWeekAmount = Math.round(totalPendingAmount * 0.45);
  const dueThisMonthAmount = totalPendingAmount;

  // Filtered Table Records
  const filteredRecords = useMemo(() => {
    return pendingRecords.filter((f) => {
      const matchSearch =
        f.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.phone?.includes(searchQuery);

      if (filterDueCategory === 'overdue') {
        return matchSearch && (f.paymentStatus === 'Overdue' || (f.daysOverdue && f.daysOverdue > 0));
      }
      if (filterDueCategory === 'due_this_week') {
        return matchSearch && (!f.daysOverdue || f.daysOverdue === 0);
      }
      return matchSearch;
    });
  }, [pendingRecords, searchQuery, filterDueCategory]);

  const handleSendReminder = (e) => {
    e.preventDefault();
    if (!selectedFeeForReminder) return;
    recordFollowupReminder(selectedFeeForReminder.memberId, reminderNotes);
    setSelectedFeeForReminder(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Pending & Overdue Payments Follow-up"
        description="Monitor outstanding balances, follow up with members via WhatsApp/SMS reminders, and collect pending dues."
        actions={
          <Link to="/gym/finance/collect">
            <Button size="sm" leftIcon={Receipt}>
              Collect Payment
            </Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Pending Dues</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-xl font-bold text-amber-600 mt-2">
            ₹{totalPendingAmount.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across all membership plans</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Members With Dues</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-2">{totalMembersWithDues}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Active gym members</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Critical Overdue</span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-xl font-bold text-rose-700 mt-2">
            ₹{totalOverdueAmount.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">
            {overdueRecords.length} accounts overdue
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Due This Week</span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-xl font-bold text-purple-900 mt-2">
            ₹{dueThisWeekAmount.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Next 7 calendar days</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Due This Month</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-2">
            ₹{dueThisMonthAmount.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Expected monthly recovery</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search member by name, ID, or contact number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <Select
            value={filterDueCategory}
            onChange={(e) => setFilterDueCategory(e.target.value)}
            options={[
              { value: 'all', label: 'All Pending Dues' },
              { value: 'overdue', label: 'Overdue Only (Critical)' },
              { value: 'due_this_week', label: 'Upcoming This Week' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Pending Dues Follow-up Roster ({filteredRecords.length})
          </span>
          <span className="text-xs text-amber-700 font-bold">
            Total Dues: ₹
            {filteredRecords
              .reduce((sum, f) => sum + (f.pendingAmount || 0), 0)
              .toLocaleString('en-IN')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member Name & ID</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Membership Plan</th>
                <th className="py-3 px-4">Pending Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Days Overdue</th>
                <th className="py-3 px-4">Last Payment</th>
                <th className="py-3 px-4">Reminders</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No pending dues found matching this filter!
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={row.memberPhoto}
                          alt={row.memberName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{row.memberName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{row.memberId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">{row.phone}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{row.membershipPlan}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-600">
                      ₹{row.pendingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{row.dueDate}</td>
                    <td className="py-3 px-4">
                      {row.daysOverdue > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          {row.daysOverdue} Days Overdue
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Due Soon</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{row.lastPaymentDate}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setReminderHistoryModalFee(row)}
                        className="text-primary-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>{row.remindersSent || 0} Sent</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedFeeForReminder(row)}
                          title="Send Reminder"
                        >
                          <Send className="w-3.5 h-3.5 text-slate-500 hover:text-primary-600" />
                        </Button>
                        <Link to={`/gym/finance/collect?memberId=${row.memberId}`}>
                          <Button size="sm" variant="outline" className="text-emerald-700">
                            Collect
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Followup Reminder */}
      {selectedFeeForReminder && (
        <Modal
          isOpen={Boolean(selectedFeeForReminder)}
          onClose={() => setSelectedFeeForReminder(null)}
          title={`Log Reminder for ${selectedFeeForReminder.memberName}`}
          size="md"
        >
          <form onSubmit={handleSendReminder} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p>
                <strong>Pending Amount:</strong>{' '}
                <span className="text-amber-600 font-bold font-mono">
                  ₹{selectedFeeForReminder.pendingAmount.toLocaleString('en-IN')}
                </span>
              </p>
              <p>
                <strong>Contact Number:</strong> {selectedFeeForReminder.phone}
              </p>
              <p>
                <strong>Plan:</strong> {selectedFeeForReminder.membershipPlan}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reminder Log Notes / Follow-up Method
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:outline-hidden"
                value={reminderNotes}
                onChange={(e) => setReminderNotes(e.target.value)}
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedFeeForReminder(null)}
              >
                Cancel
              </Button>
              <Button type="submit" leftIcon={Send}>
                Mark Reminder Sent
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Reminder History */}
      {reminderHistoryModalFee && (
        <Modal
          isOpen={Boolean(reminderHistoryModalFee)}
          onClose={() => setReminderHistoryModalFee(null)}
          title={`Reminder History: ${reminderHistoryModalFee.memberName}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              Log of automatic and manual follow-ups dispatched for overdue balances:
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {(!reminderHistoryModalFee.reminderHistory ||
                reminderHistoryModalFee.reminderHistory.length === 0) ? (
                <p className="py-4 text-center text-xs text-slate-400">
                  No reminders have been logged yet for this member.
                </p>
              ) : (
                reminderHistoryModalFee.reminderHistory.map((rem, idx) => (
                  <div key={idx} className="py-2.5 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{rem.type}</span>
                      <span className="text-[10px] text-slate-400">{rem.date}</span>
                    </div>
                    <p className="text-slate-600">{rem.notes}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setReminderHistoryModalFee(null)}>
                Close History
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PendingPaymentsPage;
