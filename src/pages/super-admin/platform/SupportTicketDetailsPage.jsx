import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Paperclip,
  Send,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { SUPPORT_AGENTS } from '../../../constants/platformData';
import { usePlatformManagement } from '../../../contexts/PlatformManagementContext';
import { formatDate } from '../../../utils/formatters';

export function SupportTicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, updateTicket, addTicketReply } = usePlatformManagement();

  const ticket = tickets.find((t) => t.id === id);
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');

  if (!ticket) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Support ticket not found"
          description="The requested support ticket ID could not be located."
          actionLabel="Back to Support Tickets"
          onAction={() => navigate('/super-admin/support')}
        />
      </div>
    );
  }

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addTicketReply(ticket.id, replyText.trim(), false);
    setReplyText('');
    toast.success('Reply sent to gym owner');
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addTicketReply(ticket.id, noteText.trim(), true);
    setNoteText('');
    toast.success('Internal note added');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/super-admin/support"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Support Tickets</span>
        </Link>
      </div>

      {/* Header */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-slate-500">{ticket.id}</span>
            <StatusBadge status={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            {ticket.subject}
          </h1>
          <p className="text-xs text-slate-500">
            {ticket.gymName} · Requester: {ticket.requesterName} · Category: {ticket.category} · Created {formatDate(ticket.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {ticket.status !== 'resolved' && (
            <Button
              variant="emerald"
              size="sm"
              leftIcon={CheckCircle2}
              onClick={() => {
                updateTicket(ticket.id, { status: 'resolved' }, 'Resolved Ticket');
                toast.success(`Ticket ${ticket.id} marked resolved`);
              }}
            >
              Resolve Ticket
            </Button>
          )}
          {ticket.status !== 'closed' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={XCircle}
              onClick={() => {
                updateTicket(ticket.id, { status: 'closed' }, 'Closed Ticket');
                toast.success(`Ticket ${ticket.id} closed`);
              }}
            >
              Close Ticket
            </Button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Description, Attachments, Conversation Timeline */}
        <div className="lg:col-span-8 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Issue Description</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>

            {ticket.attachments?.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Attachments
                </p>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((att) => (
                    <span
                      key={att.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      <span className="font-medium">{att.name}</span>
                      <span className="font-mono text-slate-400">{att.size}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Conversation Timeline */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Conversation Timeline</h2>

            <div className="space-y-3">
              {ticket.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-900">
                      {msg.sender}{' '}
                      <span className="font-normal text-slate-500">· {msg.role}</span>
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums">{msg.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">{msg.body}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700">
                Reply to Requester
              </label>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a public response to the gym owner..."
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" leftIcon={Send}>
                  Send Reply
                </Button>
              </div>
            </form>
          </section>
        </div>

        {/* Right: Controls & Internal Notes */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Ticket Routing</h2>
            <Select
              label="Assigned Agent"
              value={ticket.assignedAgent}
              onChange={(e) => {
                updateTicket(
                  ticket.id,
                  { assignedAgent: e.target.value },
                  `Assigned Ticket to ${e.target.value}`
                );
                toast.success(`Assigned to ${e.target.value}`);
              }}
              options={SUPPORT_AGENTS.map((a) => ({ value: a, label: a }))}
            />
            <Select
              label="Priority"
              value={ticket.priority}
              onChange={(e) => {
                updateTicket(
                  ticket.id,
                  { priority: e.target.value },
                  `Changed Priority to ${e.target.value}`
                );
                toast.success(`Priority updated to ${e.target.value}`);
              }}
              options={[
                { value: 'high', label: 'High Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'low', label: 'Low Priority' },
              ]}
            />
            <Select
              label="Status"
              value={ticket.status}
              onChange={(e) => {
                updateTicket(
                  ticket.id,
                  { status: e.target.value },
                  `Changed Status to ${e.target.value}`
                );
                toast.success(`Status updated to ${e.target.value.replace('_', ' ')}`);
              }}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-900">Internal Notes</h2>
            </div>

            {!ticket.internalNotes?.length ? (
              <p className="text-xs text-slate-500">No internal notes recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {ticket.internalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-amber-200/70 bg-amber-50/50 p-3 text-xs space-y-1"
                  >
                    <div className="flex justify-between gap-2 text-slate-600">
                      <span className="font-semibold">{note.author}</span>
                      <span className="font-mono text-[11px]">{note.date}</span>
                    </div>
                    <p className="text-slate-800">{note.text}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddNote} className="space-y-2.5 pt-2 border-t border-slate-100">
              <textarea
                rows={2}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add private staff note..."
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
              />
              <Button type="submit" variant="outline" size="sm" fullWidth>
                Save Internal Note
              </Button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default SupportTicketDetailsPage;
