import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpDown,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import {
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
} from '../../../constants/gymFinanceData';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';

export function FinanceTransactionsPage() {
  const { branches } = useTenant();
  const { transactions, createRefundRequest } = useGymFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Modal & Refund Modal
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundForm, setRefundForm] = useState({
    amount: '',
    reason: 'Member schedule conflict',
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.ref?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'all' || tx.type === typeFilter;
      const matchMethod = methodFilter === 'all' || tx.method === methodFilter;
      const matchBranch = branchFilter === 'all' || tx.branchName === branchFilter;
      const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
      return matchSearch && matchType && matchMethod && matchBranch && matchStatus;
    });
  }, [transactions, searchQuery, typeFilter, methodFilter, branchFilter, statusFilter]);

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Member Name', 'Type', 'Amount', 'Method', 'Date', 'Ref', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.memberName,
      t.type,
      t.amount,
      t.method,
      t.date,
      t.ref,
      t.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gym_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transactions exported to CSV!');
  };

  const openRefundModal = (tx) => {
    setSelectedTxn(tx);
    setRefundForm({
      amount: tx.amount,
      reason: 'Member cancellation or double payment',
    });
    setRefundModalOpen(true);
  };

  const handleRefundSubmit = (e) => {
    e.preventDefault();
    if (!selectedTxn) return;
    createRefundRequest({
      transactionId: selectedTxn.id,
      memberId: selectedTxn.memberId,
      memberName: selectedTxn.memberName,
      amount: Number(refundForm.amount) || selectedTxn.amount,
      reason: refundForm.reason,
    });
    setRefundModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Payment Transactions Ledger"
        description="Audit membership dues, personal training enrollments, locker fees, and settlement references across all payment gateways."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExportCSV} leftIcon={Download}>
              Export CSV
            </Button>
            <Link to="/gym/finance/collect">
              <Button size="sm" leftIcon={Plus}>
                Record Payment
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by transaction ID, member name, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Transaction Types' },
              ...TRANSACTION_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />

          <Select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Payment Modes' },
              ...PAYMENT_METHODS.map((m) => ({ value: m, label: m })),
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Failed', label: 'Failed' },
              { value: 'Refunded', label: 'Refunded' },
            ]}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            {filteredTransactions.length} Transactions Found
          </span>
          <span className="text-xs text-slate-500">
            Total Inflow:{' '}
            <strong className="text-emerald-700 font-mono">
              ₹
              {filteredTransactions
                .reduce((acc, t) => acc + (t.status === 'Completed' ? Number(t.amount) : 0), 0)
                .toLocaleString('en-IN')}
            </strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{tx.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{tx.memberName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{tx.method}</td>
                    <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{tx.ref}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedTxn(tx)}
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openRefundModal(tx)}
                          title="Initiate Refund"
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Transaction Details */}
      {selectedTxn && !refundModalOpen && (
        <Modal
          isOpen={Boolean(selectedTxn)}
          onClose={() => setSelectedTxn(null)}
          title={`Transaction: ${selectedTxn.id}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono">{selectedTxn.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {selectedTxn.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800">{selectedTxn.memberName}</h3>
              <p className="font-mono text-xl font-extrabold text-emerald-700">
                ₹{selectedTxn.amount.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="space-y-2 divide-y divide-slate-100 text-slate-600">
              <div className="flex justify-between pt-1">
                <span>Payment Type:</span>
                <strong className="text-slate-800">{selectedTxn.type}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span>Payment Mode:</span>
                <strong className="text-slate-800">{selectedTxn.method}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span>Date & Time:</span>
                <span>{selectedTxn.date}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Bank / UPI Ref:</span>
                <span className="font-mono font-medium">{selectedTxn.ref}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Branch Location:</span>
                <span>{selectedTxn.branchName || 'Downtown Main Arena'}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 block mb-0.5">Notes:</span>
                <p className="text-slate-700 italic">{selectedTxn.notes || 'None'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                leftIcon={Printer}
              >
                Print
              </Button>
              <Button size="sm" onClick={() => setSelectedTxn(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Refund Request */}
      {selectedTxn && refundModalOpen && (
        <Modal
          isOpen={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          title={`Initiate Refund for ${selectedTxn.id}`}
          size="md"
        >
          <form onSubmit={handleRefundSubmit} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
              Recording refund for <strong>{selectedTxn.memberName}</strong>. Original payment:{' '}
              <strong>₹{selectedTxn.amount.toLocaleString('en-IN')}</strong> via {selectedTxn.method}.
            </div>

            <Input
              label="Refund Amount (₹)"
              type="number"
              max={selectedTxn.amount}
              value={refundForm.amount}
              onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reason for Refund Request
              </label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:outline-hidden"
                value={refundForm.reason}
                onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRefundModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" leftIcon={RotateCcw}>
                Submit Refund Claim
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default FinanceTransactionsPage;
