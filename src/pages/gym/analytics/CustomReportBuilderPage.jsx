import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  Calendar,
  Building2,
  PieChart as PieIcon,
  Table as TableIcon,
  BarChart2,
  LineChart as LineIcon,
  CreditCard,
  Save,
  Download,
  Printer,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';
import { useTenant } from '../../../contexts/TenantContext';

const CATEGORIES = [
  { id: 'Members', label: 'Members', desc: 'Member acquisition, demographics, and active retention' },
  { id: 'Attendance', label: 'Attendance', desc: 'Gate scanner visits, peak hours, and check-in logs' },
  { id: 'Memberships', label: 'Memberships', desc: 'Contract durations, plan tiers, and renewal conversions' },
  { id: 'Revenue', label: 'Revenue & P&L', desc: 'Gross receipts, collections, and net profit margins' },
  { id: 'Expenses', label: 'Expenses', desc: 'Operational facility overheads, utilities, and vendor spend' },
  { id: 'Payments', label: 'Payments Ledger', desc: 'Transactions, gateway settlements, and refunds' },
  { id: 'Trainers', label: 'Trainers & Staff', desc: 'Personal coaching hours, assigned clients, and ratings' },
  { id: 'Branches', label: 'Branches', desc: 'Multi-center comparative financial and member densities' },
];

const FIELDS_BY_CAT = {
  Members: ['Member ID', 'Full Name', 'Branch', 'Membership Plan', 'Join Date', 'Status', 'Phone Number'],
  Attendance: ['Member Name', 'Member ID', 'Branch', 'Check-in Time', 'Check-out Time', 'Entry Method', 'Status'],
  Memberships: ['Plan Name', 'Member Name', 'Duration', 'Start Date', 'Expiry Date', 'Renewal Count', 'Status'],
  Revenue: ['Month', 'Billed Revenue', 'Banked Collections', 'Pending Dues', 'Net Profit Margin'],
  Expenses: ['Expense ID', 'Title', 'Category', 'Branch', 'Amount', 'Vendor', 'Status'],
  Payments: ['Transaction ID', 'Member Name', 'Payment Mode', 'Amount', 'Date', 'Status'],
  Trainers: ['Trainer Name', 'Role', 'Branch', 'Active Clients', 'Scheduled Sessions', 'Completed Hours', 'Rating'],
  Branches: ['Branch Name', 'Manager', 'Total Members', 'Active Members', 'Revenue', 'Operating Cost', 'Net Profit'],
};

const VISUALIZATIONS = [
  { id: 'Table', label: 'Data Table', icon: TableIcon, desc: 'Detailed searchable tabular rows' },
  { id: 'Bar Chart', label: 'Bar Chart', icon: BarChart2, desc: 'Comparative volume bars' },
  { id: 'Line Chart', label: 'Line Chart', icon: LineIcon, desc: 'Historical timeline trend curve' },
  { id: 'Pie Chart', label: 'Pie / Donut Chart', icon: PieIcon, desc: 'Proportional percentage share' },
  { id: 'Summary Cards', label: 'Summary Metric Cards', icon: Layers, desc: 'High-level KPI indicator cards' },
];

