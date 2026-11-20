import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Filter,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';

const DEFAULT_RENEWAL_RECORDS = [
  {
    id: 'ren-1',
    memberId: 'MEM-4094',
    memberName: 'Aarav Sharma',
    membershipPlan: 'Annual Elite Unlimited Access',
    expiryDate: '2026-12-15',
    daysLeft: 25,
    renewalAmount: 18500,
    discount: 1500,
    finalAmount: 17000,
    billingStatus: 'Upcoming',
  },
  {
    id: 'ren-2',
    memberId: 'MEM-4095',
    memberName: 'Rohan Mehra',
    membershipPlan: 'Strength + Hypertrophy 6 Months',
    expiryDate: '2026-11-28',
    daysLeft: 8,
    renewalAmount: 14000,
    discount: 1000,
    finalAmount: 13000,
    billingStatus: 'Expiring Soon',
  },
  {
    id: 'ren-3',
    memberId: 'MEM-4096',
    memberName: 'Pooja Verma',
    membershipPlan: 'Quarterly Performance Tier',
    expiryDate: '2026-11-14',
    daysLeft: -6,
    renewalAmount: 9500,
    discount: 500,
    finalAmount: 9000,
    billingStatus: 'Expired',
  },
  {
    id: 'ren-4',
    memberId: 'MEM-4097',
    memberName: 'Karan Kapoor',
    membershipPlan: 'Semi-Annual Powerlifting Pass',
    expiryDate: '2026-12-05',
    daysLeft: 15,
    renewalAmount: 12000,
    discount: 1000,
    finalAmount: 11000,
    billingStatus: 'Upcoming',
  },
];

export function BillingRenewalsPage() {
  const navigate = useNavigate();
  const { tenantMemberships } = useMembershipManagement();
  const { createInvoice, collectPayment } = useGymFinance();

  const [renewals, setRenewals] = useState(DEFAULT_RENEWAL_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Discount modal
  const [discountModalRecord, setDiscountModalRecord] = useState(null);
  const [customDiscount, setCustomDiscount] = useState(1000);

  const filteredRenewals = useMemo(() => {
    return renewals.filter((r) => {
      const matchSearch =
        r.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.membershipPlan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.billingStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [renewals, searchQuery, statusFilter]);

  const totalUpcomingRenewalValue = useMemo(() => {
    return renewals.reduce((sum, r) => sum + r.finalAmount, 0);
  }, [renewals]);

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    if (!discountModalRecord) return;
    const disc = Number(customDiscount) || 0;
    setRenewals((prev) =>
      prev.map((r) =>
        r.id === discountModalRecord.id
          ? {
              ...r,
              discount: disc,
              finalAmount: Math.max(0, r.renewalAmount - disc),
            }
          : r
      )
    );
    toast.success(`Discount of ₹${disc.toLocaleString('en-IN')} applied!`);
    setDiscountModalRecord(null);
  };

  const handleGenerateRenewalInvoice = (r) => {
    createInvoice({
      memberId: r.memberId,
      memberName: r.memberName,
      branchName: 'Downtown Main Arena',
      items: [
        {
          id: 1,
          description: `Renewal: ${r.membershipPlan}`,
          quantity: 1,
          unitPrice: r.renewalAmount,
          total: r.renewalAmount,
        },
      ],
      subtotal: r.renewalAmount,
      discount: r.discount,
      taxRate: 18,
      taxAmount: Math.round(((r.finalAmount) * 18) / 100),
      totalAmount: Math.round(r.finalAmount * 1.18),
      dueDate: r.expiryDate,
    });
    navigate('/gym/finance/invoices');
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Membership Billing & Renewal Cycles"
        description="Forecast monthly recurring revenue (MRR), automate plan renewal invoices, apply early-bird offers, and collect renewal dues."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Renewal Pipeline (30 Days)</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <RefreshCw className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">
            ₹{totalUpcomingRenewalValue.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Expected renewal renewals</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Expiring Within 10 Days</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-amber-600 mt-2">
            {renewals.filter((r) => r.daysLeft >= 0 && r.daysLeft <= 10).length} Members
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">High conversion priority</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Expired Memberships</span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-rose-700 mt-2">
            {renewals.filter((r) => r.daysLeft < 0).length} Members
          </h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">Win-back campaign eligible</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Average Retention Rate</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 mt-2">87.5%</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+3.1% YoY renewal health</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search member, membership tier, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Renewal Statuses' },
              { value: 'Expiring Soon', label: 'Expiring Soon (<= 10 Days)' },
              { value: 'Upcoming', label: 'Upcoming Renewals' },
              { value: 'Expired', label: 'Expired' },
            ]}
          />
        </div>
      </div>

      {/* Renewals Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Billing Pipeline Roster ({filteredRenewals.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member Name & ID</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Renewal Price</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Final Payable</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRenewals.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{row.memberName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{row.memberId}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{row.membershipPlan}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{row.expiryDate}</span>
                    <span
                      className={`block text-[10px] font-bold ${
                        row.daysLeft < 0
                          ? 'text-rose-600'
                          : row.daysLeft <= 10
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.daysLeft < 0
                        ? `Expired ${Math.abs(row.daysLeft)} days ago`
                        : `${row.daysLeft} days left`}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    ₹{row.renewalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-700 font-bold">
                    {row.discount > 0 ? `-₹${row.discount.toLocaleString('en-IN')}` : '₹0'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    ₹{row.finalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        row.billingStatus === 'Expired'
                          ? 'bg-rose-100 text-rose-800'
                          : row.billingStatus === 'Expiring Soon'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {row.billingStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDiscountModalRecord(row);
                          setCustomDiscount(row.discount || 1000);
                        }}
                        title="Apply Promotional Discount"
                      >
                        <Tag className="w-3.5 h-3.5 text-slate-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateRenewalInvoice(row)}
                        title="Generate Tax Invoice"
                      >
                        Invoice
                      </Button>
                      <Link to={`/gym/finance/collect?memberId=${row.memberId}`}>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          Renew
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Apply Discount */}
      {discountModalRecord && (
        <Modal
          isOpen={Boolean(discountModalRecord)}
          onClose={() => setDiscountModalRecord(null)}
          title={`Apply Renewal Discount: ${discountModalRecord.memberName}`}
          size="md"
        >
          <form onSubmit={handleApplyDiscount} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <p>
                <strong>Plan:</strong> {discountModalRecord.membershipPlan}
              </p>
              <p>
                <strong>Standard Renewal Fee:</strong>{' '}
                <span className="font-mono font-bold">
                  ₹{discountModalRecord.renewalAmount.toLocaleString('en-IN')}
                </span>
              </p>
            </div>

            <Input
              label="Promotional Discount (₹)"
              type="number"
              min="0"
              max={discountModalRecord.renewalAmount}
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              required
            />

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDiscountModalRecord(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Fee</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default BillingRenewalsPage;
