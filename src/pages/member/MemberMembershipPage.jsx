import { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  IdCard,
  Sparkles,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { MEMBER_PAYMENTS_DATA, MEMBER_PLANS_DATA } from '../../constants/memberPortalData';

export function MemberMembershipPage() {
  const [plansData, setPlansData] = useState(MEMBER_PLANS_DATA);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  const current = plansData.currentPlan;

  const handleOpenUpgrade = (plan) => {
    setSelectedPlanForUpgrade(plan);
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = () => {
    if (selectedPlanForUpgrade) {
      toast.success(`Plan change request for ${selectedPlanForUpgrade.name} submitted to gym desk!`);
      setShowUpgradeModal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Membership & Subscriptions"
        description="View your active tier, validity countdown, renewal terms, and browse available upgrade tiers."
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={IdCard}
            onClick={() => setShowCardModal(true)}
          >
            Digital Membership Card
          </Button>
        }
      />

      {/* Active Membership Hero Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {current.status}
              </span>
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                {current.tier}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1.5">
              {current.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Billing Cycle: {current.billingCycle} · {current.paymentMethod}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-slate-400">Membership Fee</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono">
              ₹{current.price.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-400">Inclusive of 18% GST</span>
          </div>
        </div>

        {/* 4 Metadata Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Start Date</span>
            <p className="font-bold text-slate-800 mt-0.5">{current.startDate}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Expiry Date</span>
            <p className="font-bold text-slate-800 mt-0.5">{current.expiryDate}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Days Remaining</span>
            <p className="font-extrabold text-emerald-600 mt-0.5">55 Days</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Status</span>
            <p className="font-bold text-emerald-700 mt-0.5">All Cleared</p>
          </div>
        </div>

        {/* Plan Benefits Checklist */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Included Privileges & Perks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {current.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Renewal invoice requested at front desk!')}
          >
            Renew Membership Early
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenUpgrade(plansData.availablePlans[2])}
          >
            Upgrade to Diamond VIP
          </Button>
        </div>
      </div>

      {/* Available Plans for Upgrade / Switch */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Available Membership Tiers</h3>
            <p className="text-xs text-slate-500">Explore alternative membership tiers tailored to your fitness objectives.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plansData.availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-5 shadow-2xs flex flex-col justify-between space-y-4 bg-white transition-all ${
                plan.current
                  ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-primary-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{plan.tier}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      plan.current
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-primary-50 text-primary-700'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-800">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                </div>

                <div className="pt-2">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400"> / {plan.period}</span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                {plan.current ? (
                  <Button variant="outline" fullWidth disabled size="sm">
                    Active Plan
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    size="sm"
                    onClick={() => handleOpenUpgrade(plan)}
                  >
                    Select & Request
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Request Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={`Request Plan: ${selectedPlanForUpgrade?.name || ''}`}
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            You are requesting to transition your membership to <strong>{selectedPlanForUpgrade?.name}</strong> at <strong>₹{selectedPlanForUpgrade?.price.toLocaleString('en-IN')}</strong> for {selectedPlanForUpgrade?.period}.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Tier:</span>
              <strong className="text-slate-800">{selectedPlanForUpgrade?.tier}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Validity:</span>
              <strong className="text-slate-800">{selectedPlanForUpgrade?.period}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Price (inc. GST):</span>
              <strong className="text-slate-800 font-mono">₹{selectedPlanForUpgrade?.price.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            A notification will be submitted to the Downtown Arena front desk. A representative will confirm your invoice and activation window.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowUpgradeModal(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmUpgrade}>
              Confirm Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Digital Member Card Modal */}
      <Modal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        title="Official Digital Membership ID"
        maxWidth="max-w-md"
      >
        <div className="p-6 text-center space-y-5">
          <div className="rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 p-6 text-white text-left shadow-lg space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">MY GYM CLUB</span>
                <h3 className="font-bold text-sm text-white">Platinum Member Pass</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg text-primary-300 border-2 border-primary-400">
                AS
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Aarav Sharma</h4>
                <p className="font-mono text-xs text-primary-300">MEM-4094</p>
                <p className="text-[11px] text-slate-400">Valid Thru: 14 Jan 2027</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-slate-400">
              <span>Downtown Main Arena</span>
              <span className="font-mono text-[10px]">AUTH # 9940-2026</span>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success('Membership ID card downloaded (PDF)!');
                setShowCardModal(false);
              }}
            >
              Download PDF Pass
            </Button>
            <Button size="sm" onClick={() => setShowCardModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MemberMembershipPage;
