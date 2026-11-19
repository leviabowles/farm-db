## Summary

This PR fixes a regression where the waterfall chart displayed "No expenditure data for this year" - caused by an early return statement that prevented the transactions fetch from running when vendors weren't loaded yet.

## Changes

**File:** `react-frontend/src/components/ExpenditureWaterfall.js`

### Removed early return (line 51-53)
```javascript
// REMOVED:
if (Object.keys(vendors).length === 0) {
  return;
}
```

This was causing the function to exit before fetching transactions, resulting in no chart data.

### Added NaN check for amount (line 72-75)
```javascript
// Only process if amount is valid (not null/undefined/NaN)
if (isNaN(amount)) return;
```

This ensures transactions with `amount: null` are properly skipped.

## Testing

1. Refresh the dashboard at http://localhost:3000
2. The YTD Cash Flow Waterfall should display:
   - Total Received (income)
   - Expenses grouped by vendor
   - Net Balance

## Related

PR #129 had a similar fix for the amount field handling, this PR addresses a different regression in vendor loading timing.
