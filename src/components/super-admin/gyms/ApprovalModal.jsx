import { useState } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

export function ApprovalModal({
  isOpen,
  onClose,
  gym,
  onConfirm,
}) {
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm?.(gym, note.trim());
    setNote('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Approve ${gym?.name || 'Gym'}`}
      description="Activating this gym provisions their workspace and enables branch access."
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="emerald" size="sm" onClick={handleConfirm}>
            Approve & Activate
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        {gym && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1 text-xs">
            <p className="font-semibold text-slate-800">{gym.name}</p>
            <p className="text-slate-600">
              Owner: {gym.owner?.fullName} · {gym.subscription?.plan} Plan
            </p>
          </div>
        )}
        <div>
          <label
            htmlFor="approval-note"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Verification note (optional)
          </label>
          <textarea
            id="approval-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Business registration and liability coverage verified."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700"
          />
        </div>
      </div>
    </Modal>
  );
}

export default ApprovalModal;
