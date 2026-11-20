export const REFERENCE_TODAY = '2026-11-19';

export function toIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return REFERENCE_TODAY;
  return date.toISOString().slice(0, 10);
}

export function calculateExpiryDate(startDateStr, { durationType = 'monthly', durationDays = 30 } = {}) {
  const base = startDateStr ? new Date(`${startDateStr}T00:00:00`) : new Date(`${REFERENCE_TODAY}T00:00:00`);
  if (Number.isNaN(base.getTime())) return '2026-12-19';

  const next = new Date(base);
  if (durationType === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  } else if (durationType === 'quarterly') {
    next.setMonth(next.getMonth() + 3);
  } else if (durationType === 'half_yearly') {
    next.setMonth(next.getMonth() + 6);
  } else if (durationType === 'yearly') {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    const days = Math.max(1, Number(durationDays) || 30);
    next.setDate(next.getDate() + days);
  }
  return toIsoDate(next);
}

export function calculateRemainingDays(expiryDateStr, referenceDateStr = REFERENCE_TODAY) {
  if (!expiryDateStr) return 0;
  const exp = new Date(`${expiryDateStr}T00:00:00`);
  const ref = new Date(`${referenceDateStr}T00:00:00`);
  if (Number.isNaN(exp.getTime()) || Number.isNaN(ref.getTime())) return 0;
  return Math.round((exp.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculatePlanPricing({
  regularPrice = 0,
  discountPercent = 0,
  taxPercent = 0,
  registrationFee = 0,
  joiningFee = 0,
}) {
  const base = Math.max(0, Number(regularPrice) || 0);
  const discPct = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  const taxPct = Math.max(0, Number(taxPercent) || 0);
  const regFee = Math.max(0, Number(registrationFee) || 0);
  const joinFee = Math.max(0, Number(joiningFee) || 0);

  const discountAmount = Number(((base * discPct) / 100).toFixed(2));
  const netPlanPrice = Math.max(0, Number((base - discountAmount).toFixed(2)));
  const taxAmount = Number(((netPlanPrice * taxPct) / 100).toFixed(2));
  const finalPlanPrice = Number((netPlanPrice + taxAmount).toFixed(2));
  const totalUpfrontPayable = Number((finalPlanPrice + regFee + joinFee).toFixed(2));

  return {
    regularPrice: base,
    discountPercent: discPct,
    discountAmount,
    netPlanPrice,
    taxPercent: taxPct,
    taxAmount,
    finalPlanPrice,
    registrationFee: regFee,
    joiningFee: joinFee,
    totalUpfrontPayable,
  };
}

export function calculateOfferDiscountAmount(subtotal, offer, planId = null) {
  if (!offer || offer.status !== 'active') return 0;
  if (planId && Array.isArray(offer.applicablePlans) && offer.applicablePlans.length > 0) {
    if (!offer.applicablePlans.includes('all') && !offer.applicablePlans.includes(planId)) {
      return 0;
    }
  }
  const amount = Math.max(0, Number(subtotal) || 0);
  if (offer.discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, Number(offer.percentageDiscount) || 0));
    return Number(((amount * pct) / 100).toFixed(2));
  }
  const fixed = Math.max(0, Number(offer.fixedDiscount) || 0);
  return Math.min(amount, fixed);
}

export function calculatePlanChangeAdjustment({
  currentMembership,
  newPlan,
  effectiveDate = REFERENCE_TODAY,
}) {
  if (!currentMembership || !newPlan) {
    return {
      changeType: 'upgrade',
      priceDifference: 0,
      proratedCredit: 0,
      adjustmentAmount: 0,
      newExpiryDate: effectiveDate,
    };
  }

  const currentPrice = Number(currentMembership.finalAmount || currentMembership.regularPrice || 0);
  const newPricing = calculatePlanPricing(newPlan);
  const newPrice = newPricing.finalPlanPrice;

  const totalCycleDays = Math.max(1, Number(currentMembership.durationDays) || 30);
  const remainingDays = Math.max(
    0,
    calculateRemainingDays(currentMembership.expiryDate, effectiveDate)
  );
  const proratedCredit = Number(((currentPrice / totalCycleDays) * Math.min(remainingDays, totalCycleDays)).toFixed(2));
  const priceDifference = Number((newPrice - currentPrice).toFixed(2));
  const adjustmentAmount = Number((newPrice - proratedCredit).toFixed(2));
  const newExpiryDate = calculateExpiryDate(effectiveDate, {
    durationType: newPlan.durationType,
    durationDays: newPlan.durationDays,
  });

  const changeType =
    newPrice > currentPrice ? 'upgrade' : newPrice < currentPrice ? 'downgrade' : 'lateral';

  return {
    changeType,
    currentPrice,
    newPrice,
    priceDifference,
    remainingDays,
    proratedCredit,
    adjustmentAmount,
    newExpiryDate,
  };
}

export function calculateFreezeDurationDays(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${endDateStr}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function calculateReviewedFreezeExpiry(currentExpiryDateStr, freezeDays) {
  const base = currentExpiryDateStr
    ? new Date(`${currentExpiryDateStr}T00:00:00`)
    : new Date(`${REFERENCE_TODAY}T00:00:00`);
  if (Number.isNaN(base.getTime())) return currentExpiryDateStr || REFERENCE_TODAY;
  const copy = new Date(base);
  copy.setDate(copy.getDate() + Math.max(0, Number(freezeDays) || 0));
  return toIsoDate(copy);
}

export function exportRowsToCsv(headers, rows, filename) {
  const csv = [headers, ...rows]
    .map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
