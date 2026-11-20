import { useState } from 'react';
import { Download, FileBarChart2, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { FINANCIAL_REPORT_CATALOG } from '../../../constants/financialData';
import { cn } from '../../../utils/cn';

export function FinancialReportsPage() {
  const [selectedId, setSelectedId] = useState(FINANCIAL_REPORT_CATALOG[0]?.id || '');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-11-19');

  const activeReport =
    FINANCIAL_REPORT_CATALOG.find((r) => r.id === selectedId) ||
    FINANCIAL_REPORT_CATALOG[0] || {
      id: 'empty',
      title: 'No Report Available',
      description: 'No report templates found.',
      columns: ['Column 1', 'Column 2', 'Column 3', 'Column 4', 'Column 5'],
      rows: [],
    };

  const handleDownloadCsv = (report = activeReport) => {
    if (!report || !report.columns) return;
    const csvRows = [
      (report.columns || []).join(','),
      ...(report.rows || []).map((r) =>
        [r.col1, r.col2, r.col3, r.col4, r.col5]
          .map((cell) => `"${String(cell ?? '')}"`)
          .join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id || 'report'}-${fromDate}-to-${toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${report.title} CSV`);
  };

  const handleExportSummary = () => {
    if (FINANCIAL_REPORT_CATALOG.length === 0) {
      toast.error('No reports available to export');
      return;
    }
    const summaryText = [
      `GymPilot FINANCIAL SUMMARY REPORT (${fromDate} to ${toDate})`,
      'Powered by AGP Empire',
      '',
      ...FINANCIAL_REPORT_CATALOG.map(
        (rep) =>
          `## ${rep.title}\n${(rep.columns || []).join(' | ')}\n` +
          (rep.rows || []).map((r) => `${r.col1} | ${r.col2} | ${r.col3} | ${r.col4} | ${r.col5}`).join('\n')
      ),
    ].join('\n\n');
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GymPilot-financial-summary-${toDate}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exported consolidated financial summary');
  };

  const handlePrint = () => {
    if (!activeReport?.title) return;
    window.print();
    toast.success(`Prepared ${activeReport.title} for print`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Reports"
        description="Generate, preview, download, and print revenue, subscription, payment method, and refund reports."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={handlePrint}>
              Print Report
            </Button>
            <Button variant="emerald" size="sm" leftIcon={Download} onClick={handleExportSummary}>
              Export Summary
            </Button>
          </div>
        }
      />

      {/* Date Range Controls */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <Input
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            containerClassName="sm:w-44"
          />
          <Input
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            containerClassName="sm:w-44"
          />
        </div>
        <div className="text-xs text-slate-500">
          Reporting period: <span className="font-mono font-medium text-slate-800">{fromDate}</span> to{' '}
          <span className="font-mono font-medium text-slate-800">{toDate}</span>
        </div>
      </section>

      {/* Report Catalog + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4 space-y-2.5">
          {FINANCIAL_REPORT_CATALOG.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
              No report templates available.
            </div>
          ) : (
            FINANCIAL_REPORT_CATALOG.map((rep) => {
              const isActive = rep.id === activeReport?.id;
              return (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => setSelectedId(rep.id)}
                  className={cn(
                    'w-full text-left rounded-xl border p-4 transition-colors cursor-pointer',
                    isActive
                      ? 'border-navy-900 bg-navy-900 text-white'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{rep.title}</span>
                    <FileBarChart2
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-emerald-300' : 'text-slate-400'
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <p
                    className={cn(
                      'mt-1 text-xs line-clamp-2',
                      isActive ? 'text-slate-300' : 'text-slate-500'
                    )}
                  >
                    {rep.description}
                  </p>
                </button>
              );
            })
          )}
        </aside>

        <section className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{activeReport?.title || 'Report'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{activeReport?.description || ''}</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Download}
              onClick={() => handleDownloadCsv(activeReport)}
            >
              Download CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                  {(activeReport?.columns || []).map((col, idx) => (
                    <th
                      key={col}
                      className={cn(
                        'px-4 py-3 whitespace-nowrap',
                        idx > 0 && idx < 4 && 'text-right'
                      )}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeReport?.rows || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={(activeReport?.columns || []).length || 5}
                      className="px-4 py-8 text-center text-sm text-slate-400"
                    >
                      No records found for this reporting period.
                    </td>
                  </tr>
                ) : (
                  activeReport.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-slate-900">{row.col1}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                        {row.col2}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                        {row.col3}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                        {row.col4}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-emerald-700">
                        {row.col5}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
            <span>Preview snapshot · {(activeReport?.rows || []).length} rows</span>
            <span>Powered by AGP Empire</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default FinancialReportsPage;
