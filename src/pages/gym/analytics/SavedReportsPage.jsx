import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  Download,
  Printer,
  Copy,
  Trash2,
  Eye,
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';

export default function SavedReportsPage() {
  const { savedReports, deleteReport, duplicateReport } = useGymAnalyticsNotifications();

  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const filtered = (savedReports || []).filter((r) => {
    return (
      !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const exportReportCSV = (rep) => {
    const headers = rep.fields || ['Field 1', 'Field 2', 'Field 3'];
    const rows = [
      ['Sample Record 1', 'Verified Value', 'Downtown Main Arena'],
      ['Sample Record 2', 'Verified Value', 'Cyber City Fitness Hub'],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `${rep.name.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Reports Directory"
        description="Access and export saved custom query configurations, analytical snapshots, and recurring audit sheets."
        actions={
          <Link to="/gym/analytics/custom-reports">
            <Button variant="primary" size="sm" leftIcon={Sparkles}>
              Build New Custom Report
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved reports by title or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Report Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Format / Type</th>
                <th className="px-4 py-3">Created By</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3">Last Modified</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No custom saved reports found. Click "Build New Custom Report" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm">{rep.name}</div>
                      <div className="text-[11px] text-slate-400">ID: {rep.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full font-medium bg-navy-50 text-navy-800">
                        {rep.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {rep.type}
                    </td>
                    <td className="px-4 py-3">{rep.createdBy || 'Club Director'}</td>
                    <td className="px-4 py-3">{rep.createdDate}</td>
                    <td className="px-4 py-3">{rep.lastUpdated}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={Eye}
                          onClick={() => setSelectedReport(rep)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={Download}
                          onClick={() => exportReportCSV(rep)}
                        >
                          CSV
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={Copy}
                          onClick={() => duplicateReport(rep.id)}
                        >
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteReport(rep.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Report Modal */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={`Report Inspection: ${selectedReport.name}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Domain Category:</span>
                <span className="font-bold text-navy-900">{selectedReport.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Output Format:</span>
                <span className="font-medium">{selectedReport.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Synced:</span>
                <span>{selectedReport.lastUpdated}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block mb-1">Included Data Fields:</span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedReport.fields || []).map((f, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                leftIcon={Printer}
                onClick={() => window.print()}
              >
                Print
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                leftIcon={Download}
                onClick={() => exportReportCSV(selectedReport)}
              >
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
