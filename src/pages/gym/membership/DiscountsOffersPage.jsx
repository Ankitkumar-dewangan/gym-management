import { useState } from 'react';
import { Copy, Edit3, Percent, Plus, Power, Tag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { cn } from '../../../utils/cn';
import { formatDate } from '../../../utils/formatters';

const EMPTY_OFFER = {
  name: '',
  code: '',
  discountType: 'percentage',
  percentageDiscount: 15,
  fixedDiscount: 0,
  validFrom: '2026-11-19',
  validUntil: '2026-12-31',
  applicablePlans: ['all'],
  maxUsage: 100,
  limitPerMember: 1,
  status: 'active',
};

export function DiscountsOffersPage() {
  const {
    tenantPlans,
    tenantOffers,
    createOffer,
    updateOffer,
    toggleOfferStatus,
    deleteOffer,
  } = useMembershipManagement();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [form, setForm] = useState(EMPTY_OFFER);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreateModal = () => {
    setEditingOfferId(null);
    setForm(EMPTY_OFFER);
    setModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOfferId(offer.id);
    setForm({
      name: offer.name,
      code: offer.code,
      discountType: offer.discountType,
      percentageDiscount: offer.percentageDiscount ?? 0,
      fixedDiscount: offer.fixedDiscount ?? 0,
      validFrom: offer.validFrom,
      validUntil: offer.validUntil,
      applicablePlans: offer.applicablePlans || ['all'],
      maxUsage: offer.maxUsage ?? 100,
      limitPerMember: offer.limitPerMember ?? 1,
      status: offer.status || 'active',
    });
    setModalOpen(true);
  };

  const handleSaveOffer = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Offer name and coupon code are required');
      return;
    }
    if (editingOfferId) {
      updateOffer(editingOfferId, form);
      toast.success(`Updated offer ${form.code.toUpperCase()}`);
    } else {
      createOffer(form);
      toast.success(`Created offer ${form.code.toUpperCase()}`);
    }
    setModalOpen(false);
  };

  const handlePlanToggle = (planId) => {
    if (planId === 'all') {
      setForm((prev) => ({ ...prev, applicablePlans: ['all'] }));
      return;
    }
    setForm((prev) => {
      const filtered = prev.applicablePlans.filter((id) => id !== 'all');
      const exists = filtered.includes(planId);
      const next = exists ? filtered.filter((id) => id !== planId) : [...filtered, planId];
      return {
        ...prev,
        applicablePlans: next.length ? next : ['all'],
      };
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discounts & Offers"
        description="Manage promotional coupon codes, percentage or flat fee waivers, and usage limits."
        actions={
          <Button variant="emerald" leftIcon={Plus} onClick={openCreateModal}>
            Create Offer
          </Button>
        }
      />

      {tenantOffers.length === 0 ? (
        <EmptyState
          title="No promotional offers configured"
          description="Create your first membership coupon or seasonal discount."
          actionLabel="Create Offer"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tenantOffers.map((offer) => {
            const discountHeadline =
              offer.discountType === 'percentage'
                ? `${offer.percentageDiscount}% OFF`
                : `₹${offer.fixedDiscount} OFF`;

            const planLabels = offer.applicablePlans?.includes('all')
              ? 'All Membership Plans'
              : tenantPlans
                  .filter((p) => offer.applicablePlans?.includes(p.id))
                  .map((p) => p.name)
                  .join(', ') || 'Selected Plans';

            return (
              <div
                key={offer.id}
                className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        {offer.discountType === 'percentage' ? 'Percentage Discount' : 'Fixed Waiver'}
                      </p>
                      <h2 className="text-base font-bold text-slate-900 mt-0.5 truncate">
                        {offer.name}
                      </h2>
                    </div>
                    <StatusBadge status={offer.status} />
                  </div>

                  {/* Coupon Preview Box */}
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-slate-500">Coupon Code</p>
                      <p className="font-mono text-base font-bold tracking-wider text-navy-900">
                        {offer.code}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold text-emerald-700">
                        {discountHeadline}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(offer.code);
                          toast.success(`Copied ${offer.code}`);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-navy-900 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" aria-hidden="true" />
                        Copy Code
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p>
                      <span className="text-slate-500">Valid Window:</span>{' '}
                      <span className="font-mono text-slate-800">
                        {formatDate(offer.validFrom)} – {formatDate(offer.validUntil)}
                      </span>
                    </p>
                    <p className="truncate">
                      <span className="text-slate-500">Applicable Plans:</span>{' '}
                      <span className="font-medium text-slate-800">{planLabels}</span>
                    </p>
                    <p>
                      <span className="text-slate-500">Redemptions:</span>{' '}
                      <span className="font-mono text-slate-800">
                        {offer.usedCount || 0} / {offer.maxUsage} ({offer.limitPerMember}/member)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Edit3}
                    onClick={() => openEditModal(offer)}
                  >
                    Edit
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title={offer.status === 'active' ? 'Deactivate offer' : 'Activate offer'}
                      onClick={() => {
                        toggleOfferStatus(offer.id);
                        toast.success(
                          `${offer.code} ${offer.status === 'active' ? 'deactivated' : 'activated'}`
                        );
                      }}
                      className="px-2"
                    >
                      <Power
                        className={cn(
                          'h-4 w-4',
                          offer.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                        )}
                        aria-hidden="true"
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(offer)}
                      className="px-2"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Offer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOfferId ? 'Edit Promotional Offer' : 'Create Promotional Offer'}
        description="Configure discount rules, coupon preview, and redemption caps."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="emerald" size="sm" onClick={handleSaveOffer}>
              {editingOfferId ? 'Save Offer Changes' : 'Create Offer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveOffer} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Offer Name"
              required
              placeholder="e.g. New Year Kickoff"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="Coupon Code"
              required
              placeholder="e.g. IRON20"
              className="font-mono uppercase"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            />
            <Select
              label="Discount Type"
              value={form.discountType}
              onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}
              options={[
                { value: 'percentage', label: 'Percentage Discount (%)' },
                { value: 'fixed', label: 'Fixed Amount Discount (₹)' },
              ]}
            />
            {form.discountType === 'percentage' ? (
              <Input
                label="Percentage Discount (%)"
                type="number"
                min="1"
                max="100"
                leftIcon={Percent}
                value={form.percentageDiscount}
                onChange={(e) => setForm((p) => ({ ...p, percentageDiscount: e.target.value }))}
              />
            ) : (
              <Input
                label="Fixed Amount Discount (₹)"
                type="number"
                min="1"
                leftIcon={Tag}
                value={form.fixedDiscount}
                onChange={(e) => setForm((p) => ({ ...p, fixedDiscount: e.target.value }))}
              />
            )}
            <Input
              label="Valid From"
              type="date"
              value={form.validFrom}
              onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))}
            />
            <Input
              label="Valid Until"
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))}
            />
            <Input
              label="Maximum Usage"
              type="number"
              min="1"
              value={form.maxUsage}
              onChange={(e) => setForm((p) => ({ ...p, maxUsage: e.target.value }))}
            />
            <Input
              label="Usage Limit Per Member"
              type="number"
              min="1"
              value={form.limitPerMember}
              onChange={(e) => setForm((p) => ({ ...p, limitPerMember: e.target.value }))}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Applicable Plans</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handlePlanToggle('all')}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer',
                  form.applicablePlans.includes('all')
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700'
                )}
              >
                All Plans
              </button>
              {tenantPlans.map((p) => {
                const active = form.applicablePlans.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePlanToggle(p.id)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer',
                      active
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 bg-white text-slate-700'
                    )}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <Select
            label="Offer Status"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteOffer(deleteTarget.id);
            toast.success(`Deleted offer ${deleteTarget.code}`);
            setDeleteTarget(null);
          }
        }}
        title="Delete Promotional Offer"
        description={
          deleteTarget
            ? `Delete coupon code "${deleteTarget.code}" (${deleteTarget.name})?`
            : ''
        }
        confirmLabel="Delete Offer"
      />
    </div>
  );
}

export default DiscountsOffersPage;
