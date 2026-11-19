## Summary

This PR fixes the YTD Cash Flow Waterfall chart on the dashboard homepage which was not displaying any data.

## Root Cause

The `ExpenditureWaterfall` component was looking for `paid_amount` and `received_amount` fields on transactions, but these fields were removed from the Transaction model and replaced with a `TransactionLineItem` relationship structure.

The Transaction model now stores amounts in the `TransactionLineItem` table (exposed as the `amount` field in the serializer), and uses `trans_type` ('credit' for income, 'debit' for expense) to determine transaction type.

## Changes

**File:** `react-frontend/src/components/ExpenditureWaterfall.js`

```javascript
// OLD CODE (broken):
const paid = parseFloat(tx.paid_amount || 0);
const received = parseFloat(tx.received_amount || 0);

if (received > 0) {
  totalReceived += received;
}
if (paid > 0) {
  categoryTotals[category] = (categoryTotals[category] || 0) + paid;
}

// NEW CODE (fixed):
const amount = parseFloat(tx.amount || 0);

if (tx.trans_type === 'credit' && amount > 0) {
  totalReceived += amount;
} else if (tx.trans_type === 'debit' && amount > 0) {
  categoryTotals[category] = (categoryTotals[category] || 0) + amount;
}
```

## Testing

To test:
1. Navigate to the dashboard homepage at http://localhost:3000
2. Scroll to the "YTD CASH FLOW WATERFALL" section on the right side
3. The waterfall chart should now display:
   - Total Received (income from 'credit' transactions)
   - Expense categories (from 'debit' transactions)
   - Net Balance (final calculated value)
4. Colors should be:
   - Green for income ("TOTAL RECEIVED")
   - Green for net profit, Red for net loss ("NET BALANCE")
   - Red for expenses ("Other", etc.)

## Related

See PR #128 for the crop detail page fix that was merged earlier.