export default function CustomReportBuilderPage() {
  const navigate = useNavigate();
  const { branches } = useTenant();
  const { saveReport } = useGymAnalyticsNotifications();

  const [step, setStep] = useState(1);
  const [reportTitle, setReportTitle] = useState('Q4 Operational Performance Report');
  const [selectedCategory, setSelectedCategory] = useState('Members');
  const [selectedFields, setSelectedFields] = useState(['Member ID', 'Full Name', 'Branch', 'Membership Plan', 'Status']);
  const [filters, setFilters] = useState({
    dateRange: 'This Month',
    branch: 'All Branches',
    status: 'All Statuses',
    plan: 'All Plans',
  });
  const [selectedViz, setSelectedViz] = useState('Table');

  const toggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleSaveReport = () => {
    saveReport({
      name: reportTitle,
      category: selectedCategory,
      visualization: selectedViz,
      fields: selectedFields,
      filters,
    });
    navigate('/gym/analytics/saved-reports');
  };

  // Mock generated data for preview
  const previewData = [
    { col1: 'MEM-001', col2: 'Aarav Sharma', col3: 'Downtown Main Arena', col4: 'Annual All-Access', col5: 'Active' },
    { col1: 'MEM-002', col2: 'Rohan Mehra', col3: 'Downtown Main Arena', col4: 'Quarterly Strength', col5: 'Active' },
    { col1: 'MEM-003', col2: 'Priya Nair', col3: 'Cyber City Fitness Hub', col4: 'VIP Coaching Elite', col5: 'Expired' },
    { col1: 'MEM-004', col2: 'Vikram Joshi', col3: 'West End Arena', col4: 'Monthly Flex', col5: 'Active' },
  ];

  const chartData = [
    { label: 'Downtown', value: 84 },
    { label: 'Cyber City', value: 62 },
    { label: 'West End', value: 54 },
  ];

  const exportReportCSV = () => {
    const headers = selectedFields;
    const rows = previewData.map((d) => [d.col1, `"${d.col2}"`, `"${d.col3}"`, `"${d.col4}"`, d.col5]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `${reportTitle.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Custom Report Builder"
        description="Design personalized analytical reports, configure custom data fields, filter subsets, and export audits."
        actions={
          <div className="flex gap-2">
            <Link to="/gym/analytics/saved-reports">
              <Button variant="outline" size="sm" leftIcon={Layers}>
                Saved Reports Directory
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stepper Wizard Bar */}
      <div className="grid grid-cols-5 p-1 rounded-xl bg-slate-100 text-xs font-semibold text-center gap-1">
        {[
          { num: 1, label: 'Category' },
          { num: 2, label: 'Fields' },
          { num: 3, label: 'Filters' },
          { num: 4, label: 'Visualization' },
          { num: 5, label: 'Generate & Preview' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              step === s.num
                ? 'bg-navy-900 text-white shadow-xs'
                : step > s.num
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full border border-current text-[10px] flex items-center justify-center">
              {s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* STEP 1: Select Category */}
      {step === 1 && (
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-base">Step 1: Choose Analytical Domain</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select the core database entity you wish to query and audit.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedFields(FIELDS_BY_CAT[cat.id]?.slice(0, 5) || []);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCategory === cat.id
                    ? 'border-navy-900 bg-navy-50/50 ring-2 ring-navy-900/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">{cat.label}</span>
                  {selectedCategory === cat.id && <CheckCircle2 className="w-4 h-4 text-navy-900" />}
                </div>
                <p className="text-xs text-slate-500">{cat.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3">
            <Button variant="primary" size="sm" rightIcon={ArrowRight} onClick={() => setStep(2)}>
              Proceed to Select Fields
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Fields */}
      {step === 2 && (
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-base">Step 2: Choose Display Fields</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select columns from the <strong>{selectedCategory}</strong> domain to include in report tables and exports.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(FIELDS_BY_CAT[selectedCategory] || []).map((field) => {
              const isChecked = selectedFields.includes(field);

              return (
                <label
                  key={field}
                  className={`p-3 rounded-lg border text-xs font-semibold cursor-pointer flex items-center justify-between transition-all ${
                    isChecked
                      ? 'border-navy-900 bg-navy-50 text-navy-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                  onClick={() => toggleField(field)}
                >
                  <span>{field}</span>
                  <input type="checkbox" checked={isChecked} onChange={() => {}} className="rounded text-navy-900" />
                </label>
              );
            })}
          </div>

          <div className="flex justify-between pt-3">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="primary" size="sm" rightIcon={ArrowRight} onClick={() => setStep(3)}>
              Configure Report Filters
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Apply Filters */}
      {step === 3 && (
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-base">Step 3: Define Filter Criteria</h3>
            <p className="text-xs text-slate-500 mt-0.5">Scope results by period, branch, and active status.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Date Range Scope"
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              options={[
                { value: 'Today', label: 'Today' },
                { value: 'This Week', label: 'This Week' },
                { value: 'This Month', label: 'This Month' },
                { value: 'Last Month', label: 'Last Month' },
                { value: 'Last 3 Months', label: 'Last 3 Months (Quarter)' },
                { value: 'This Financial Year', label: 'Current Financial Year' },
              ]}
            />

            <Select
              label="Branch Location"
              value={filters.branch}
              onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
              options={[
                { value: 'All Branches', label: 'All Branches' },
                ...(branches || []).map((b) => ({ value: b.name, label: b.name })),
              ]}
            />

            <Select
              label="Status Filter"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: 'All Statuses', label: 'All Statuses' },
                { value: 'Active', label: 'Active Only' },
                { value: 'Expired', label: 'Expired / Inactive' },
                { value: 'Pending', label: 'Pending Dues' },
              ]}
            />

            <Select
              label="Membership Tier Filter"
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              options={[
                { value: 'All Plans', label: 'All Membership Plans' },
                { value: 'Annual All-Access', label: 'Annual All-Access' },
                { value: 'Quarterly Strength', label: 'Quarterly Strength' },
                { value: 'Monthly Flex', label: 'Monthly Flex' },
              ]}
            />
          </div>

          <div className="flex justify-between pt-3">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft} onClick={() => setStep(2)}>
              Back
            </Button>
            <Button variant="primary" size="sm" rightIcon={ArrowRight} onClick={() => setStep(4)}>
              Choose Visualization Mode
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Select Visualization */}
      {step === 4 && (
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-base">Step 4: Select Primary Visualization</h3>
            <p className="text-xs text-slate-500 mt-0.5">Determine how data will render in dashboard widgets and reports.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {VISUALIZATIONS.map((viz) => {
              const Icon = viz.icon;
              const isSelected = selectedViz === viz.id;

              return (
                <div
                  key={viz.id}
                  onClick={() => setSelectedViz(viz.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-navy-900 bg-navy-50/50 ring-2 ring-navy-900/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-navy-800" />
                      <span className="font-bold text-sm text-slate-900">{viz.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-navy-900" />}
                  </div>
                  <p className="text-xs text-slate-500">{viz.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-3">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft} onClick={() => setStep(3)}>
              Back
            </Button>
            <Button variant="primary" size="sm" rightIcon={ArrowRight} onClick={() => setStep(5)}>
              Generate Report Preview
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: Generate & Preview */}
      {step === 5 && (
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <Input
                label="Report Title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="font-bold text-base"
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2">
                <span>Domain: <strong className="text-slate-800">{selectedCategory}</strong></span>
                <span>• Period: {filters.dateRange}</span>
                <span>• Branch: {filters.branch}</span>
                <span>• Visualization: {selectedViz}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
                Print
              </Button>
              <Button variant="outline" size="sm" leftIcon={Download} onClick={exportReportCSV}>
                Export CSV
              </Button>
              <Button variant="primary" size="sm" leftIcon={Save} onClick={handleSaveReport}>
                Save Report Config
              </Button>
            </div>
          </div>

          {/* Visual Section */}
          {selectedViz === 'Bar Chart' && (
            <div className="h-64 w-full p-4 rounded-xl border border-slate-200 bg-slate-50">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" name="Metric Count" fill="#14213D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed Data Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 font-semibold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200">
              Query Result Preview ({previewData.length} Records)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                  <tr>
                    {selectedFields.map((f, i) => (
                      <th key={i} className="px-4 py-2">{f}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/75">
                      <td className="px-4 py-2 font-mono text-navy-800 font-medium">{row.col1}</td>
                      <td className="px-4 py-2 font-semibold text-slate-900">{row.col2}</td>
                      <td className="px-4 py-2">{row.col3}</td>
                      <td className="px-4 py-2">{row.col4}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                          {row.col5}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft} onClick={() => setStep(4)}>
              Modify Visualization
            </Button>
            <Button variant="primary" size="sm" leftIcon={Save} onClick={handleSaveReport}>
              Confirm & Save to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
