import { useState } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Select from '../../ui/Select';

const REJECTION_REASONS = [
  { value: 'Incomplete documentation', label: 'Incomplete documentation' },
  { value: 'Unable to verify business entity', label: 'Unable to verify business entity' },
  { value: 'Duplicate gym registration', label: 'Duplicate gym registration' },
  { value: 'Policy compliance issue', label: 'Policy compliance issue' },
];

export function RejectModal({
  isOpen,
  onClose,
  gym,
  onConfirm,
}) {
  const [reason, setReason] = useState(REJECTION_REASONS[0].value);
  const [details, setDetails] = useState('');

  const handleConfirm = () => {
    const combined = details.trim() ? `${reason}: ${details.trim()}` : reason;
    onConfirm?.(gym, combined);
    setDetails('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reject ${gym?.name || 'Application'}`}
      description="Provide a clear reason for rejecting this gym registration request."
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirm}>
            Confirm Rejection
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Primary Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={REJECTION_REASONS}
          required
        />
        <div>
          <label
            htmlFor="reject-details"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Additional remarks (optional)
          </label>
          <textarea
            id="reject-details"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Explain any missing files or next steps for re-submission..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700"
          />
        </div>
      </div>
    </Modal>
  );
}

export default RejectModal;
