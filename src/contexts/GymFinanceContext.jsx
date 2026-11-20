import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  INITIAL_EXPENSES,
  INITIAL_FINANCE_SETTINGS,
  INITIAL_INVOICES,
  INITIAL_MEMBER_FEES,
  INITIAL_PAYROLL_SALARIES,
  INITIAL_RECEIPTS,
  INITIAL_REFUNDS,
  INITIAL_TRANSACTIONS,
} from '../constants/gymFinanceData';

const STORAGE_KEY = 'gympilot_finance_store_v1';

const GymFinanceContext = createContext(null);

export function GymFinanceProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse gym finance data from localStorage', e);
    }
    return {
      memberFees: INITIAL_MEMBER_FEES,
      transactions: INITIAL_TRANSACTIONS,
      invoices: INITIAL_INVOICES,
      receipts: INITIAL_RECEIPTS,
      refunds: INITIAL_REFUNDS,
      expenses: INITIAL_EXPENSES,
      payrollSalaries: INITIAL_PAYROLL_SALARIES,
      financeSettings: INITIAL_FINANCE_SETTINGS,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save gym finance data to localStorage', e);
    }
  }, [data]);

  // Record a payment collection
  const collectPayment = ({
    memberId,
    amount,
    paymentMethod,
    paymentDate,
    reference,
    notes,
    isAdvance = false,
  }) => {
    const paymentNum = Number(amount) || 0;
    const dateStr = paymentDate || new Date().toISOString().split('T')[0];
    const txnId = `TXN-${Date.now().toString().slice(-4)}`;
    const recId = `REC-${Date.now().toString().slice(-4)}`;

    setData((prev) => {
      // 1. Update Member Fee
      const targetFee = prev.memberFees.find((f) => f.memberId === memberId);
      const memberName = targetFee?.memberName || 'Member';
      const branchName = targetFee?.branchName || 'Downtown Main Arena';

      const updatedFees = prev.memberFees.map((fee) => {
        if (fee.memberId !== memberId) return fee;

        const newPaid = fee.paidAmount + paymentNum;
        const newPending = Math.max(0, fee.finalAmount - newPaid);
        let newStatus = fee.paymentStatus;
        if (newPending === 0) {
          newStatus = 'Paid';
        } else if (newPaid > 0) {
          newStatus = 'Partially Paid';
        }

        const newHistory = [
          {
            id: txnId,
            date: dateStr,
            amount: paymentNum,
            method: paymentMethod || 'UPI',
            ref: reference || 'REF-INSTANT',
          },
          ...(fee.paymentHistory || []),
        ];

        return {
          ...fee,
          paidAmount: newPaid,
          pendingAmount: newPending,
          paymentStatus: newStatus,
          lastPaymentDate: dateStr,
          daysOverdue: newPending === 0 ? 0 : fee.daysOverdue,
          paymentHistory: newHistory,
        };
      });

      // 2. Insert Transaction
      const newTxn = {
        id: txnId,
        memberId,
        memberName,
        branchName,
        type: isAdvance ? 'Registration Fee' : 'Membership Fee',
        amount: paymentNum,
        method: paymentMethod || 'UPI',
        date: dateStr,
        ref: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'Completed',
        notes: notes || 'Front desk fee capture',
      };

      // 3. Generate Receipt
      const newRec = {
        id: recId,
        receiptNumber: recId,
        transactionId: txnId,
        memberName,
        memberId,
        amount: paymentNum,
        method: paymentMethod || 'UPI',
        date: dateStr,
        generatedBy: 'Front Desk Lead',
        ref: newTxn.ref,
      };

      return {
        ...prev,
        memberFees: updatedFees,
        transactions: [newTxn, ...prev.transactions],
        receipts: [newRec, ...prev.receipts],
      };
    });

    toast.success(`Captured payment of ₹${paymentNum.toLocaleString('en-IN')}!`);
    return { txnId, recId };
  };

  // Create Invoice
  const createInvoice = (inv) => {
    const invId = `INV-2026-${Date.now().toString().slice(-3)}`;
    const newInvoice = {
      id: invId,
      invoiceNumber: invId,
      date: new Date().toISOString().split('T')[0],
      status: 'Issued',
      amountPaid: 0,
      balanceDue: inv.totalAmount,
      ...inv,
    };

    setData((prev) => ({
      ...prev,
      invoices: [newInvoice, ...prev.invoices],
    }));

    toast.success(`Invoice ${invId} generated successfully!`);
    return newInvoice;
  };

  const updateInvoiceStatus = (id, newStatus) => {
    setData((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === id ? { ...i, status: newStatus } : i
      ),
    }));
    toast.success(`Invoice marked as ${newStatus}`);
  };

  // Expense Management
  const createExpense = (exp) => {
    const expId = `EXP-${Date.now().toString().slice(-3)}`;
    const newExpense = {
      id: expId,
      status: 'Pending',
      amount: Number(exp.amount) || 0,
      date: exp.date || new Date().toISOString().split('T')[0],
      submittedBy: 'Front Desk',
      approvalRemarks: '',
      ...exp,
    };

    setData((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));

    toast.success(`Expense "${newExpense.title}" recorded!`);
    return newExpense;
  };

  const updateExpense = (id, fields) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.id === id ? { ...e, ...fields, amount: Number(fields.amount ?? e.amount) } : e
      ),
    }));
    toast.success('Expense updated');
  };

  const approveExpense = (id, remarks) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'Approved',
              approvalRemarks: remarks || 'Approved by Club Director.',
            }
          : e
      ),
    }));
    toast.success('Expense approved');
  };

  const rejectExpense = (id, remarks) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'Rejected',
              approvalRemarks: remarks || 'Rejected by finance audit.',
            }
          : e
      ),
    }));
    toast.error('Expense rejected');
  };

  const deleteExpense = (id) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
    toast.success('Expense removed');
  };

  // Refund Management
  const createRefundRequest = (refData) => {
    const refId = `REF-${Date.now().toString().slice(-3)}`;
    const newRefund = {
      id: refId,
      amount: Number(refData.amount) || 0,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Requested',
      processedDate: '—',
      remarks: '',
      ...refData,
    };

    setData((prev) => ({
      ...prev,
      refunds: [newRefund, ...prev.refunds],
    }));

    toast.success(`Refund request ${refId} initiated`);
    return newRefund;
  };

  const processRefund = (id, remarks) => {
    setData((prev) => ({
      ...prev,
      refunds: prev.refunds.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Processed',
              processedDate: new Date().toISOString().split('T')[0],
              remarks: remarks || 'Reversal processed to original payment method.',
            }
          : r
      ),
    }));
    toast.success('Refund processed successfully');
  };

  const rejectRefund = (id, remarks) => {
    setData((prev) => ({
      ...prev,
      refunds: prev.refunds.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Rejected',
              remarks: remarks || 'Refund request declined per club terms.',
            }
          : r
      ),
    }));
    toast.error('Refund request declined');
  };

  // Payroll processing
  const processSalaryPayment = (salaryId, paymentMethod = 'Bank Transfer', reference = '') => {
    setData((prev) => ({
      ...prev,
      payrollSalaries: prev.payrollSalaries.map((sal) =>
        sal.id === salaryId
          ? {
              ...sal,
              paymentStatus: 'Paid',
              paidDate: new Date().toISOString().split('T')[0],
              paymentMethod,
              reference: reference || `SAL-NEFT-${Date.now().toString().slice(-4)}`,
            }
          : sal
      ),
    }));
    toast.success('Salary payment recorded and slip generated!');
  };

  // Reminders
  const recordFollowupReminder = (memberId, notes = '') => {
    setData((prev) => ({
      ...prev,
      memberFees: prev.memberFees.map((fee) => {
        if (fee.memberId !== memberId) return fee;
        const newReminder = {
          date: new Date().toISOString().split('T')[0],
          type: 'Manual WhatsApp Nudge',
          notes: notes || 'Front desk follow-up call & payment link sent.',
        };
        return {
          ...fee,
          remindersSent: (fee.remindersSent || 0) + 1,
          reminderHistory: [newReminder, ...(fee.reminderHistory || [])],
        };
      }),
    }));
    toast.success('Payment reminder marked as sent!');
  };

  // Settings
  const updateFinanceSettings = (newSettings) => {
    setData((prev) => ({
      ...prev,
      financeSettings: { ...prev.financeSettings, ...newSettings },
    }));
    toast.success('Financial settings saved!');
  };

  const resetFinanceData = () => {
    setData({
      memberFees: INITIAL_MEMBER_FEES,
      transactions: INITIAL_TRANSACTIONS,
      invoices: INITIAL_INVOICES,
      receipts: INITIAL_RECEIPTS,
      refunds: INITIAL_REFUNDS,
      expenses: INITIAL_EXPENSES,
      payrollSalaries: INITIAL_PAYROLL_SALARIES,
      financeSettings: INITIAL_FINANCE_SETTINGS,
    });
    toast.success('Finance data restored to defaults');
  };

  return (
    <GymFinanceContext.Provider
      value={{
        memberFees: data.memberFees,
        transactions: data.transactions,
        invoices: data.invoices,
        receipts: data.receipts,
        refunds: data.refunds,
        expenses: data.expenses,
        payrollSalaries: data.payrollSalaries,
        financeSettings: data.financeSettings,
        collectPayment,
        createInvoice,
        updateInvoiceStatus,
        createExpense,
        updateExpense,
        approveExpense,
        rejectExpense,
        deleteExpense,
        createRefundRequest,
        processRefund,
        rejectRefund,
        processSalaryPayment,
        recordFollowupReminder,
        updateFinanceSettings,
        resetFinanceData,
      }}
    >
      {children}
    </GymFinanceContext.Provider>
  );
}

export function useGymFinance() {
  const ctx = useContext(GymFinanceContext);
  if (!ctx) {
    throw new Error('useGymFinance must be used within a GymFinanceProvider');
  }
  return ctx;
}
