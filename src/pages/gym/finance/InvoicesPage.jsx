import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download,
  Eye,
  FileText,
  Filter,
  Plus,
  Printer,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { INVOICE_STATUSES } from '../../../constants/gymFinanceData';
import { useGymFinance } from '../../../contexts/GymFinanceContext';

export function InvoicesPage() {
  const navigate = useNavigate();
  const { invoices, updateInvoiceStatus } = useGymFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewInvoice, setViewInvoice] = useState(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.memberId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
            Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
            Partially Paid
          </span>
        );
      case 'Overdue':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
            Overdue
          </span>
        );
      case 'Issued':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
            Issued
          </span>
        );
      case 'Draft':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
            Draft
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-600">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Tax Invoice Management"
        description="Generate GST-compliant tax invoices, track invoice payment lifecycles, and export itemized billing documentation."
        actions={
          <Link to="/gym/finance/invoices/create">
            <Button size="sm" leftIcon={Plus}>
              Create New Invoice
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by invoice #, member name, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Invoice Statuses' },
              ...INVOICE_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Invoices Directory ({filteredInvoices.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">GST (18%)</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{inv.memberName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{inv.memberId}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inv.date}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>
                    <td className="py-3 px-4 font-mono">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      ₹{(inv.taxAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(inv.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewInvoice(inv)}
                          title="View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            window.print();
                          }}
                          title="Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
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

      {/* Modal: View A4 Invoice */}
      {viewInvoice && (
        <Modal
          isOpen={Boolean(viewInvoice)}
          onClose={() => setViewInvoice(null)}
          title={`Tax Invoice: ${viewInvoice.invoiceNumber}`}
          size="lg"
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">PULSE FITNESS STUDIO</h2>
                <p className="text-xs text-slate-500">GSTIN: 27AABCU9603R1ZM</p>
                <p className="text-xs text-slate-500">Andheri West, Mumbai, Maharashtra - 400053</p>
                <p className="text-xs text-slate-500">support@mygymclub.com · +91 22 2844 9011</p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase bg-slate-100 text-slate-800">
                  TAX INVOICE
                </span>
                <p className="font-mono font-bold text-sm text-slate-900 mt-2">
                  {viewInvoice.invoiceNumber}
                </p>
                <p className="text-xs text-slate-500">Date: {viewInvoice.date}</p>
                <p className="text-xs text-slate-500">Due: {viewInvoice.dueDate}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Billed To (Member Details)
              </span>
              <p className="font-bold text-sm text-slate-800">{viewInvoice.memberName}</p>
              <p className="text-slate-600 font-mono">Member ID: {viewInvoice.memberId}</p>
              <p className="text-slate-500">{viewInvoice.memberAddress || 'Mumbai, India'}</p>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(viewInvoice.items || []).map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="p-2.5 font-medium text-slate-800">{it.description}</td>
                    <td className="p-2.5 text-center">{it.quantity}</td>
                    <td className="p-2.5 text-right font-mono">₹{it.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      ₹{it.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 border-t border-slate-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-mono">₹{viewInvoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {viewInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{viewInvoice.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">CGST (9%) + SGST (9%):</span>
                  <span className="font-mono">₹{(viewInvoice.taxAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-1 text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono">₹{viewInvoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700">Terms & Conditions:</p>
              <p>{viewInvoice.terms || '1. Fees once deposited are non-refundable.\n2. Access requires active membership pass.'}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={Printer}
              >
                Print Invoice
              </Button>
              <Button size="sm" onClick={() => setViewInvoice(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default InvoicesPage;
