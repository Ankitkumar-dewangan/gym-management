import { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building2,
  ArrowUpRight,
  FileText,
  UserCheck,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/ui/Modal';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';

export default function ReceiptsPage() {
  const { receipts } = useGymFinance();
  const { branches } = useTenant();

  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [activeReceipt, setActiveReceipt] = useState(null);

  const filteredReceipts = useMemo(() => {
    return (receipts || []).filter((r) => {
      const matchSearch =
        !search ||
        r.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
        r.memberName?.toLowerCase().includes(search.toLowerCase()) ||
        r.memberId?.toLowerCase().includes(search.toLowerCase()) ||
        r.ref?.toLowerCase().includes(search.toLowerCase());

      const matchMethod = selectedMethod === 'all' || r.method === selectedMethod;
      const matchDate = !dateFilter || r.date === dateFilter;

      return matchSearch && matchMethod && matchDate;
    });
  }, [receipts, search, selectedMethod, dateFilter]);

  const totalValue = filteredReceipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = filteredReceipts.filter((r) => r.date === todayStr).length;

  const exportCSV = () => {
    const headers = ['Receipt No', 'Member ID', 'Member Name', 'Amount (INR)', 'Method', 'Date', 'Reference', 'Issued By'];
    const rows = filteredReceipts.map((r) => [
      r.receiptNumber,
      r.memberId,
      `"${r.memberName}"`,
      r.amount,
      r.method,
      r.date,
      r.ref || '—',
      `"${r.generatedBy || 'Front Desk'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Receipts_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Receipts"
        description="Official payment acknowledgement receipts generated for member fees and services."
        actions={
          <Button variant="outline" size="sm" leftIcon={Download} onClick={exportCSV}>
            Export Receipts CSV
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Receipts</span>
            <div className="p-2 rounded-lg bg-navy-50 text-navy-800">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{filteredReceipts.length}</div>
          <p className="mt-1 text-xs text-slate-500">Acknowledged payment records</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Collected Value</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">₹{totalValue.toLocaleString('en-IN')}</div>
          <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> 100% verified settlement
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Issued Today</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{todayCount}</div>
          <p className="mt-1 text-xs text-slate-500">Receipts generated on {todayStr}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by receipt #, member name, ID, or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
            />
          </div>

          <Select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            options={[
              { value: 'all', label: 'All Payment Modes' },
              { value: 'UPI', label: 'UPI / QR' },
              { value: 'Credit Card', label: 'Credit Card' },
              { value: 'Debit Card', label: 'Debit Card' },
              { value: 'Net Banking', label: 'Net Banking' },
              { value: 'Cash', label: 'Cash' },
            ]}
          />

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Filter by date"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Reference / Txn ID</th>
                <th className="px-4 py-3">Issued Date</th>
                <th className="px-4 py-3">Issued By</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No receipts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-navy-800">
                      {rec.receiptNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{rec.memberName}</div>
                      <div className="text-xs text-slate-400 font-mono">{rec.memberId}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ₹{Number(rec.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {rec.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {rec.ref || rec.transactionId || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {rec.date}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {rec.generatedBy || 'Front Desk'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={Eye}
                          onClick={() => setActiveReceipt(rec)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          leftIcon={Printer}
                          onClick={() => {
                            setActiveReceipt(rec);
                            setTimeout(() => window.print(), 300);
                          }}
                        >
                          Print
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

      {/* Thermal/Official Receipt Preview Modal */}
      {activeReceipt && (
        <Modal
          isOpen={Boolean(activeReceipt)}
          onClose={() => setActiveReceipt(null)}
          title="Payment Acknowledgment Receipt"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-slate-800" id="receipt-print-area">
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-200 pb-4">
              <div className="inline-flex p-2 rounded-xl bg-navy-900 text-gold-400 mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">MY GYM CLUB</h3>
              <p className="text-xs text-slate-500">Official Payment Voucher</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">GSTIN: 07AAAAA0000A1Z5</p>
            </div>

            {/* Receipt Metadata */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-navy-800">{activeReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-medium text-slate-700">{activeReceipt.date} 10:30 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-medium text-slate-700">{activeReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono text-slate-700">{activeReceipt.ref || activeReceipt.transactionId}</span>
              </div>
            </div>

            {/* Member Details */}
            <div className="border border-slate-100 p-3 rounded-lg text-xs space-y-1">
              <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">Received From:</span>
              <div className="font-bold text-sm text-slate-900">{activeReceipt.memberName}</div>
              <div className="text-slate-500 font-mono">Member ID: {activeReceipt.memberId}</div>
            </div>

            {/* Amount Box */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
              <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider">Amount Paid</span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                ₹{Number(activeReceipt.amount).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">Payment Status: Verified / Settled</div>
            </div>

            {/* Footer */}
            <div className="border-t border-dashed border-slate-200 pt-3 text-center text-xs text-slate-400 space-y-1">
              <p>Thank you for choosing My Gym Club!</p>
              <p className="text-[10px] text-slate-400">Computer generated receipt. No physical signature required.</p>
              <p className="text-[10px] font-medium text-slate-500 pt-1">Powered by AGP Empire</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                leftIcon={Printer}
                onClick={() => window.print()}
              >
                Print Receipt
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setActiveReceipt(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}