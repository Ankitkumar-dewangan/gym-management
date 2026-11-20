export const REVENUE_TREND_YOY = [];

export const REVENUE_BY_PLAN = [];

export const PAYMENT_METHOD_BREAKDOWN = [];

export const REVENUE_GROWTH_SERIES = [];

export const GATEWAY_SUMMARY = [];

export const FINANCIAL_REPORT_CATALOG = [
  {
    id: 'monthly-revenue',
    title: 'Monthly Revenue Report',
    description: 'Month-over-month gross collections, net recurring revenue, and refund deductions.',
    columns: ['Month', 'Gross Revenue', 'Refunds', 'Net Revenue', 'Growth'],
    rows: [],
  },
  {
    id: 'annual-revenue',
    title: 'Annual Revenue Report',
    description: 'Year-over-year trailing 12-month platform revenue compared against prior fiscal year.',
    columns: ['Quarter', 'FY 2026', 'FY 2025', 'Variance', 'YoY Change'],
    rows: [],
  },
  {
    id: 'plan-subscription',
    title: 'Subscription Tier Breakdown',
    description: 'Revenue, active organizations, and churn distribution by SaaS subscription tier.',
    columns: ['Plan Tier', 'Subscribers', 'Monthly Price', 'Total Revenue', 'Share %'],
    rows: [],
  },
  {
    id: 'payment-methods',
    title: 'Payment Gateway & Settlements',
    description: 'Processed volume, transaction count, gateway success rates, and settlement cycles.',
    columns: ['Payment Method', 'Volume', 'Transactions', 'Success Rate', 'Settlement'],
    rows: [],
  },
  {
    id: 'tax-gst-compliance',
    title: 'Tax & GST Compliance Report',
    description: 'Tax collected on platform invoices, CGST/SGST breakdown, and compliance records.',
    columns: ['Period', 'Taxable Amount', 'CGST (9%)', 'SGST (9%)', 'Total Tax'],
    rows: [],
  },
];
