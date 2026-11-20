import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Eye, FileText, Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';

export function MemberDocumentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const otherInputRef = useRef(null);
  const { getMemberById, updateMemberDocument } = useMemberManagement();
  const [previewDoc, setPreviewDoc] = useState(null);

  const member = getMemberById(id);

  if (!member) {
    return (
      <EmptyState
        title="Member documents not found"
        description="Unable to locate this member profile in the current gym organization."
        actionLabel="Back to Members"
        onAction={() => navigate('/gym/members')}
      />
    );
  }

  const docs = member.documents || {};

  const handleUploadSingle = (fieldKey, file) => {
    if (!file) return;
    updateMemberDocument(member.id, fieldKey, file.name);
    toast.success(`Uploaded ${file.name}`);
  };

  const handleUploadOther = (files) => {
    const picked = Array.from(files || []).map((f) => f.name);
    if (!picked.length) return;
    const next = Array.from(new Set([...(docs.otherDocs || []), ...picked]));
    updateMemberDocument(member.id, 'otherDocs', next);
    toast.success(`Added ${picked.length} supporting file(s)`);
  };

  const handleDownload = (name) => {
    const blob = new Blob(
      [`Member Document: ${name}\nMember: ${member.fullName} (${member.id})\nBranch: ${member.branchName}`],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${name}`);
  };

  const slots = [
    { key: 'profilePhoto', label: 'Profile Photograph', value: docs.profilePhoto || 'profile_photo.jpg' },
    { key: 'identityProof', label: 'Identity Proof (ID / Passport)', value: docs.identityProof },
    { key: 'addressProof', label: 'Address Proof', value: docs.addressProof },
    { key: 'medicalCertificate', label: 'Medical Certificate (Optional)', value: docs.medicalCertificate },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Member Documents · ${member.fullName}`}
        description={`Upload, preview, and manage verification files for ${member.id}.`}
        actions={
          <Button
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => navigate(`/gym/members/${member.id}`)}
          >
            Back to Profile
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {slots.map((slot) => (
          <div
            key={slot.key}
            className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{slot.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                  {slot.value || 'No document uploaded'}
                </p>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-navy-900 shrink-0">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                {slot.value && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={Eye}
                      onClick={() => setPreviewDoc({ label: slot.label, name: slot.value })}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={Download}
                      onClick={() => handleDownload(slot.value)}
                    >
                      Download
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {slot.value && slot.key !== 'profilePhoto' && (
                  <button
                    type="button"
                    onClick={() => {
                      updateMemberDocument(member.id, slot.key, '');
                      toast.success(`Removed ${slot.label}`);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                )}
                <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
                  {slot.value ? 'Replace' : 'Upload'}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="sr-only"
                    onChange={(e) => {
                      handleUploadSingle(slot.key, e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Other Documents */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Other Supporting Documents</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Signed waivers, corporate wellness letters, or freeze approvals.
            </p>
          </div>
          <Button
            variant="emerald"
            size="sm"
            leftIcon={UploadCloud}
            onClick={() => otherInputRef.current?.click()}
          >
            Upload File
          </Button>
          <input
            ref={otherInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="sr-only"
            onChange={(e) => {
              handleUploadOther(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {(docs.otherDocs || []).length === 0 ? (
          <p className="text-sm text-slate-500">No additional documents stored in vault.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {docs.otherDocs.map((doc) => (
              <li key={doc} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-slate-800 truncate">
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="truncate">{doc}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewDoc({ label: 'Supporting Document', name: doc })}
                    className="px-2"
                  >
                    <Eye className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="px-2"
                  >
                    <Download className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      updateMemberDocument(
                        member.id,
                        'otherDocs',
                        docs.otherDocs.filter((d) => d !== doc)
                      );
                      toast.success(`Removed ${doc}`);
                    }}
                    className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.label || 'Document Preview'}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>Close</Button>
            {previewDoc && (
              <Button
                variant="emerald"
                size="sm"
                leftIcon={Download}
                onClick={() => handleDownload(previewDoc.name)}
              >
                Download
              </Button>
            )}
          </>
        }
      >
        {previewDoc && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center space-y-2">
            <FileText className="h-10 w-10 text-navy-900 mx-auto" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-900 break-all">{previewDoc.name}</p>
            <p className="text-xs text-slate-500">Attached to {member.fullName} ({member.id})</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MemberDocumentsPage;
