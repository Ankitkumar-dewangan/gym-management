import { useMemo, useState } from 'react';
import { Check, Eye, FileText, MessageSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import ApprovalModal from '../../../components/super-admin/gyms/ApprovalModal';
import GymStatusBadge from '../../../components/super-admin/gyms/GymStatusBadge';
import RejectModal from '../../../components/super-admin/gyms/RejectModal';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useGymManagement } from '../../../contexts/GymManagementContext';
import { formatDate } from '../../../utils/formatters';

export function GymApprovalsPage() {
  const { gyms, updateGymStatus } = useGymManagement();
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [viewingApp, setViewingApp] = useState(null);
  const [approvingGym, setApprovingGym] = useState(null);
  const [rejectingGym, setRejectingGym] = useState(null);
  const [infoGym, setInfoGym] = useState(null);
  const [infoMessage, setInfoMessage] = useState('');

  const pageSize = 5;

  const counts = useMemo(
    () => ({
      pending: gyms.filter(
        (g) => g.status === 'pending' || g.status === 'info_requested'
      ).length,
      approved: gyms.filter((g) => g.status === 'active').length,
      rejected: gyms.filter((g) => g.status === 'rejected').length,
    }),
    [gyms]
  );

  const filteredApplications = useMemo(() => {
    const q = search.trim().toLowerCase();
    return gyms.filter((gym) => {
      const matchesTab =
        activeTab === 'pending'
          ? gym.status === 'pending' || gym.status === 'info_requested'
          : activeTab === 'approved'
            ? gym.status === 'active'
            : gym.status === 'rejected';

      const matchesSearch =
        !q ||
        gym.name.toLowerCase().includes(q) ||
        gym.owner?.fullName?.toLowerCase().includes(q) ||
        gym.businessEmail?.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [gyms, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filteredApplications.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleApprove = (gym, note) => {
    updateGymStatus(
      gym.id,
      'active',
      note ? `Approved: ${note}` : 'Application approved by Super Admin'
    );
    toast.success(`${gym.name} approved and activated`);
    setApprovingGym(null);
  };

  const handleReject = (gym, reason) => {
    updateGymStatus(gym.id, 'rejected', `Rejected — ${reason}`);
    toast.error(`${gym.name} application rejected`);
    setRejectingGym(null);
  };

  const handleRequestInfo = () => {
    if (!infoGym) return;
    if (!infoMessage.trim()) {
      toast.error('Please enter what additional information is needed');
      return;
    }
    updateGymStatus(
      infoGym.id,
      'info_requested',
      `Additional information requested: ${infoMessage.trim()}`
    );
    toast.success(`Information request sent to ${infoGym.owner?.fullName}`);
    setInfoMessage('');
    setInfoGym(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'Gym Name',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.name}</p>
          <p className="text-xs text-slate-500">
            {row.subscription?.plan} Plan · {row.address?.city}
          </p>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner Name',
      render: (row) => row.owner?.fullName || '—',
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="text-xs text-slate-600">{row.businessEmail}</span>,
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 tabular-nums">
          {row.contactNumber}
        </span>
      ),
    },
    {
      key: 'appliedDate',
      header: 'Applied Date',
      render: (row) => (
        <span className="tabular-nums text-slate-600">{formatDate(row.registeredAt)}</span>
      ),
    },
    {
      key: 'documents',
      header: 'Documents',
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewingApp(row)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-800 hover:underline cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{row.documents?.length || 1} files</span>
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <GymStatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setViewingApp(row)}
            title="View Application"
            aria-label={`View application for ${row.name}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          {(row.status === 'pending' || row.status === 'info_requested') && (
            <>
              <button
                type="button"
                onClick={() => setApprovingGym(row)}
                title="Approve Gym"
                aria-label={`Approve ${row.name}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50 cursor-pointer"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setRejectingGym(row)}
                title="Reject Gym"
                aria-label={`Reject ${row.name}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setInfoGym(row)}
                title="Request Additional Information"
                aria-label={`Request additional information from ${row.name}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sky-700 hover:bg-sky-50 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gym Approvals"
        description="Review verification documents, request clarifications, and approve or reject gym onboarding applications."
      />

      {/* Application Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'pending', label: `Pending Applications (${counts.pending})` },
          { key: 'approved', label: `Approved Applications (${counts.approved})` },
          { key: 'rejected', label: `Rejected Applications (${counts.rejected})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'bg-navy-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search applications by gym, owner, or email..."
        hasActiveFilters={Boolean(search.trim())}
        onReset={() => setSearch('')}
      />

      <DataTable
        columns={columns}
        data={paginated}
        emptyTitle={`No ${activeTab} applications`}
        emptyDescription="Applications matching the selected status will appear here."
        pagination={{
          currentPage: safePage,
          totalPages,
          totalItems: filteredApplications.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* View Application Modal */}
      <Modal
        isOpen={Boolean(viewingApp)}
        onClose={() => setViewingApp(null)}
        title={viewingApp?.name || 'Application Details'}
        description={
          viewingApp ? `Application ${viewingApp.id} · Applied ${formatDate(viewingApp.registeredAt)}` : ''
        }
        size="md"
        footer={
          viewingApp?.status === 'pending' || viewingApp?.status === 'info_requested' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const g = viewingApp;
                  setViewingApp(null);
                  setInfoGym(g);
                }}
              >
                Request Info
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  const g = viewingApp;
                  setViewingApp(null);
                  setRejectingGym(g);
                }}
              >
                Reject
              </Button>
              <Button
                variant="emerald"
                size="sm"
                onClick={() => {
                  const g = viewingApp;
                  setViewingApp(null);
                  setApprovingGym(g);
                }}
              >
                Approve Gym
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setViewingApp(null)}>
              Close
            </Button>
          )
        }
      >
        {viewingApp && (
          <div className="space-y-5 text-sm">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-slate-500">Owner Name</dt>
                <dd className="mt-1 font-medium text-slate-900">{viewingApp.owner?.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email Address</dt>
                <dd className="mt-1 font-medium text-slate-900">{viewingApp.businessEmail}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Contact Number</dt>
                <dd className="mt-1 font-mono text-slate-900">{viewingApp.contactNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Requested Plan</dt>
                <dd className="mt-1 font-medium text-slate-900">{viewingApp.subscription?.plan}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">Registered Address</dt>
                <dd className="mt-1 text-slate-800">
                  {viewingApp.address?.fullAddress}, {viewingApp.address?.city},{' '}
                  {viewingApp.address?.state} {viewingApp.address?.pinCode}
                </dd>
              </div>
            </dl>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Submitted Verification Documents
              </p>
              <ul className="space-y-2">
                {(viewingApp.documents || []).map((doc) => (
                  <li
                    key={doc.name}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                      <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                      <span className="text-slate-400 shrink-0">({doc.size})</span>
                    </div>
                    <span
                      className={`font-medium shrink-0 ${
                        doc.verified ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {doc.verified ? 'Verified' : 'Pending Check'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>

      <ApprovalModal
        isOpen={Boolean(approvingGym)}
        onClose={() => setApprovingGym(null)}
        gym={approvingGym}
        onConfirm={handleApprove}
      />

      <RejectModal
        isOpen={Boolean(rejectingGym)}
        onClose={() => setRejectingGym(null)}
        gym={rejectingGym}
        onConfirm={handleReject}
      />

      {/* Request Additional Info Modal */}
      <Modal
        isOpen={Boolean(infoGym)}
        onClose={() => setInfoGym(null)}
        title={`Request Additional Information`}
        description={`Send a clarification request to ${infoGym?.owner?.fullName || 'the gym owner'}.`}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setInfoGym(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRequestInfo}>
              Send Request
            </Button>
          </>
        }
      >
        <div>
          <label
            htmlFor="info-request-msg"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Required details or documents
          </label>
          <textarea
            id="info-request-msg"
            rows={4}
            value={infoMessage}
            onChange={(e) => setInfoMessage(e.target.value)}
            placeholder="e.g. Please upload a clearer copy of your commercial liability insurance certificate."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700"
          />
        </div>
      </Modal>
    </div>
  );
}

export default GymApprovalsPage;
