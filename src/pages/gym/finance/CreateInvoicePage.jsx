import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Plus,
  Printer,
  Save,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const { branches } = useTenant();
  const { memberFees, createInvoice } = useGymFinance();

  const [invoiceNumber] = useState(`INV-2026-${Date.now().toString().slice(-4)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [branchName, setBranchName] = useState(branches[0]?.name || 'Downtown Main Arena');

  // Member selection
  const [selectedMemberId, setSelectedMemberId] = useState(memberFees[0]?.memberId || '');
  const selectedMember = useMemo(() => {
    return memberFees.find((m) => m.memberId === selectedMemberId) || memberFees[0];
  }, [memberFees, selectedMemberId]);

  const [memberAddress, setMemberAddress] = useState('Flat 402, Sea View Towers, Bandra West, Mumbai');

  // Line items
  const [items, setItems] = useState([
    { id: 1, description: 'Annual Elite Gym Membership (12 Months)', quantity: 1, unitPrice: 18500 },
  ]);

  const [discount, setDiscount] = useState(1000);
  const [taxRate, setTaxRate] = useState(18); // 18% GST
  const [notes, setNotes] = useState('Includes access to strength floor, sauna, and locker.');
  const [terms, setTerms] = useState('Fees once paid are non-refundable. Member pass is non-transferable.');

  const [previewOpen, setPreviewOpen] = useState(false);

  // Computed calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0), 0);
  }, [items]);

  const taxableAmount = Math.max(0, subtotal - (Number(discount) || 0));
  const taxAmount = Math.round((taxableAmount * (Number(taxRate) || 0)) / 100);
  const totalAmount = taxableAmount + taxAmount;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), description: 'Personal Training Package (10 Sessions)', quantity: 1, unitPrice: 6000 },
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      toast.error('Invoice must contain at least one item');
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMember) {
      toast.error('Please select a member');
      return;
    }

    createInvoice({
      invoiceNumber,
      date: invoiceDate,
      dueDate,
      memberId: selectedMember.memberId,
      memberName: selectedMember.memberName,
      memberPhone: selectedMember.phone,
      memberAddress,
      branchName,
      items: items.map((it) => ({
        ...it,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
      subtotal,
      discount: Number(discount) || 0,
      taxRate: Number(taxRate) || 0,
      taxAmount,
      totalAmount,
      notes,
      terms,
    });

    navigate('/gym/finance/invoices');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Create New Tax Invoice"
        description="Issue itemized GST bills with automatic tax calculation, discounts, and custom terms."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              leftIcon={Eye}
            >
              Live A4 Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/gym/finance/invoices')}
              leftIcon={ArrowLeft}
            >
              Cancel
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Header & Member Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
            1. Invoice Header & Customer Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Invoice Number"
              value={invoiceNumber}
              disabled
            />
            <Input
              label="Invoice Date"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              required
            />
            <Input
              label="Payment Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <select
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:border-primary-500 focus:outline-hidden mt-5"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Billed To (Select Member)"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              options={memberFees.map((m) => ({
                value: m.memberId,
                label: `${m.memberName} (${m.memberId})`,
              }))}
              required
            />
            <Input
              label="Billing Street Address"
              value={memberAddress}
              onChange={(e) => setMemberAddress(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section 2: Itemized Line Items */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-800">
              2. Itemized Billing Breakdown
            </h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddItem}
              leftIcon={Plus}
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 items-center"
              >
                <div className="sm:col-span-6">
                  <Input
                    label={idx === 0 ? 'Description' : ''}
                    placeholder="e.g. Annual Membership Pass"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label={idx === 0 ? 'Qty' : ''}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <Input
                    label={idx === 0 ? 'Unit Price (₹)' : ''}
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                    required
                  />
                </div>
                <div className="sm:col-span-1 flex items-center justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals & Tax Calculation Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <Input
              label="Discount (₹)"
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <Input
              label="Standard GST Tax Rate (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <strong className="font-mono">₹{subtotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <strong className="font-mono">₹{taxAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-1 text-slate-900">
                <span>Total Amount:</span>
                <strong className="font-mono text-emerald-700">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Invoice Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Input
              label="Terms and Conditions"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            leftIcon={Eye}
          >
            Preview A4 Invoice
          </Button>

          <Button type="submit" leftIcon={Save}>
            Issue Tax Invoice (₹{totalAmount.toLocaleString('en-IN')})
          </Button>
        </div>
      </form>

      {/* Live Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Live Tax Invoice Preview"
        size="lg"
      >
        <div className="space-y-4 p-5 bg-white border border-slate-200 rounded-xl text-xs">
          <div className="flex justify-between items-start border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">PULSE FITNESS STUDIO</h2>
              <p className="text-slate-500">GSTIN: 27AABCU9603R1ZM</p>
              <p className="text-slate-500">{branchName} · Mumbai, India</p>
            </div>
            <div className="text-right">
              <span className="font-bold uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                DRAFT INVOICE
              </span>
              <p className="font-mono font-bold mt-1 text-slate-800">{invoiceNumber}</p>
              <p className="text-slate-400">Date: {invoiceDate}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Billed To</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedMember?.memberName}</p>
            <p className="text-slate-600">{memberAddress}</p>
          </div>

          <table className="w-full text-left border border-slate-200">
            <thead className="bg-slate-100 font-semibold">
              <tr>
                <th className="p-2">Item</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right">Unit Price</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td className="p-2 font-medium">{it.description}</td>
                  <td className="p-2 text-center">{it.quantity}</td>
                  <td className="p-2 text-right font-mono">₹{it.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-right font-mono font-bold">
                    ₹{((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-56 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({taxRate}%):</span>
                <span className="font-mono">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-1 text-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-700">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setPreviewOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CreateInvoicePage;
